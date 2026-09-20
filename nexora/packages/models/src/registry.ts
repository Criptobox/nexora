import type { ModelProvider } from '@nexora/schemas';
import { createLogger } from '@nexora/core';

const log = createLogger('models:registry');

export class ProviderRegistry {
  private providers = new Map<string, ModelProvider>();
  register(provider: ModelProvider): this {
    this.providers.set(provider.id, provider);
    log.debug(`provider registered: ${provider.id}`);
    return this;
  }
  get(id: string): ModelProvider | undefined { return this.providers.get(id); }
  has(id: string): boolean { return this.providers.has(id); }
  list(): ModelProvider[] { return [...this.providers.values()]; }
  ids(): string[] { return [...this.providers.keys()]; }
}
