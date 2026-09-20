#!/usr/bin/env node
/** Benchmark interno (plan §66). No decide nada por puntuación estética. */
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { bootstrap, Orchestrator } = await import(path.join(repoRoot, 'packages/orchestrator/dist/index.js'));
const { summarize } = await import(path.join(repoRoot, 'packages/telemetry/dist/index.js'));

const BRIEFS = [
  ['restaurant', 'Crea una web premium para una hamburguesería frente al mar, con menú y pedidos por WhatsApp'],
  ['saas', 'Crea una landing para una plataforma de automatización empresarial con precios'],
  ['ecommerce', 'Crea una tienda de tecnología online'],
  ['portfolio', 'Crea un portfolio para un diseñador 3D'],
];

process.env.NEXORA_LOG_SILENT = '1';
const runtime = await bootstrap({ repoRoot });
const records = [];

for (const [name, brief] of BRIEFS) {
  const outDir = await mkdtemp(path.join(tmpdir(), `nx-bench-${name}-`));
  const orchestrator = new Orchestrator(runtime);
  let firstPreview = 0;
  const t0 = Date.now();
  orchestrator.bus.on('phase', (p) => { if (p.phase === 'Prototyping' && !firstPreview) firstPreview = Date.now() - t0; });

  const { report } = await orchestrator.run({ brief, outDir, autonomy: 'autonomous', usePreviewServer: false });
  const open = report.issues.filter((i) => i.status === 'open').length;
  const fixed = report.issues.filter((i) => i.status === 'fixed').length;
  const stats = report.modelStats;

  records.push({
    project: name,
    timeToFirstPreviewMs: firstPreview,
    timeToWorkingSiteMs: report.durationMs,
    buildSuccess: report.gate.level !== 'Not verified',
    visualIssueCount: open,
    repairSuccessRate: fixed + open === 0 ? 1 : fixed / (fixed + open),
    regressionRate: 0,
    modelFailureRate: stats.calls ? (stats.failures ?? 0) / stats.calls : 0,
    tokenUsage: (stats.inputTokens ?? 0) + (stats.outputTokens ?? 0),
    costUsd: stats.costUsd ?? 0,
  });
}

console.log('\nBenchmark interno\n' + '─'.repeat(78));
console.log('proyecto        1er preview   sitio   issues  reparación  gate');
for (const r of records) {
  console.log(`${r.project.padEnd(14)} ${String(r.timeToFirstPreviewMs + 'ms').padStart(11)} ${String(r.timeToWorkingSiteMs + 'ms').padStart(8)} ${String(r.visualIssueCount).padStart(7)} ${String((r.repairSuccessRate * 100).toFixed(0) + '%').padStart(11)}  ${r.buildSuccess ? 'ok' : 'FAIL'}`);
}
console.log('─'.repeat(78));
console.log(JSON.stringify(summarize(records), null, 2));
