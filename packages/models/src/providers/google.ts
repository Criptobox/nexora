import type { ModelRequest } from '@nexora/schemas';
import { HttpProvider } from './http-base.js';

export class GoogleProvider extends HttpProvider {
  constructor(opts: { apiKey?: string; model?: string } = {}) {
    super({
      id: 'google', apiKey: opts.apiKey ?? process.env.GOOGLE_API_KEY,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: opts.model ?? 'gemini-2.0-flash',
      capabilities: { supports: ['TEXT','CODE','VISION','LONG_CONTEXT','FAST','CHEAP'], contextWindow: 1_000_000, costPer1kInput: 0.0001, costPer1kOutput: 0.0004 },
    });
  }
  protected healthUrl() { return `${this.baseUrl}/models?key=${this.apiKey ?? ''}`; }
  protected headers() { return {}; }
  protected endpoint() { return `${this.baseUrl}/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey ?? ''}`; }
  protected body(req: ModelRequest) {
    const system = req.messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
    return {
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      generationConfig: { temperature: req.temperature ?? 0.7, maxOutputTokens: req.maxTokens ?? 4096, ...(req.json ? { responseMimeType: 'application/json' } : {}) },
      contents: req.messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }, ...(m.images ?? []).map((data) => ({ inlineData: { mimeType: 'image/png', data } }))],
      })),
    };
  }
  protected parseChunk(json: any) {
    const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? '';
    return { text, inputTokens: json?.usageMetadata?.promptTokenCount ?? 0, outputTokens: json?.usageMetadata?.candidatesTokenCount ?? 0 };
  }
}
