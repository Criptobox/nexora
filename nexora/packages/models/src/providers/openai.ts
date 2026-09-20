import type { ModelRequest } from '@nexora/schemas';
import { HttpProvider } from './http-base.js';

export class OpenAIProvider extends HttpProvider {
  constructor(opts: { apiKey?: string; model?: string; baseUrl?: string } = {}) {
    super({
      id: 'openai', apiKey: opts.apiKey ?? process.env.OPENAI_API_KEY,
      baseUrl: opts.baseUrl ?? 'https://api.openai.com/v1', model: opts.model ?? 'gpt-4o-mini',
      capabilities: { supports: ['TEXT','CODE','VISION','REASONING','TOOL_USE','LONG_CONTEXT','FAST'], contextWindow: 128_000, costPer1kInput: 0.00015, costPer1kOutput: 0.0006 },
    });
  }
  protected healthUrl() { return `${this.baseUrl}/models`; }
  protected headers() { return { authorization: `Bearer ${this.apiKey ?? ''}` }; }
  protected endpoint() { return `${this.baseUrl}/chat/completions`; }
  protected body(req: ModelRequest) {
    return {
      model: this.model, stream: true, stream_options: { include_usage: true },
      temperature: req.temperature ?? 0.7, max_tokens: req.maxTokens ?? 4096,
      ...(req.json ? { response_format: { type: 'json_object' } } : {}),
      messages: req.messages.map((m) => m.images?.length
        ? { role: m.role, content: [{ type: 'text', text: m.content }, ...m.images.map((url) => ({ type: 'image_url', image_url: { url } }))] }
        : { role: m.role, content: m.content }),
    };
  }
  protected parseChunk(json: any) {
    const text = json?.choices?.[0]?.delta?.content ?? '';
    return { text, inputTokens: json?.usage?.prompt_tokens ?? 0, outputTokens: json?.usage?.completion_tokens ?? 0 };
  }
}
