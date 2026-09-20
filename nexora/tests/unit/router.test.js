import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ProviderRegistry, MockProvider, collect, extractJson } from '../../packages/models/dist/index.js';
import { ModelRouter, CircuitBreaker, resolveCapabilities } from '../../packages/router/dist/index.js';

class FailingProvider {
  id = 'failing';
  capabilities = { supports: ['TEXT', 'CODE'], contextWindow: 1000 };
  async health() { return { ok: false, checkedAt: new Date().toISOString() }; }
  async *generate() { yield { type: 'error', error: 'always down' }; }
}

describe('router', () => {
  test('circuit breaker abre y se recupera', () => {
    const cb = new CircuitBreaker(2, 10_000);
    assert.equal(cb.state, 'closed');
    cb.recordFailure(); cb.recordFailure();
    assert.equal(cb.state, 'open');
    assert.equal(cb.canRequest(), false);
    cb.recordSuccess();
    assert.equal(cb.state, 'closed');
  });

  test('failover: si el primero falla usa el siguiente', async () => {
    const reg = new ProviderRegistry();
    reg.register(new FailingProvider());
    reg.register(new MockProvider('mock'));
    const router = new ModelRouter(reg, { maxRetries: 0, fallbackOrder: ['failing', 'mock'] });
    const r = await router.route({ messages: [{ role: 'user', content: 'hola' }], purpose: 'test' });
    assert.equal(r.providerId, 'mock');
    assert.ok(r.attempts.length >= 2);
    assert.ok(router.stats().failures >= 1);
  });

  test('pin fuerza un proveedor concreto', async () => {
    const reg = new ProviderRegistry().register(new MockProvider('mock'));
    const router = new ModelRouter(reg);
    const r = await router.route({ messages: [{ role: 'user', content: 'x' }] }, { pin: 'mock' });
    assert.equal(r.providerId, 'mock');
  });

  test('perfiles de routing resuelven capacidades', () => {
    assert.ok(resolveCapabilities({ profile: 'visual-critique' }).includes('VISION'));
    assert.ok(resolveCapabilities({ profile: 'code' }).includes('CODE'));
  });

  test('extractJson tolera fences', () => {
    assert.deepEqual(extractJson('texto ```json\n{"a":1}\n``` fin'), { a: 1 });
    assert.deepEqual(extractJson('{"b":[1,2]}'), { b: [1, 2] });
    assert.equal(extractJson('sin json'), null);
  });

  test('collect acumula deltas y uso', async () => {
    const p = new MockProvider('mock', [{ match: () => true, respond: () => 'hola mundo' }]);
    const r = await collect(p, { messages: [{ role: 'user', content: 'x' }] });
    assert.equal(r.text, 'hola mundo');
    assert.ok(r.inputTokens > 0);
  });
});
