import { OpenAIProvider } from './openai.js';

/** OpenRouter expone API compatible con OpenAI: reutilizamos el adapter. */
export class OpenRouterProvider extends OpenAIProvider {
  constructor(opts: { apiKey?: string; model?: string } = {}) {
    super({ apiKey: opts.apiKey ?? process.env.OPENROUTER_API_KEY, model: opts.model ?? 'meta-llama/llama-3.1-70b-instruct', baseUrl: 'https://openrouter.ai/api/v1' });
    Object.defineProperty(this, 'id', { value: 'openrouter' });
  }
}
