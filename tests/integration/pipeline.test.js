import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeIntent, buildDesignSystem, generateDirections } from '../../packages/design-engine/dist/index.js';
import { generateSite, repair, applyPatches, exportToDir } from '../../packages/code-engine/dist/index.js';
import { runQaPipeline } from '../../packages/qa/dist/index.js';
import { ScopedFs } from '../../packages/core/dist/index.js';
import { scanProject, buildProjectMap } from '../../packages/project-engine/dist/index.js';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const tmp = () => mkdtemp(path.join(tmpdir(), 'nx-int-'));

describe('integración: design → code → qa', () => {
  test('el sitio generado pasa QA sin issues críticos ni altos', async () => {
    const brief = 'Crea una web premium para una hamburguesería frente al mar con menú y pedidos por WhatsApp';
    const intent = analyzeIntent(brief);
    const ds = buildDesignSystem(intent, generateDirections(intent, 1)[0], brief);
    const files = generateSite({ intent, designSystem: ds, projectName: 'Marea', brief });
    const fs = new ScopedFs(await tmp());
    const report = await runQaPipeline({ files, designSystem: ds, features: intent.features, primaryAction: intent.primaryAction, fs });

    const blocking = report.issues.filter((i) => i.severity === 'critical' || i.severity === 'high');
    assert.deepEqual(blocking.map((i) => i.title), [], 'issues bloqueantes en el sitio generado');
    assert.ok(report.scores.overall >= 90, `score bajo: ${report.scores.overall}`);
    assert.notEqual(report.gate.level, 'Not verified');
  });

  test('cada skill de industria produce un sitio que cumple sus validaciones', async () => {
    const briefs = [
      ['Crea una tienda de tecnología online con carrito', 'ecommerce'],
      ['Crea una landing para una plataforma de automatización empresarial con precios', 'saas'],
      ['Crea un portfolio para un diseñador 3D', 'portfolio'],
    ];
    for (const [brief, expected] of briefs) {
      const intent = analyzeIntent(brief);
      assert.equal(intent.industry, expected, `industria mal detectada en: ${brief}`);
      const ds = buildDesignSystem(intent, generateDirections(intent, 1)[0], brief);
      const files = generateSite({ intent, designSystem: ds, projectName: 'Test', brief });
      const fs = new ScopedFs(await tmp());
      const report = await runQaPipeline({ files, designSystem: ds, features: intent.features, primaryAction: intent.primaryAction, fs });
      const critical = report.issues.filter((i) => i.severity === 'critical');
      assert.deepEqual(critical.map((i) => i.title), [], `críticos en ${expected}`);
    }
  });

  test('el motor de reparación arregla un sitio roto y se puede verificar', async () => {
    const broken = [
      { path: 'index.html', contents: '<!doctype html><html><head><title>x</title></head><body><main><img src="a.png"><a href="http://x.com" target="_blank">ir</a></main></body></html>' },
      { path: 'styles.css', contents: 'body{color:#111}' },
    ];
    const fs = new ScopedFs(await tmp());
    const intent = analyzeIntent('web simple de contacto');
    const before = await runQaPipeline({ files: broken, features: [], primaryAction: 'Contactar', fs });
    assert.ok(before.issues.length > 0);

    const fixed = repair(broken, before.issues);
    assert.ok(fixed.fixed.length > 0, 'no se reparó nada');
    const after = await runQaPipeline({ files: fixed.files, features: [], primaryAction: 'Contactar', fs });
    assert.ok(after.issues.length < before.issues.length, `no mejoró: ${before.issues.length} → ${after.issues.length}`);
    assert.match(fixed.files[0].contents, /lang="es"/);
    assert.match(fixed.files[0].contents, /alt=""/);
    assert.match(fixed.files[0].contents, /noopener/);
    assert.match(fixed.files[1].contents, /@media/, 'no se añadieron media queries');
  });

  test('applyPatches reporta parches fallidos en lugar de fingir', () => {
    const r = applyPatches([{ path: 'a.txt', contents: 'hola' }], [
      { path: 'a.txt', find: 'hola', replace: 'adios', description: 'ok' },
      { path: 'a.txt', find: 'inexistente', replace: 'x', description: 'debe fallar' },
      { path: 'no-existe.txt', find: 'x', replace: 'y', description: 'archivo ausente' },
    ]);
    assert.equal(r.applied.length, 1);
    assert.equal(r.failed.length, 2);
  });

  test('scan + project map sobre el proyecto generado (existing project mode)', async () => {
    const brief = 'web para una cafetería con menú';
    const intent = analyzeIntent(brief);
    const ds = buildDesignSystem(intent, generateDirections(intent, 1)[0], brief);
    const files = generateSite({ intent, designSystem: ds, projectName: 'Cafe', brief });
    const fs = new ScopedFs(await tmp());
    await exportToDir(files, fs, '.');

    const scan = await scanProject(fs);
    assert.equal(scan.framework, 'static');
    assert.ok(scan.entryPoints.includes('index.html'));
    const map = await buildProjectMap(fs, scan);
    assert.ok(map.nodes.length >= 4);
    assert.equal(map.nodes[0].type, 'page');
    assert.ok(map.nodes[0].importance > 1);
  });
});
