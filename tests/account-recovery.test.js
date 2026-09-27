import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(new URL(`../public/js/${path}`, import.meta.url), 'utf8');
function setup(auth = {}) {
    const elements = new Map();
    const get = id => {
        if (!elements.has(id)) elements.set(id, {
            value: '', disabled: false, children: [], classes: new Set(),
            classList: { add(name) { get(id).classes.add(name); }, remove(name) { get(id).classes.delete(name); } },
            replaceChildren(...children) { this.children = children; },
            reset() { this.wasReset = true; }, addEventListener() {}
        });
        return elements.get(id);
    };
    const timers = [];
    const context = vm.createContext({
        URLSearchParams, setTimeout: fn => timers.push(fn),
        localStorage: { removeItem() {} },
        window: {
            location: { hash: '', search: '' },
            TUTOR_CONFIG: { authRedirectUrl: 'https://tutor-omega-seven.vercel.app/login.html' },
            initializeSupabaseClient: async () => ({ auth })
        },
        document: { getElementById: get, createElement: () => ({}), addEventListener() {} }
    });
    vm.runInContext(read('accountRecovery.js'), context);
    return { context, get, timers, message: () => get('alert-container').children[0] };
}

test('reset request uses registered email and existing login callback', async () => {
    let request;
    const s = setup({ resetPasswordForEmail: async (...args) => { request = args; return {}; } });
    s.get('email').value = ' student@example.com ';
    await s.context.requestAccountEmail('recovery');
    assert.equal(request[0], 'student@example.com');
    assert.equal(request[1].redirectTo, 'https://tutor-omega-seven.vercel.app/login.html');
    assert.match(s.message().textContent, /password reset email has been sent/);
    assert.equal(s.get('forgotPasswordBtn').disabled, true);
    s.timers[0]();
    assert.equal(s.get('forgotPasswordBtn').disabled, false);
});

test('confirmation resend uses signup type and email redirect', async () => {
    let request;
    const s = setup({ resend: async args => { request = args; return {}; } });
    s.get('email').value = 'student@example.com';
    await s.context.requestAccountEmail('signup');
    assert.equal(request.type, 'signup');
    assert.equal(request.options.emailRedirectTo, 'https://tutor-omega-seven.vercel.app/login.html');
    assert.match(s.message().textContent, /confirmation email has been sent/);
});

test('invalid email and mail-provider failures never report success', async () => {
    const s = setup({ resend: async () => ({ error: { message: 'Email rate limit exceeded' } }) });
    s.get('email').value = '12345';
    await s.context.requestAccountEmail('signup');
    assert.match(s.message().textContent, /registered email/);
    s.get('email').value = 'student@example.com';
    await s.context.requestAccountEmail('signup');
    assert.match(s.message().textContent, /Email rate limit exceeded/);
    assert.equal(s.message().className, 'alert alert-error');
    assert.equal(s.get('resendConfirmationBtn').disabled, false);
});

test('recovery callback reveals reset form only with valid session', async () => {
    for (const session of [null, { user: { id: 'student' } }]) {
        const s = setup({ getSession: async () => ({ data: { session } }) });
        s.get('resetPasswordForm').classes.add('hidden');
        s.context.window.location.hash = '#type=recovery&access_token=test';
        vm.runInContext(read('loginCallback.js'), s.context);
        s.context.window.location.hash = '';
        await s.context.showLoginCallbackResult();
        assert.equal(s.get('resetPasswordForm').classes.has('hidden'), !session);
        assert.equal(s.get('loginForm').classes.has('hidden'), Boolean(session));
    }
});

test('matching password updates Supabase then returns to login', async () => {
    let updated;
    let signedOut = false;
    const s = setup({
        getSession: async () => ({ data: { session: {} } }),
        updateUser: async payload => { updated = payload.password; return {}; },
        signOut: async () => { signedOut = true; return {}; }
    });
    s.get('newPassword').value = s.get('confirmNewPassword').value = 'test-password-123';
    await s.context.saveRecoveredPassword({ preventDefault() {} });
    assert.equal(updated, 'test-password-123');
    assert.equal(signedOut, true);
    assert.ok(s.get('resetPasswordForm').wasReset);
    assert.match(s.message().textContent, /Password updated successfully/);
});

test('mismatch and expired sessions do not update password', async () => {
    let updated = false;
    const s = setup({
        getSession: async () => ({ data: { session: null } }),
        updateUser: async () => { updated = true; return {}; }
    });
    s.get('newPassword').value = 'test-password-123';
    s.get('confirmNewPassword').value = 'different';
    await s.context.saveRecoveredPassword({ preventDefault() {} });
    assert.match(s.message().textContent, /do not match/);
    s.get('confirmNewPassword').value = 'test-password-123';
    await s.context.saveRecoveredPassword({ preventDefault() {} });
    assert.match(s.message().textContent, /expired/);
    assert.equal(updated, false);
});
