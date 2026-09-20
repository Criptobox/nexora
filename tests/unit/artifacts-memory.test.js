import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ArtifactStore, parseArtifactFiles } from '../../packages/artifacts/dist/index.js';
import { ProjectMemory } from '../../packages/memory/dist/index.js';
import { ScopedFs } from '../../packages/core/dist/index.js';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const tmp = () => mkdtemp(path.join(tmpdir(), 'nx-am-'));

describe('artifacts & memory', () => {
  test('parseArtifactFiles soporta fences y tags', () => {
    const files = parseArtifactFiles('```file:index.html\n<h1>a</h1>\n```\n<nexora-file path="styles.css">\nbody{}\n</nexora-file>');
    assert.equal(files.length, 2);
    assert.equal(files[0].path, 'index.html');
    assert.equal(files[1].path, 'styles.css');
  });

  test('parseArtifactFiles bloquea path traversal', () => {
    const files = parseArtifactFiles('```file:../../etc/passwd.txt\nx\n```');
    assert.ok(!files[0].path.includes('..'));
  });

  test('artifact store versiona y no sobrescribe', async () => {
    const fs = new ScopedFs(await tmp());
    const store = new ArtifactStore(fs);
    const a = await store.save({ id: 'site', type: 'web', source: 'test', project: 'p', files: [{ path: 'index.html', contents: '<h1>v1</h1>' }] });
    assert.equal(a.version, '0.1.0');
    const b = await store.save({ id: 'site', type: 'web', source: 'test', project: 'p', files: [{ path: 'index.html', contents: '<h1>v2</h1>' }] });
    assert.equal(b.version, '0.2.0');
    await assert.rejects(store.save({ id: 'site', version: '0.1.0', type: 'web', source: 't', project: 'p', files: [] }), /refusing to overwrite/);
    const latest = await store.latest('site');
    assert.match(latest.files[0].contents, /v2/);
  });

  test('memoria recuerda decisiones y produce bloque de contexto', async () => {
    const fs = new ScopedFs(await tmp());
    const mem = new ProjectMemory(fs);
    await mem.remember({ kind: 'design', decision: 'Botones con radius 10px', reason: 'Consistencia', doNot: 'botones pill', source: 'user' });
    const recalled = await mem.recall('design');
    assert.equal(recalled.length, 1);
    const block = await mem.contextBlock();
    assert.match(block, /radius 10px/);
    assert.match(block, /NO: botones pill/);
  });

  test('extrae preferencias del lenguaje natural', () => {
    const prefs = ProjectMemory.extractPreferences('No uses botones pill y nunca pongas carruseles');
    assert.ok(prefs.some((p) => /pill/.test(p.decision)));
    assert.ok(prefs.some((p) => /carrusel/.test(p.decision)));
  });
});
