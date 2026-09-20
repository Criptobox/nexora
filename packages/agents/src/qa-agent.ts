import type { AgentResult, ArtifactFile, Task } from '@nexora/schemas';
import { runQaPipeline } from '@nexora/qa';
import { RegressionEngine } from '@nexora/qa';
import type { Intent } from '@nexora/design-engine';
import type { Agent, AgentContext } from './agent.js';
import { ScopedFs } from '@nexora/core';

/** QA Agent: visual, funcional y regresión. Nunca declara verificado sin evidencia. */
export const qaAgent: Agent = {
  id: 'qa',
  description: 'Ejecuta el pipeline de QA (código, visual, funcional, responsive, a11y, regresión).',
  permissions: ['read:project', 'run:commands', 'browser'],
  handles: ['visual-qa', 'functional-qa', 'regression'],

  async run(task: Task, ctx: AgentContext): Promise<AgentResult> {
    const fs = ctx.state.fs as ScopedFs;
    const files = ctx.state.files as ArtifactFile[];
    const intent = ctx.state.intent as Intent;

    if (task.type === 'regression') {
      const engine = new RegressionEngine(fs);
      const html = files.find((f) => f.path === 'index.html')?.contents ?? '';
      const cmp = await engine.compare('index', html);
      if (!cmp.hasBaseline) await engine.saveBaseline('index', html);
      return {
        success: cmp.issues.length === 0, changes: [], artifacts: [], issues: cmp.issues,
        evidence: [{ kind: 'metric', ref: 'baseline:index', detail: cmp.hasBaseline ? JSON.stringify(cmp.delta) : 'baseline creado' }],
        summary: cmp.hasBaseline ? (cmp.changed ? 'Cambios respecto al baseline registrados.' : 'Sin cambios respecto al baseline.') : 'Baseline inicial guardado.',
      };
    }

    ctx.bus.emit('phase', { phase: 'Testing', detail: task.type });
    const report = await runQaPipeline({
      files, designSystem: ctx.state.designSystem as any, features: intent.features,
      primaryAction: intent.primaryAction, fs,
      previewUrl: ctx.state.previewUrl as string | undefined,
      screenshotDir: '.nexora/artifacts/screenshots',
      buildOk: ctx.state.buildOk as boolean | null,
      testsOk: ctx.state.testsOk as boolean | null,
    });

    const prev = (ctx.state.issues as any[]) ?? [];
    ctx.state.issues = [...prev.filter((p: any) => p.status === 'fixed'), ...report.issues];
    ctx.state.qaReport = report;
    for (const i of report.issues) ctx.bus.emit('issue', { id: i.id, severity: i.severity, title: i.title });

    return {
      success: report.gate.blocking.length === 0, changes: [], artifacts: [], issues: report.issues,
      evidence: [
        { kind: 'metric', ref: 'qa:overall', detail: String(report.scores.overall) },
        ...report.observations.filter((o) => o.screenshotPath).map((o) => ({ kind: 'screenshot' as const, ref: o.screenshotPath! })),
      ],
      summary: `${report.issues.length} issues — gate: ${report.gate.level}.`,
    };
  },
};
