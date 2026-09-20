# Agentes

Contrato completo: [`../../AGENTS.md`](../../AGENTS.md).

## Añadir un agente

```ts
import type { Agent, AgentContext } from '@nexora/agents';
import type { Task, AgentResult } from '@nexora/schemas';

export const myAgent: Agent = {
  id: 'my-agent',
  description: 'Qué hace, en una frase.',
  permissions: ['read:project'],     // pide el mínimo
  handles: ['research'],
  async run(task: Task, ctx: AgentContext): Promise<AgentResult> {
    ctx.bus.emit('phase', { phase: 'Researching' });
    return {
      success: true, changes: [], artifacts: [], issues: [],
      evidence: [{ kind: 'file', ref: 'algo.md' }],   // obligatorio si afirmas algo
      summary: 'Qué hiciste realmente.',
    };
  },
};
```

Regístralo en `packages/orchestrator/src/bootstrap.ts`.

## Obligaciones

- Pide el **mínimo** de permisos.
- Emite fases para que el usuario sepa qué ocurre.
- Toda afirmación lleva evidencia.
- Los errores se reportan con: qué ocurrió, qué intentó, qué puede hacer, qué necesita.
- Nunca declares verificado lo que no comprobaste.
