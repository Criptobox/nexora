import type { AgentResult, Task } from '@nexora/schemas';
import type { Agent, AgentContext } from './agent.js';
import { referencePrompt, type Reference } from '@nexora/design-engine';

/** Researcher Agent (plan §77): registra referencias sin copiar identidad ajena. */
export const researcherAgent: Agent = {
  id: 'researcher',
  description: 'Analiza referencias aportadas y extrae principios reutilizables (nunca identidad protegida).',
  permissions: ['read:project', 'net:models'],
  handles: ['research'],

  async run(task: Task, ctx: AgentContext): Promise<AgentResult> {
    const refs = ((task.input as any)?.references ?? []) as Reference[];
    const prompt = referencePrompt(refs);
    ctx.state.referencePrompt = prompt;
    return {
      success: true, changes: [], artifacts: [], issues: [],
      evidence: refs.map((r) => ({ kind: 'file' as const, ref: r.source, detail: r.kind })),
      summary: refs.length ? `${refs.length} referencia(s) procesadas como aprendizaje estructural.` : 'Sin referencias aportadas.',
    };
  },
};
