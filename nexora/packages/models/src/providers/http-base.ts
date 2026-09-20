import type { HealthStatus, ModelCapabilities, ModelEvent, ModelProvider, ModelRequest } from '@nexora/schemas';
import { ProviderError } from '@nexora/core';

export interface HttpProviderOptions {
  id: string;
  apiKey?: string;
  baseUrl: string;
  model: string;
  capabilities: ModelCapabilities;
  timeoutMs?: number;
}

/** Base común para adapters HTTP. La UI nunca llama a un proveedor directo (plan §9). */
export abstract class HttpProvider implements ModelProvider {
  readonly id: string;
  readonly capabilities: ModelCapabilities;
  protected readonly baseUrl: string;
  protected readonly model: string;
  protected readonly apiKey?: string;
  protected readonly timeoutMs: number;

  constructor(opts: HttpProviderOptions) {
    this.id = opts.id;
    this.capabilities = opts.capabilities;
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.model = opts.model;
    this.apiKey = opts.apiKey;
    this.timeoutMs = opts.timeoutMs ?? 120_000;
  }

  protected requireKey(): string {
    if (!this.apiKey) throw new ProviderError(`${this.id}: missing API key`);
    return this.apiKey;
  }

  async health(): Promise<HealthStatus> {
    const started = Date.now();
    if (!this.apiKey && this.requiresKey) {
      return { ok: false, detail: 'no api key configured', checkedAt: new Date().toISOString() };
    }
    try {
      const res = await fetch(this.healthUrl(), { headers: this.headers(), signal: AbortSignal.timeout(10_000) });
      return { ok: res.ok, latencyMs: Date.now() - started, detail: `HTTP ${res.status}`, checkedAt: new Date().toISOString() };
    } catch (e) {
      return { ok: false, latencyMs: Date.now() - started, detail: (e as Error).message, checkedAt: new Date().toISOString() };
    }
  }

  protected requiresKey = true;
  protected abstract healthUrl(): string;
  protected abstract headers(): Record<string, string>;
  protected abstract body(req: ModelRequest): unknown;
  protected abstract endpoint(): string;
  /** Devuelve el texto incremental de una línea SSE ya parseada como JSON. */
  protected abstract parseChunk(json: any): { text?: string; inputTokens?: number; outputTokens?: number } | null;

  async *generate(request: ModelRequest): AsyncIterable<ModelEvent> {
    let res: Response;
    try {
      res = await fetch(this.endpoint(), {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...this.headers() },
        body: JSON.stringify(this.body(request)),
        signal: request.signal ?? AbortSignal.timeout(this.timeoutMs),
      });
    } catch (e) { yield { type: 'error', error: (e as Error).message }; return; }

    if (!res.ok || !res.body) {
      yield { type: 'error', error: `${this.id}: HTTP ${res.status} ${await res.text().catch(() => '')}`.slice(0, 500) };
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '', full = '', inputTokens = 0, outputTokens = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const raw of lines) {
        const line = raw.trim();
        if (!line || !line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') continue;
        let json: unknown;
        try { json = JSON.parse(payload); } catch { continue; }
        const parsed = this.parseChunk(json);
        if (!parsed) continue;
        if (parsed.text) { full += parsed.text; yield { type: 'delta', text: parsed.text }; }
        inputTokens += parsed.inputTokens ?? 0;
        outputTokens += parsed.outputTokens ?? 0;
      }
    }
    const cost = (inputTokens / 1000) * (this.capabilities.costPer1kInput ?? 0)
      + (outputTokens / 1000) * (this.capabilities.costPer1kOutput ?? 0);
    yield { type: 'usage', inputTokens, outputTokens, costUsd: cost };
    yield { type: 'done', text: full };
  }
}
