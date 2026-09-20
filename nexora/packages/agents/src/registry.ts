import { PermissionDenied } from '@nexora/core';
import type { Agent, AgentPermission } from './agent.js';

export class AgentRegistry {
  private agents = new Map<string, Agent>();
  register(agent: Agent): this { this.agents.set(agent.id, agent); return this; }
  get(id: string): Agent | undefined { return this.agents.get(id); }
  list(): Agent[] { return [...this.agents.values()]; }
  forTask(type: string): Agent | undefined { return this.list().find((a) => a.handles.includes(type as any)); }

  assertPermission(agent: Agent, permission: AgentPermission): void {
    if (!agent.permissions.includes(permission)) {
      throw new PermissionDenied(`agent "${agent.id}" lacks permission "${permission}"`);
    }
  }
}
