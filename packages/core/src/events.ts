/** Bus de eventos tipado: alimenta Agent Activity (plan §43) y streaming SSE del daemon. */
export type Handler<T> = (payload: T) => void;

export class EventBus<Events extends Record<string, unknown>> {
  private handlers = new Map<keyof Events, Set<Handler<any>>>();
  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }
  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    for (const h of this.handlers.get(event) ?? []) {
      try { h(payload); } catch { /* un sink no puede romper el pipeline */ }
    }
    for (const h of this.handlers.get('*' as keyof Events) ?? []) {
      try { h({ event, payload } as any); } catch { /* ignore */ }
    }
  }
  clear(): void { this.handlers.clear(); }
}

export const AGENT_PHASES = [
  'Understanding', 'Planning', 'Researching', 'Designing', 'Prototyping',
  'Coding', 'Running', 'Inspecting', 'Fixing', 'Testing', 'Verified',
] as const;
export type AgentPhase = (typeof AGENT_PHASES)[number];

export interface NexoraEvents extends Record<string, unknown> {
  'phase': { phase: AgentPhase; detail?: string };
  'task': { id: string; status: string; type: string };
  'log': { level: string; msg: string };
  'artifact': { id: string; type: string; version: string };
  'issue': { id: string; severity: string; title: string };
  'question': { id: string; question: string; options: string[] };
  'error': { where: string; what: string; tried: string; canDo: string; needs: string };
  'done': { verified: boolean; summary: string };
}
