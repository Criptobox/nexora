import type { ModelProvider, ModelRequest } from '@nexora/schemas';
import { ProviderRegistry, collect, type Completion } from '@nexora/models';
import { createLogger, ProviderError } from '@nexora/core';
import { CircuitBreaker } from './circuit-breaker.js';
import { resolveCapabilities, type RoutePolicy } from './policy.js';

const log = createLogger('router');

export interface RouterOptions { maxRetries?: number; timeoutMs?: number; fallbackOrder?: string[]; }
export interface RouteResult extends Completion { attempts: string[]; }

/** Plan §12/§13: selección por capacidad + failover determinista, sin loops infinitos. */
export class ModelRouter {
  private breakers = new Map<string, CircuitBreaker>();
  private usage = { inputTokens: 0, outputTokens: 0, costUsd: 0, calls: 0, failures: 0 };

  constructor(private readonly registry: ProviderRegistry, private readonly opts: RouterOptions = {}) {}

  private breaker(id: string): CircuitBreaker {
    if (!this.breakers.has(id)) this.breakers.set(id, new CircuitBreaker());
    return this.breakers.get(id)!;
  }

  /** Ordena candidatos: pin > capacidades cubiertas > local/coste > orden de fallback. */
  candidates(policy: RoutePolicy = {}): ModelProvider[] {
    if (policy.pin) {
      const p = this.registry.get(policy.pin);
      if (!p) throw new ProviderError(`pinned provider not found: ${policy.pin}`);
      return [p];
    }
    const needed = resolveCapabilities(policy);
    const scored = this.registry.list().map((p) => {
      const covered = needed.filter((c) => p.capabilities.supports.includes(c)).length;
      const missing = needed.length - covered;
      const local = p.capabilities.supports.includes('LOCAL') ? 1 : 0;
      const cost = (p.capabilities.costPer1kInput ?? 0) + (p.capabilities.costPer1kOutput ?? 0);
      const order = this.opts.fallbackOrder?.indexOf(p.id) ?? -1;
      const score =
        covered * 100 - missing * 40
        + (policy.preferLocal ? local * 30 : 0)
        - cost * 10
        + (order >= 0 ? (this.opts.fallbackOrder!.length - order) * 5 : 0);
      return { p, score, missing, cost };
    })
    .filter(({ cost }) => policy.maxCostUsdPer1k === undefined || cost <= policy.maxCostUsdPer1k)
    .sort((a, b) => b.score - a.score);
    return scored.map((s) => s.p).filter((p) => this.breaker(p.id).canRequest());
  }

  async route(request: ModelRequest, policy: RoutePolicy = {}, onDelta?: (t: string) => void): Promise<RouteResult> {
    const providers = this.candidates(policy);
    if (!providers.length) throw new ProviderError('no healthy provider available for policy', policy);
    const maxRetries = this.opts.maxRetries ?? 1;
    const attempts: string[] = [];
    let lastError: unknown;

    for (const provider of providers) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        attempts.push(`${provider.id}#${attempt}`);
        try {
          const timeout = AbortSignal.timeout(this.opts.timeoutMs ?? 120_000);
          const signal = request.signal ? AbortSignal.any([request.signal, timeout]) : timeout;
          const result = await collect(provider, { ...request, signal }, onDelta);
          this.breaker(provider.id).recordSuccess();
          this.usage.calls++; this.usage.inputTokens += result.inputTokens;
          this.usage.outputTokens += result.outputTokens; this.usage.costUsd += result.costUsd;
          return { ...result, attempts };
        } catch (e) {
          lastError = e;
          this.usage.failures++;
          this.breaker(provider.id).recordFailure();
          log.warn(`provider ${provider.id} failed (attempt ${attempt})`, { error: (e as Error).message });
          if (request.signal?.aborted) throw e; // cancelación del usuario: no reintentar
        }
      }
    }
    throw new ProviderError(`all providers failed: ${attempts.join(', ')}`, lastError);
  }

  stats() { return { ...this.usage, breakers: Object.fromEntries([...this.breakers].map(([k, v]) => [k, v.state])) }; }

  async healthAll() {
    return Object.fromEntries(await Promise.all(this.registry.list().map(async (p) => [p.id, await p.health()] as const)));
  }
}
