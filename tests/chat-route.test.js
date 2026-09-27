import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../server.js', import.meta.url), 'utf8');
const start = source.indexOf("app.post('/api/chat',");
const end = source.indexOf('// NEW: API endpoint', start);

async function request(body, result = { choices: [{ message: { content: 'An explanation' } }], usage: { prompt_tokens: 10, completion_tokens: 20 } }) {
    let handler;
    let payload;
    let status = 200;
    let response;
    const context = vm.createContext({
        app: { post: (_, fn) => { handler = fn; } },
        console: { warn() {}, error() {} },
        getPDFProcessor: async () => { throw new Error('Textbook unavailable'); },
        getOpenAI: () => ({ chat: { completions: { create: async value => { payload = value; return result; } } } })
    });
    vm.runInContext(source.slice(start, end), context);
    const res = { status(value) { status = value; return this; }, json(value) { response = value; } };
    await handler({ body }, res);
    return { status, response, payload };
}

test('dashboard single-message requests return answer and token counts', async () => {
    const result = await request({ message: 'Explain fractions', grade: '6', subject: 'Math' });
    assert.equal(result.status, 200);
    assert.equal(result.response.response, 'An explanation');
    assert.equal(result.response.usage.input_tokens, 10);
    assert.equal(result.response.usage.output_tokens, 20);
    assert.equal(result.payload.messages.at(-1).content, 'Explain fractions');
});

test('existing conversation format stays supported without usage metadata', async () => {
    const result = await request({ messages: [{ role: 'user', content: 'Hello' }] }, { choices: [{ message: { content: 'Hi' } }] });
    assert.equal(result.status, 200);
    assert.equal(result.response.usage.input_tokens, 0);
});

test('empty and malformed requests do not call the provider', async () => {
    for (const body of [undefined, {}, { message: ' ' }, { messages: [null, {}, { role: 'user', content: '' }] }, { messages: 'bad' }]) {
        const result = await request(body);
        assert.equal(result.status, 400);
        assert.equal(result.payload, undefined);
    }
});
