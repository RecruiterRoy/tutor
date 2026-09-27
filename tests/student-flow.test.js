import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const dashboard = read('public/student-dashboard.html');

test('confirmation links use the current web origin and Vercel for native origins', () => {
    for (const origin of ['https://tutor-omega-seven.vercel.app', 'http://localhost:3000', 'https://tution.app', 'https://preview.vercel.app']) {
        const context = vm.createContext({ window: { location: new URL(origin) } });
        vm.runInContext(read('public/js/config.js'), context);
        assert.equal(context.window.TUTOR_CONFIG.authRedirectUrl, `${origin}/login.html`);
    }
    const context = vm.createContext({ window: { location: new URL('capacitor://localhost') } });
    vm.runInContext(read('public/js/config.js'), context);
    assert.equal(context.window.TUTOR_CONFIG.authRedirectUrl, 'https://tutor-omega-seven.vercel.app/login.html');
});

async function callbackResult(hash, search, session) {
    let alert;
    const context = vm.createContext({ URLSearchParams, window: {
        location: { hash, search },
        initializeSupabaseClient: async () => ({ auth: { getSession: async () => ({ data: { session }, error: null }) } })
    }, document: {
        addEventListener() {},
        createElement: () => ({}),
        getElementById: () => ({ replaceChildren: element => { alert = element; } })
    }});
    vm.runInContext(read('public/js/loginCallback.js'), context);
    // Simulate Supabase clearing callback tokens before DOMContentLoaded.
    context.window.location.hash = '';
    await context.showLoginCallbackResult();
    return alert;
}

test('confirmed email displays success after Supabase consumes callback URL', async () => {
    const alert = await callbackResult('#type=signup&access_token=test', '', { user: { id: 'student' } });
    assert.equal(alert.className, 'alert alert-success');
    assert.match(alert.textContent, /Email verified/);
});

test('expired confirmation links display their error as text', async () => {
    const alert = await callbackResult('', '?error_description=%3Cexpired%3E', null);
    assert.equal(alert.className, 'alert alert-error');
    assert.match(alert.textContent, /<expired>/);
    assert.equal(alert.innerHTML, undefined);
});

test('confirmation without a session does not falsely report success', async () => {
    const alert = await callbackResult('#type=signup', '', null);
    assert.equal(alert.className, 'alert alert-error');
    assert.equal(await callbackResult('', '', null), undefined);
});

test('student pages and legacy dashboard have valid inline JavaScript', () => {
    for (const page of ['index', 'student-register', 'login', 'student-dashboard', 'dashboard']) {
        for (const match of read(`public/${page}.html`).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
            if (!match[1].includes('src=') && match[2].trim()) new vm.Script(match[2], { filename: page });
        }
    }
});

test('client initialization survives page-level helper replacement', async () => {
    let creations = 0;
    const client = {};
    const context = vm.createContext({ console, window: {
        TUTOR_CONFIG: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'public-key' },
        addEventListener() {}
    }});
    vm.runInContext(read('public/js/supabaseClient.js'), context);
    context.window.supabase = { createClient() { creations++; return client; } };
    vm.runInContext('getSupabaseClient = () => initializeSupabaseClient()', context);
    assert.equal(await vm.runInContext('initializeSupabaseClient()', context), client);
    assert.equal(await vm.runInContext('initializeSupabaseClient()', context), client);
    assert.equal(creations, 1);
});

async function initialize(authResult, failSection = false) {
    const calls = [];
    const context = vm.createContext({
        console, setTimeout() {},
        document: { getElementById() { return null; } },
        window: { location: { href: '' }, initializeSupabaseClient: async () => ({ auth: { getUser: async () => authResult } }) },
        showNotification: () => calls.push('notice')
    });
    for (const name of ['setupMobileSidebar', 'loadUserData', 'loadDashboardProgress', 'loadTeacherPreferences', 'loadChatHistory', 'loadAssessmentHistory', 'loadHomework', 'loadBooks', 'loadEducationalVideos', 'loadUserSubjects', 'loadDashboardSettings', 'initializeAIServices', 'initializeChat', 'initializeDailyQuiz', 'initializeAssessment', 'initializeStudyMaterials', 'initializeProfile', 'initializeSettings', 'showWelcomeMessage', 'logout']) {
        context[name] = () => { calls.push(name); return Promise.resolve(); };
    }
    if (failSection) context.loadHomework = async () => { throw new Error('Database unavailable'); };
    const start = dashboard.indexOf('async function initializeDashboard()');
    const end = dashboard.indexOf('// Setup mobile sidebar functionality', start);
    vm.runInContext(dashboard.slice(start, end), context);
    let error;
    try { await context.initializeDashboard(); } catch (caught) { error = caught; }
    return { context, calls, error };
}

test('valid student session continues when a learning section fails', async () => {
    const result = await initialize({ data: { user: { id: 'student' } }, error: null }, true);
    assert.equal(result.error, undefined);
    assert.equal(result.context.window.location.href, '');
    assert.ok(result.calls.includes('initializeChat'));
    assert.ok(result.calls.includes('notice'));
});

test('missing session returns to login', async () => {
    const result = await initialize({ data: { user: null }, error: { name: 'AuthSessionMissingError' } });
    assert.equal(result.context.window.location.href, 'login.html');
    assert.ok(!result.calls.includes('loadUserData'));
});

test('temporary authentication outage does not redirect to login', async () => {
    const result = await initialize({ data: { user: null }, error: { status: 503 } });
    assert.equal(result.context.window.location.href, '');
    assert.equal(result.error.status, 503);
});

test('Vercel routes preserve student flow and existing dashboard', () => {
    const { routes } = JSON.parse(read('vercel.json'));
    const route = url => routes.find(item => new RegExp(`^${item.src}$`).test(url)).dest;
    assert.equal(route('/'), '/public/index.html');
    assert.equal(route('/register'), '/public/student-register.html');
    assert.equal(route('/register.html'), '/public/student-register.html');
    assert.equal(route('/login'), '/public/login.html');
    assert.equal(route('/student-dashboard'), '/public/student-dashboard.html');
    assert.equal(route('/api/register-student'), '/server.js');
    assert.equal(route('/dashboard.html'), '/public/$1');
});
