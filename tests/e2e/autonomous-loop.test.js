import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { bootstrap, Orchestrator } from '../../packages/orchestrator/dist/index.js';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('E2E — autonomous loop completo', () => {
  test('brief → diseño → prototipo → código → ejecución → QA → entrega', async () => {
    const outDir = await mkdtemp(path.join(tmpdir(), 'nx-e2e-'));
    const runtime = await bootstrap({ repoRoot });
    const orchestrator = new Orchestrator(runtime);

    const phases = [];
    orchestrator.bus.on('phase', (p) => phases.push(p.phase));

    const outcome = await orchestrator.run({
      brief: 'Crea una web premium para una hamburguesería frente al mar, juvenil pero elegante, con menú y pedidos por WhatsApp',
      outDir, autonomy: 'autonomous', usePreviewServer: false,
    });

    // 1. Se recorrieron las fases del plan
    for (const p of ['Understanding', 'Planning', 'Designing', 'Prototyping', 'Coding', 'Running', 'Testing']) {
      assert.ok(phases.includes(p), `falta la fase ${p}`);
    }

    // 2. Todas las tareas terminaron sin fallos
    const failed = outcome.report.tasks.filter((t) => t.status === 'failed');
    assert.deepEqual(failed, [], 'tareas fallidas');

    // 3. Artefactos en disco
    const html = await readFile(path.join(outDir, 'site/index.html'), 'utf8');
    const css = await readFile(path.join(outDir, 'site/styles.css'), 'utf8');
    const design = await readFile(path.join(outDir, 'DESIGN.md'), 'utf8');
    const report = await readFile(path.join(outDir, 'REPORT.md'), 'utf8');
    await readFile(path.join(outDir, 'prototype/prototype.html'), 'utf8');
    await readFile(path.join(outDir, 'tokens.json'), 'utf8');

    // 4. El sitio cumple los requisitos del brief
    assert.match(html, /<h1/);
    assert.match(html, /name="viewport"/);
    assert.match(html, /wa\.me/, 'falta el pedido por WhatsApp');
    assert.match(html, /id="menu"/, 'falta la sección de menú');
    assert.match(html, /€\d/, 'el menú no tiene precios');
    assert.match(html, /<main/);
    assert.match(css, /@media/);
    assert.match(css, /prefers-reduced-motion/);
    assert.match(css, /--color-accent/);

    // 5. El DESIGN.md guía el resultado
    assert.match(design, /## 1\. Identity/);
    assert.match(design, /Anti-patterns/);

    // 6. La verificación es honesta: nunca "Verified" sin evidencia
    assert.ok(['Verified', 'Partially verified', 'Tested', 'Not verified'].includes(outcome.report.gate.level));
    if (outcome.report.gate.level === 'Verified') {
      assert.equal(outcome.report.gate.unverified.length, 0);
      assert.equal(outcome.report.gate.blocking.length, 0);
    }
    assert.match(report, /Estado de verificación/);

    // 7. Sin issues bloqueantes abiertos
    const blocking = outcome.report.issues.filter((i) => i.status === 'open' && (i.severity === 'critical' || i.severity === 'high'));
    assert.deepEqual(blocking.map((i) => i.title), []);
  });

  test('el loop de reparación está acotado y no entra en bucle infinito', async () => {
    const outDir = await mkdtemp(path.join(tmpdir(), 'nx-e2e2-'));
    const runtime = await bootstrap({ repoRoot });
    const outcome = await new Orchestrator(runtime).run({
      brief: 'Crea una landing para una plataforma de automatización empresarial con precios',
      outDir, autonomy: 'autonomous', maxIterations: 2, usePreviewServer: false,
    });
    assert.ok(outcome.report.iterations <= 2, `iteraciones = ${outcome.report.iterations}`);
    assert.ok(outcome.report.durationMs < 60_000);
  });

  test('cancelación vía AbortSignal se respeta', async () => {
    const outDir = await mkdtemp(path.join(tmpdir(), 'nx-e2e3-'));
    const runtime = await bootstrap({ repoRoot });
    const controller = new AbortController();
    controller.abort();
    const outcome = await new Orchestrator(runtime).run({
      brief: 'web de prueba', outDir, autonomy: 'autonomous', usePreviewServer: false, signal: controller.signal,
    });
    assert.ok(outcome.report.tasks.some((t) => t.status === 'cancelled'));
  });
});
