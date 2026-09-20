import type { ModelRequest } from '@nexora/schemas';
import { HttpProvider } from './http-base.js';

export class AnthropicProvider extends HttpProvider {
  constructor(opts: { apiKey?: string; model?: string } = {}) {
    super({
      id: 'anthropic', apiKey: opts.apiKey ?? process.env.ANTHROPIC_API_KEY,
      baseUrl: 'https://api.anthropic.com/v1', model: opts.model ?? 'claude-3-5-sonnet-latest',
      capabilities: { supports: ['TEXT','CODE','VISION','REASONING','TOOL_USE','LONG_CONTEXT'], contextWindow: 200_000, costPer1kInput: 0.003, costPer1kOutput: 0.015 },
    });
  }
  protected healthUrl() { return `${this.baseUrl}/models`; }
  protected headers() { return { 'x-api-key': this.apiKey ?? '', 'anthropic-version': '2023-06-01' }; }
  protected endpoint() { return `${this.baseUrl}/messages`; }
  protected body(req: ModelRequest) {
    const system = req.messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
    return {
      model: this.model, stream: true, max_tokens: req.maxTokens ?? 4096, temperature: req.temperature ?? 0.7,
      ...(system ? { system } : {}),
      messages: req.messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role,
        content: m.images?.length
          ? [{ type: 'text', text: m.content }, ...m.images.map((data) => ({ type: 'image', source: { type: 'base64', media_type: 'image/png', data } }))]
          : m.content,
      })),
    };
  }
  protected parseChunk(json: any) {
    if (json?.type === 'content_block_delta') return { text: json?.delta?.text ?? '' };
    if (json?.type === 'message_start') return { inputTokens: json?.message?.usage?.input_tokens ?? 0 };
    if (json?.type === 'message_delta') return { outputTokens: json?.usage?.output_tokens ?? 0 };
    return null;
  }
}
