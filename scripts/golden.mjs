#!/usr/bin/env node
/**
 * Golden projects (plan §65): comprueba que una versión nueva no degrada NEXORA.
 * Falla con código 1 si algún proyecto deja de cumplir sus expectativas.
 */
import { readdir, readFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { analyzeIntent, buildDesignSystem, generateDirections } = await import(path.join(repoRoot, 'packages/design-engine/dist/index.js'));
const { generateSite } = await import(path.join(repoRoot, 'packages/code-engine/dist/index.js'));
const { runQaPipeline } = await import(path.join(repoRoot, 'packages/qa/dist/index.js'));
const { scanProject, buildProjectMap } = await import(path.join(repoRoot, 'packages/project-engine/dist/index.js'));
const { ScopedFs } = await import(path.join(repoRoot, 'packages/core/dist/index.js'));

const goldenDir = path.join(repoRoot, 'examples/golden');
const entries = (await readdir(goldenDir, { withFileTypes: true })).filter((e) => e.isDirectory());

let failures = 0;
const rows = [];

for (const entry of entries) {
  const dir = path.join(goldenDir, entry.name);
  const expected = JSON.parse(await readFile(path.join(dir, 'expected.json'), 'utf8'));
  const briefMd = await readFile(path.join(dir, 'brief.md'), 'utf8');
  // El brief canónico va en una valla ```brief; si no existe, se usa la primera cita.
  const brief = (briefMd.match(/```brief\n([\s\S]*?)```/)?.[1] ?? briefMd.match(/^>\s*(.+)$/m)?.[1] ?? '').trim();
  const problems = [];

  if (expected.mode === 'scan') {
    const i = analyzeIntent('web para una cafetería con menú');
    const ds = buildDesignSystem(i, generateDirections(i, 1)[0], 'x');
    const files = generateSite({ intent: i, designSystem: ds, projectName: 'Scan', brief: 'x' });
    const fs = new ScopedFs(await mkdtemp(path.join(tmpdir(), 'nx-gold-')));
    for (const f of files) await fs.write(f.path, f.contents);
    const scan = await scanProject(fs);
    const map = await buildProjectMap(fs, scan);
    if (scan.framework !== expected.expect.framework) problems.push(`framework ${scan.framework} != ${expected.expect.framework}`);
    if (map.nodes.length < expected.expect.minNodes) problems.push(`nodos ${map.nodes.length} < ${expected.expect.minNodes}`);
    for (const ep of expected.expect.entryPointsInclude) if (!scan.entryPoints.includes(ep)) problems.push(`falta entry point ${ep}`);
    rows.push({ project: entry.name, issues: 0, score: '-', ok: problems.length === 0, problems });
    if (problems.length) failures++;
    continue;
  }

  const intent = analyzeIntent(brief);
  if (expected.intent.industry && intent.industry !== expected.intent.industry) {
    problems.push(`industria "${intent.industry}" != "${expected.intent.industry}"`);
  }
  if (expected.intent.primaryAction && intent.primaryAction !== expected.intent.primaryAction) {
    problems.push(`acción "${intent.primaryAction}" != "${expected.intent.primaryAction}"`);
  }
  for (const f of expected.features ?? []) if (!intent.features.includes(f)) problems.push(`falta feature ${f}`);

  const ds = buildDesignSystem(intent, generateDirections(intent, 1)[0], brief);
  const files = generateSite({ intent, designSystem: ds, projectName: 'Golden', brief });
  const html = files.find((f) => f.path === 'index.html').contents;

  for (const re of expected.html?.mustMatch ?? []) if (!new RegExp(re).test(html)) problems.push(`HTML no cumple /${re}/`);
  for (const re of expected.html?.mustNotMatch ?? []) if (new RegExp(re, 'i').test(html)) problems.push(`HTML contiene prohibido /${re}/`);
  for (const s of expected.structure?.requiredSections ?? []) if (!html.includes(`id="${s}"`)) problems.push(`falta sección #${s}`);
  for (const el of expected.structure?.requiredElements ?? []) if (!new RegExp(`<${el}[\\s>]`).test(html)) problems.push(`falta elemento <${el}>`);

  const fs = new ScopedFs(await mkdtemp(path.join(tmpdir(), 'nx-gold-')));
  const report = await runQaPipeline({ files, designSystem: ds, features: intent.features, primaryAction: intent.primaryAction, fs });
  const critical = report.issues.filter((i) => i.severity === 'critical').length;
  const high = report.issues.filter((i) => i.severity === 'high').length;
  if (critical > (expected.qa?.maxCritical ?? 0)) problems.push(`${critical} issues críticos`);
  if (high > (expected.qa?.maxHigh ?? 0)) problems.push(`${high} issues altos`);
  if (report.scores.overall < (expected.qa?.minOverallScore ?? 0)) problems.push(`score ${report.scores.overall} < ${expected.qa.minOverallScore}`);

  rows.push({ project: entry.name, issues: report.issues.length, score: report.scores.overall, ok: problems.length === 0, problems });
  if (problems.length) failures++;
}

console.log('\nGolden projects\n' + '─'.repeat(70));
for (const r of rows) {
  console.log(`${r.ok ? '✅' : '❌'} ${r.project.padEnd(20)} issues:${String(r.issues).padStart(3)}  score:${String(r.score).padStart(4)}`);
  for (const p of r.problems) console.log(`     └─ ${p}`);
}
console.log('─'.repeat(70));
console.log(`${rows.length - failures}/${rows.length} golden projects OK\n`);
process.exit(failures ? 1 : 0);
