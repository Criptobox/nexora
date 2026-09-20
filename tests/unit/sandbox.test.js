import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Sandbox, DEFAULT_POLICY, sanitizeEnv, redactSecrets } from '../../packages/sandbox/dist/index.js';
import { tmpdir } from 'node:os';

describe('sandbox (security)', () => {
  const sandbox = new Sandbox({ ...DEFAULT_POLICY, root: tmpdir() });

  test('bloquea binarios fuera de la allowlist', () => {
    assert.throws(() => sandbox.assertAllowed('bash', ['-c', 'ls']), /not allowed/);
    assert.throws(() => sandbox.assertAllowed('curl', ['http://x']), /not allowed/);
  });

  test('bloquea patrones destructivos', () => {
    assert.throws(() => sandbox.assertAllowed('node', ['-e', 'rm -rf /']), /denied pattern/);
    assert.throws(() => sandbox.assertAllowed('git', ['config', '--get', '~/.ssh/id_rsa']), /denied pattern/);
  });

  test('permite comandos válidos y ejecuta', async () => {
    const r = await sandbox.exec('node', ['-e', 'console.log("ok")']);
    assert.equal(r.code, 0);
    assert.match(r.stdout, /ok/);
  });

  test('aplica timeout', async () => {
    const r = await sandbox.exec('node', ['-e', 'setTimeout(()=>{},5000)'], { timeoutMs: 300 });
    assert.equal(r.timedOut, true);
  });

  test('no propaga secretos al proceso hijo', () => {
    const env = sanitizeEnv({ OPENAI_API_KEY: 'sk-secret', PATH: '/usr/bin', MY_TOKEN: 'x' }, DEFAULT_POLICY);
    assert.equal(env.OPENAI_API_KEY, undefined);
    assert.equal(env.MY_TOKEN, undefined);
    assert.equal(env.PATH, '/usr/bin');
    assert.equal(env.NEXORA_SANDBOX, '1');
  });

  test('redacta secretos en la salida', () => {
    assert.match(redactSecrets('key=sk-abcdefghijk'), /REDACTED/);
    assert.match(redactSecrets('Authorization: Bearer abcdefghijklmn'), /REDACTED/);
  });

  test('política de red por defecto solo permite localhost', () => {
    assert.equal(sandbox.isHostAllowed('localhost'), true);
    assert.equal(sandbox.isHostAllowed('evil.com'), false);
  });
});
