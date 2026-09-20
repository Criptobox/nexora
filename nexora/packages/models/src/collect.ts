import type { ModelEvent, ModelProvider, ModelRequest } from '@nexora/schemas';

export interface Completion { text: string; inputTokens: number; outputTokens: number; costUsd: number; providerId: string; }

export async function collect(provider: ModelProvider, request: ModelRequest, onDelta?: (t: string) => void): Promise<Completion> {
  let text = '', inputTokens = 0, outputTokens = 0, costUsd = 0;
  for await (const ev of provider.generate(request) as AsyncIterable<ModelEvent>) {
    if (ev.type === 'delta') { text += ev.text; onDelta?.(ev.text); }
    else if (ev.type === 'usage') { inputTokens += ev.inputTokens; outputTokens += ev.outputTokens; costUsd += ev.costUsd ?? 0; }
    else if (ev.type === 'done') { if (ev.text && !text) text = ev.text; }
    else if (ev.type === 'error') throw new Error(`${provider.id}: ${ev.error}`);
  }
  return { text, inputTokens, outputTokens, costUsd, providerId: provider.id };
}

/** Extrae el primer objeto/array JSON de una respuesta del modelo (tolerante a ```json fences). */
export function extractJson<T = unknown>(raw: string): T | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidates = [fenced?.[1], raw].filter(Boolean) as string[];
  for (const c of candidates) {
    const start = c.search(/[[{]/);
    if (start < 0) continue;
    for (let end = c.length; end > start; end--) {
      const slice = c.slice(start, end);
      try { return JSON.parse(slice) as T; } catch { /* keep shrinking */ }
    }
  }
  return null;
}
