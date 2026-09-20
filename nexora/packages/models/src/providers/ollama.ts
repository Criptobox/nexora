import type { HealthStatus, ModelCapabilities, ModelEvent, ModelProvider, ModelRequest } from '@nexora/schemas';

/** Modelo local (plan §1.3 / §50): NEXORA debe poder funcionar sin nube. */
export class OllamaProvider implements ModelProvider {
  readonly id = 'ollama';
  readonly capabilities: ModelCapabilities = {
    supports: ['TEXT', 'CODE', 'LOCAL', 'CHEAP', 'REASONING'], contextWindow: 32_000, costPer1kInput: 0, costPer1kOutput: 0,
  };
  private baseUrl: string; private model: string;
  constructor(opts: { baseUrl?: string; model?: string } = {}) {
    this.baseUrl = (opts.baseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434').replace(/\/$/, '');
    this.model = opts.model ?? process.env.OLLAMA_MODEL ?? 'qwen2.5-coder';
  }
  async health(): Promise<HealthStatus> {
    const started = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
      return { ok: res.ok, latencyMs: Date.now() - started, detail: `HTTP ${res.status}`, checkedAt: new Date().toISOString() };
    } catch (e) { return { ok: false, detail: (e as Error).message, checkedAt: new Date().toISOString() }; }
  }
  async *generate(req: ModelRequest): AsyncIterable<ModelEvent> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: this.model, stream: true, messages: req.messages.map(m => ({ role: m.role, content: m.content })), options: { temperature: req.temperature ?? 0.7 } }),
        signal: req.signal ?? AbortSignal.timeout(180_000),
      });
    } catch (e) { yield { type: 'error', error: (e as Error).message }; return; }
    if (!res.ok || !res.body) { yield { type: 'error', error: `ollama HTTP ${res.status}` }; return; }
    const reader = res.body.getReader(); const dec = new TextDecoder();
    let buf = '', full = '', inTok = 0, outTok = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n'); buf = lines.pop() ?? '';
      for (const l of lines) {
        if (!l.trim()) continue;
        try {
          const j = JSON.parse(l);
          const t = j?.message?.content ?? '';
          if (t) { full += t; yield { type: 'delta', text: t }; }
          inTok = j?.prompt_eval_count ?? inTok; outTok = j?.eval_count ?? outTok;
        } catch { /* ignore partial */ }
      }
    }
    yield { type: 'usage', inputTokens: inTok, outputTokens: outTok, costUsd: 0 };
    yield { type: 'done', text: full };
  }
}
