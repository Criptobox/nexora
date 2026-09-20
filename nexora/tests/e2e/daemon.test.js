import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 7799;
let proc;

describe('E2E — daemon HTTP', () => {
  before(async () => {
    proc = spawn('node', [path.join(repoRoot, 'apps/daemon/dist/index.js')], {
      env: { ...process.env, PORT: String(PORT), NEXORA_LOG_SILENT: '1' }, stdio: 'ignore',
    });
    for (let i = 0; i < 40; i++) {
      try { await fetch(`http://127.0.0.1:${PORT}/api/health`); return; } catch { await new Promise((r) => setTimeout(r, 150)); }
    }
    throw new Error('el daemon no arrancó');
  });

  after(() => proc?.kill());

  test('/api/health responde con estado del runtime', async () => {
    const r = await (await fetch(`http://127.0.0.1:${PORT}/api/health`)).json();
    assert.equal(r.ok, true);
    assert.ok(r.providers.includes('mock'));
    assert.ok(r.skills >= 13);
    assert.ok(r.agents.includes('qa'));
  });

  test('/api/plan devuelve intención, discovery y direcciones', async () => {
    const r = await (await fetch(`http://127.0.0.1:${PORT}/api/plan`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ brief: 'web para una hamburguesería con menú y WhatsApp' }),
    })).json();
    assert.equal(r.intent.industry, 'restaurant');
    assert.equal(r.directions.length, 3);
  });

  test('sirve la UI del estudio', async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/`);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /NEXORA/);
  });

  test('un run completo entrega preview servible', async () => {
    const start = await (await fetch(`http://127.0.0.1:${PORT}/api/runs`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ brief: 'Crea una web para una cafetería con menú', autonomy: 'autonomous' }),
    })).json();
    assert.ok(start.id);

    let run;
    for (let i = 0; i < 100; i++) {
      run = await (await fetch(`http://127.0.0.1:${PORT}/api/runs/${start.id}`)).json();
      if (run.status !== 'running') break;
      await new Promise((r) => setTimeout(r, 200));
    }
    assert.equal(run.status, 'done');
    const preview = await fetch(`http://127.0.0.1:${PORT}/preview/${start.id}/index.html`);
    assert.equal(preview.status, 200);
    assert.match(await preview.text(), /<h1/);
  });
});
