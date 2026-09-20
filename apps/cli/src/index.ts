#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootstrap, Orchestrator } from '@nexora/orchestrator';
import { scanProject, buildProjectMap, Project } from '@nexora/project-engine';
import { analyzeIntent, planDiscovery, generateDirections } from '@nexora/design-engine';
import { ScopedFs, createLogger, NEXORA_VERSION } from '@nexora/core';
import { serveStatic } from '@nexora/execution';

const log = createLogger('cli');
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const HELP = `
NEXORA v${NEXORA_VERSION} — AI Web Creation Engine

Uso:
  nexora create "<brief>" [opciones]     Ejecuta el loop completo: diseño → código → QA → entrega
  nexora plan "<brief>"                  Muestra intención, preguntas de discovery y direcciones
  nexora scan <dir>                      Escanea un proyecto existente y genera su Project Map
  nexora preview <dir>                   Sirve un directorio para inspección visual
  nexora doctor                          Estado de proveedores, skills y capacidades
  nexora version

Opciones de create:
  --out <dir>          Directorio de salida (por defecto ./nexora-output/<slug>)
  --name <nombre>      Nombre del proyecto
  --autonomous         Modo autónomo (sin preguntas)
  --guided             Modo guiado (más preguntas)
  --direction <id>     Fuerza una dirección visual
  --iterations <n>     Máximo de iteraciones de reparación (por defecto 3)
  --no-preview         No levantar el servidor de preview durante el QA
`;

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { flags[key] = next; i++; } else flags[key] = true;
    } else positional.push(a);
  }
  return { positional, flags };
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const command = positional[0] ?? 'help';

  if (command === 'help' || flags.help) { console.log(HELP); return; }
  if (command === 'version') { console.log(NEXORA_VERSION); return; }

  if (command === 'doctor') {
    const rt = await bootstrap({ repoRoot });
    const health = await rt.router.healthAll();
    console.log('\nProveedores:');
    for (const [id, h] of Object.entries(health)) console.log(`  ${h.ok ? '✅' : '❌'} ${id.padEnd(12)} ${h.detail ?? ''}`);
    console.log(`\nSkills cargadas: ${rt.skills.list().length}`);
    for (const s of rt.skills.list()) console.log(`  · ${s.id}@${s.version} [${s.category}]`);
    console.log(`\nDirecciones visuales: ${rt.designSystems.list().length}`);
    console.log(`Agentes: ${rt.agents.list().map((a) => a.id).join(', ')}`);
    let playwright = false;
    try { await import('playwright' as string); playwright = true; } catch { /* opcional */ }
    console.log(`Playwright (Visual QA real): ${playwright ? '✅ disponible' : '⚠️ no instalado — QA estático'}`);
    return;
  }

  if (command === 'plan') {
    const brief = positional[1];
    if (!brief) { console.error('Falta el brief.'); process.exit(1); }
    const intent = analyzeIntent(brief);
    const discovery = planDiscovery(intent, flags.autonomous ? 'autonomous' : flags.guided ? 'guided' : 'balanced');
    const directions = generateDirections(intent, 3);
    console.log('\n## Intención\n', JSON.stringify(intent, null, 2));
    console.log('\n## Preguntas de discovery');
    discovery.questions.forEach((q) => console.log(`- [${q.impact}] ${q.question}\n    ${q.options.join(' | ')}`));
    console.log('\n## Asunciones');
    discovery.assumptions.forEach((a) => console.log(`- ${a.field}: ${a.value}`));
    console.log('\n## Direcciones propuestas');
    directions.forEach((d) => console.log(`- ${d.name} (${d.id}) — ${d.rationale}`));
    return;
  }

  if (command === 'scan') {
    const dir = positional[1] ?? '.';
    const fs = new ScopedFs(path.resolve(dir));
    const scan = await scanProject(fs);
    const map = await buildProjectMap(fs, scan);
    await fs.writeJson('PROJECT-MAP.json', map);
    console.log(JSON.stringify({ scan: { ...scan, dependencies: scan.dependencies.slice(0, 20) }, nodes: map.nodes.length }, null, 2));
    console.log('\nPROJECT-MAP.json escrito.');
    return;
  }

  if (command === 'preview') {
    const dir = path.resolve(positional[1] ?? '.');
    const server = await serveStatic(dir, { port: Number(flags.port ?? 4173) });
    console.log(`Preview en ${server.url} (Ctrl+C para detener)`);
    process.on('SIGINT', async () => { await server.close(); process.exit(0); });
    return;
  }

  if (command === 'create') {
    const brief = positional[1];
    if (!brief) { console.error('Falta el brief. Ejemplo: nexora create "Crea una web para una cafetería"'); process.exit(1); }
    const runtime = await bootstrap({ repoRoot });
    const orchestrator = new Orchestrator(runtime);

    orchestrator.bus.on('phase', (p) => console.log(`\n▸ ${p.phase}${p.detail ? ` — ${p.detail}` : ''}`));
    orchestrator.bus.on('issue', (i) => console.log(`   ⚠️  [${i.severity}] ${i.id} ${i.title}`));
    orchestrator.bus.on('question', (q) => console.log(`   ❓ ${q.question}\n      ${q.options.join(' | ')}`));
    orchestrator.bus.on('error', (e) => console.error(`   ❌ ${e.where}: ${e.what}\n      necesita: ${e.needs}`));

    const outDir = String(flags.out ?? path.resolve('nexora-output', String(Date.now())));
    const outcome = await orchestrator.run({
      brief, outDir,
      projectName: flags.name ? String(flags.name) : undefined,
      autonomy: flags.autonomous ? 'autonomous' : flags.guided ? 'guided' : 'balanced',
      directionChoice: flags.direction ? String(flags.direction) : undefined,
      maxIterations: flags.iterations ? Number(flags.iterations) : undefined,
      usePreviewServer: flags['no-preview'] !== true,
    });

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Estado de verificación: ${outcome.report.gate.level}`);
    console.log(`Issues abiertos: ${outcome.report.issues.filter((i) => i.status === 'open').length}`);
    console.log(`Salida: ${outDir}`);
    console.log(`Abrir: ${path.join(outDir, 'site/index.html')}`);
    console.log(`Informe: ${path.join(outDir, 'REPORT.md')}`);
    if (!outcome.report.gate.verified) {
      console.log(`\nNo verificado por completo. Pendiente:`);
      [...outcome.report.gate.blocking, ...outcome.report.gate.unverified].forEach((b) => console.log(`  - ${b}`));
    }
    return;
  }

  console.error(`Comando desconocido: ${command}`);
  console.log(HELP);
  process.exit(1);
}

main().catch((e) => { log.error('fallo del CLI', { error: (e as Error).message }); console.error(e); process.exit(1); });
