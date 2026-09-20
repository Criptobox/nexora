import type { Issue, Task } from '@nexora/schemas';
import type { GateResult } from '@nexora/qa';

export interface RunReport {
  project: string;
  brief: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  direction: string;
  tasks: Array<Pick<Task, 'id' | 'type' | 'status'>>;
  issues: Issue[];
  unfixed: string[];
  gate: GateResult;
  scores: Record<string, number>;
  iterations: number;
  modelStats: Record<string, unknown>;
  outputDir: string;
  browserObserved: boolean;
}

export function renderReport(r: RunReport): string {
  const openIssues = r.issues.filter((i) => i.status === 'open');
  const bySeverity = (s: string) => openIssues.filter((i) => i.severity === s).length;

  return `# Informe de ejecución — ${r.project}

- **Brief:** ${r.brief}
- **Dirección visual:** ${r.direction}
- **Duración:** ${(r.durationMs / 1000).toFixed(1)}s
- **Iteraciones de reparación:** ${r.iterations}
- **Salida:** \`${r.outputDir}\`
- **Observación con navegador real:** ${r.browserObserved ? 'sí (Playwright)' : 'no — QA estático'}

## Estado de verificación

**${r.gate.level}**

| Comprobación | Estado |
|---|---|
${r.gate.checklist.map((c) => `| ${c.check} | ${c.status === 'pass' ? '✅ pass' : c.status === 'fail' ? '❌ fail' : '⚠️ unknown'} |`).join('\n')}

${r.gate.blocking.length ? `### Bloqueantes\n${r.gate.blocking.map((b) => `- ${b}`).join('\n')}\n` : ''}
${r.gate.unverified.length ? `### No verificado\n${r.gate.unverified.map((b) => `- ${b}`).join('\n')}\n` : ''}

## Scores internos

| Categoría | Score |
|---|---:|
${Object.entries(r.scores).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

## Issues

Abiertos: ${openIssues.length} (críticos ${bySeverity('critical')}, altos ${bySeverity('high')}, medios ${bySeverity('medium')}, bajos ${bySeverity('low')}) · Resueltos: ${r.issues.filter((i) => i.status === 'fixed').length}

${openIssues.length ? openIssues.map((i) => `- **[${i.severity}] ${i.id} ${i.title}** — ${i.location}\n  - Fix sugerido: ${i.suggestedFix}\n  - Evidencia: ${i.evidence.map((e) => `${e.kind}:${e.ref}${e.detail ? ` (${e.detail})` : ''}`).join('; ') || 'n/d'}`).join('\n') : '_Sin issues abiertos._'}

${r.unfixed.length ? `## Requieren decisión humana\n${r.unfixed.map((u) => `- ${u}`).join('\n')}\n` : ''}

## Tareas

| Tarea | Tipo | Estado |
|---|---|---|
${r.tasks.map((t) => `| ${t.id} | ${t.type} | ${t.status} |`).join('\n')}

## Modelos

\`\`\`json
${JSON.stringify(r.modelStats, null, 2)}
\`\`\`

---
_Generado por NEXORA. Este informe no declara verificado nada que no se haya comprobado (plan §63)._
`;
}
