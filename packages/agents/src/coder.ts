import type { AgentResult, ArtifactFile, Task } from '@nexora/schemas';
import { generateSite, repair, markFixed } from '@nexora/code-engine';
import type { Intent } from '@nexora/design-engine';
import type { Agent, AgentContext } from './agent.js';

/** Coder Agent: implementación y reparación con registro de cambios. */
export const coderAgent: Agent = {
  id: 'coder',
  description: 'Convierte el Design System y el prototipo en código real; aplica reparaciones verificables.',
  permissions: ['read:project', 'write:project', 'net:models'],
  handles: ['implementation', 'repair'],

  async run(task: Task, ctx: AgentContext): Promise<AgentResult> {
    if (task.type === 'implementation') {
      ctx.bus.emit('phase', { phase: 'Coding', detail: 'generando código del sitio' });
      const files = generateSite({
        intent: ctx.state.intent as Intent,
        designSystem: ctx.state.designSystem as any,
        projectName: String(ctx.state.projectName ?? 'Proyecto'),
        brief: String(ctx.state.brief ?? ''),
        whatsappNumber: ctx.state.whatsappNumber as string | undefined,
      });
      ctx.state.files = files;
      return {
        success: true, artifacts: [], issues: [],
        changes: [{ id: 'impl', what: 'Implementación inicial del sitio', why: 'Materializar DESIGN.md en código ejecutable',
          files: files.map((f) => f.path), risk: 'medium', tests: ['code QA', 'visual QA', 'functional QA'], result: 'applied' }],
        evidence: files.map((f) => ({ kind: 'file' as const, ref: f.path, detail: `${f.contents.length} bytes` })),
        summary: `${files.length} archivos generados.`,
      };
    }

    // repair
    ctx.bus.emit('phase', { phase: 'Fixing', detail: 'aplicando reparaciones' });
    const files = ctx.state.files as ArtifactFile[];
    const issues = (ctx.state.issues as any[]) ?? [];
    const result = repair(files, issues);
    ctx.state.files = result.files;
    ctx.state.issues = markFixed(issues, result.fixed);
    ctx.state.unfixed = result.unfixed;

    return {
      success: true, artifacts: [], issues: [],
      changes: result.patches.map((p, i) => ({
        id: `patch-${i + 1}`, what: p.description, why: 'Issue detectado por QA',
        files: [p.path], risk: 'low' as const, tests: ['re-run QA'], result: 'applied' as const,
      })),
      evidence: result.fixed.map((id) => ({ kind: 'test' as const, ref: id, detail: 'issue reparado' })),
      summary: `${result.fixed.length} issues reparados, ${result.unfixed.length} requieren decisión.`,
    };
  },
};
