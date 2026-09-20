import type { AgentResult, Issue, Task } from '@nexora/schemas';
import { detectAntiPatterns } from '@nexora/design-engine';
import { analyzeVisual } from '@nexora/vision';
import type { Agent, AgentContext } from './agent.js';

/** Critic Agent (plan §26): self-critique antes de entregar, con límite de iteraciones. */
export const criticAgent: Agent = {
  id: 'critic',
  description: 'Revisa el resultado contra DESIGN.md y detecta anti-patterns antes de la entrega.',
  permissions: ['read:project', 'net:models'],
  handles: ['visual-review'],

  async run(_task: Task, ctx: AgentContext): Promise<AgentResult> {
    ctx.bus.emit('phase', { phase: 'Inspecting', detail: 'auto-crítica del prototipo' });
    const files = (ctx.state.prototypeFiles as any[]) ?? [];
    const html = files.map((f: any) => f.contents).join('\n');
    const ds = ctx.state.designSystem as any;
    const report = analyzeVisual({ html, css: html, designSystem: ds });
    const issues: Issue[] = [...report.issues, ...detectAntiPatterns(html, html, ds)]
      .filter((i) => i.severity === 'high' || i.severity === 'critical');

    for (const i of issues) ctx.bus.emit('issue', { id: i.id, severity: i.severity, title: i.title });

    return {
      success: true, changes: [], artifacts: [], issues,
      evidence: [{ kind: 'metric', ref: 'prototype', detail: `score ${report.scores.overall}` }],
      summary: issues.length
        ? `${issues.length} problema(s) relevantes en el prototipo antes de codificar.`
        : 'Prototipo coherente con DESIGN.md; se procede a implementación.',
    };
  },
};
