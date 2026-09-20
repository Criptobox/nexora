import type { AgentResult, Task } from '@nexora/schemas';
import { buildDesignSystem, chooseDirection, generateDirections, renderDesignMd, type Intent } from '@nexora/design-engine';
import { generatePrototype } from '@nexora/code-engine';
import type { Agent, AgentContext } from './agent.js';

/** Designer Agent: dirección visual, DESIGN.md y prototipo. */
export const designerAgent: Agent = {
  id: 'designer',
  description: 'Genera direcciones visuales, el Design System y el prototipo de validación.',
  permissions: ['read:project', 'write:project', 'net:models'],
  handles: ['design-direction', 'design-system', 'prototype'],

  async run(task: Task, ctx: AgentContext): Promise<AgentResult> {
    const intent = ctx.state.intent as Intent;
    const brief = String((task.input as any)?.brief ?? ctx.state.brief ?? '');

    if (task.type === 'design-direction') {
      ctx.bus.emit('phase', { phase: 'Designing', detail: 'generando direcciones visuales' });
      const directions = generateDirections(intent, 3);
      const choice = ctx.state.directionChoice as string | undefined;
      const { direction, rationale } = chooseDirection(directions, choice);
      ctx.state.directions = directions;
      ctx.state.direction = direction;
      await ctx.memory.remember({ kind: 'design', decision: `Dirección visual: ${direction.name}`, reason: rationale, source: 'designer' });
      return { success: true, changes: [], artifacts: [], issues: [],
        evidence: [{ kind: 'file', ref: 'DESIGN.md', detail: rationale }],
        summary: `Dirección seleccionada: ${direction.name}. Alternativas: ${directions.map((d) => d.name).join(', ')}.` };
    }

    if (task.type === 'design-system') {
      const direction = ctx.state.direction as any;
      const ds = buildDesignSystem(intent, direction, brief);
      ctx.state.designSystem = ds;
      ctx.state.designMd = renderDesignMd(ds);
      await ctx.memory.remember({ kind: 'design', decision: `Tokens fijados desde la dirección ${direction.name}`, reason: 'Ningún componente puede inventar valores fuera de tokens.', source: 'designer' });
      return { success: true, changes: [], artifacts: [], issues: [],
        evidence: [{ kind: 'file', ref: 'DESIGN.md', detail: `${Object.keys(ds.color).length} colores, ${ds.components.length} componentes` }],
        summary: 'DESIGN.md y tokens generados.' };
    }

    // prototype
    ctx.bus.emit('phase', { phase: 'Prototyping', detail: 'generando prototipo responsive' });
    const files = generatePrototype(ctx.state.designSystem as any, ctx.state.direction as any, String(ctx.state.projectName ?? 'Proyecto'));
    ctx.state.prototypeFiles = files;
    return { success: true, changes: [], artifacts: [], issues: [],
      evidence: [{ kind: 'file', ref: 'prototype.html' }], summary: 'Prototipo generado (mobile + desktop).' };
  },
};
