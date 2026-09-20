import type { HealthStatus, ModelCapabilities, ModelEvent, ModelProvider, ModelRequest } from '@nexora/schemas';
import { createHash } from 'node:crypto';

/**
 * Proveedor determinista offline. Permite que el loop completo (diseño → código → QA)
 * sea ejecutable y testeable sin claves ni red — requisito local-first (plan §50, ADR-001).
 * Las respuestas se derivan de plantillas internas, no de un modelo real.
 */
export interface MockHandler { match: (req: ModelRequest) => boolean; respond: (req: ModelRequest) => string; }

export class MockProvider implements ModelProvider {
  readonly id: string;
  readonly capabilities: ModelCapabilities = {
    supports: ['TEXT', 'CODE', 'VISION', 'REASONING', 'FAST', 'CHEAP', 'LOCAL', 'TOOL_USE', 'LONG_CONTEXT'],
    contextWindow: 200_000, costPer1kInput: 0, costPer1kOutput: 0,
  };
  private handlers: MockHandler[] = [];
  constructor(id = 'mock', handlers: MockHandler[] = []) { this.id = id; this.handlers = handlers; }

  addHandler(h: MockHandler): this { this.handlers.push(h); return this; }

  async health(): Promise<HealthStatus> { return { ok: true, latencyMs: 0, detail: 'deterministic offline provider', checkedAt: new Date().toISOString() }; }

  async *generate(request: ModelRequest): AsyncIterable<ModelEvent> {
    if (request.signal?.aborted) { yield { type: 'error', error: 'aborted' }; return; }
    const handler = this.handlers.find((h) => h.match(request));
    const text = handler ? handler.respond(request) : this.fallback(request);
    const chunk = Math.max(24, Math.ceil(text.length / 8));
    for (let i = 0; i < text.length; i += chunk) {
      if (request.signal?.aborted) { yield { type: 'error', error: 'aborted' }; return; }
      yield { type: 'delta', text: text.slice(i, i + chunk) };
    }
    const prompt = request.messages.map((m) => m.content).join('\n');
    yield { type: 'usage', inputTokens: Math.ceil(prompt.length / 4), outputTokens: Math.ceil(text.length / 4), costUsd: 0 };
    yield { type: 'done', text };
  }

  private fallback(request: ModelRequest): string {
    const last = request.messages.at(-1)?.content ?? '';
    const hash = createHash('sha256').update(last).digest('hex').slice(0, 8);
    if (request.json) return JSON.stringify({ ok: true, purpose: request.purpose ?? 'unknown', hash });
    return `[mock:${this.id}] respuesta determinista para "${request.purpose ?? 'general'}" (${hash}).`;
  }
}
