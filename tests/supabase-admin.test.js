import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const server = fs.readFileSync(new URL('../server.js', import.meta.url), 'utf8');
const source = server.slice(server.indexOf('let supabaseAdmin = null;'), server.indexOf('// Initialize PDF Processor'));

function initialize(env) {
    const calls = [];
    const context = vm.createContext({ process: { env }, createClient: (...args) => {
        calls.push(args);
        return { ready: true };
    }});
    vm.runInContext(source, context);
    return { get: () => context.getSupabaseAdmin(), calls };
}

test('production service-key alias supports admin client and caches it', () => {
    const client = initialize({ NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_KEY: 'test-legacy-key' });
    assert.equal(client.get(), client.get());
    assert.equal(client.calls.length, 1);
    assert.equal(client.calls[0][1], 'test-legacy-key');
    assert.equal(client.calls[0][2].auth.persistSession, false);
});

test('standard service-role variable takes precedence', () => {
    const client = initialize({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-standard-key', SUPABASE_SERVICE_KEY: 'test-legacy-key' });
    client.get();
    assert.equal(client.calls[0][1], 'test-standard-key');
});

test('missing admin key fails instead of using public credentials', () => {
    const client = initialize({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'public-key' });
    assert.throws(client.get, /SUPABASE_SERVICE_ROLE_KEY/);
    assert.equal(client.calls.length, 0);
});
