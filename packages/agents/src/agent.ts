import type { AgentResult, Task } from '@nexora/schemas';
import type { ModelRouter } from '@nexora/router';
import type { ProjectMemory } from '@nexora/memory';
import type { SkillRegistry } from '@nexora/skills';
import type { EventBus, NexoraEvents, Logger } from '@nexora/core';

/** Permisos por agente: el Orchestrator jamás deja actuar fuera de ellos (plan §11). */
export type AgentPermission = 'read:project' | 'write:project' | 'run:commands' | 'net:models' | 'browser' | 'git';

export interface AgentContext {
  router: ModelRouter;
  memory: ProjectMemory;
  skills: SkillRegistry;
  bus: EventBus<NexoraEvents>;
  log: Logger;
  state: Record<string, unknown>;
}

export interface Agent {
  id: string;
  description: string;
  permissions: AgentPermission[];
  handles: Task['type'][];
  run(task: Task, ctx: AgentContext): Promise<AgentResult>;
}

export const emptyResult = (summary = ''): AgentResult => ({
  success: true, changes: [], artifacts: [], issues: [], evidence: [], summary,
});
