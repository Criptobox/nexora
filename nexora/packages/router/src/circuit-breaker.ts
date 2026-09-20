/** Plan §13: timeout, retry limitado, circuit breaker, health check, failover. */
export type BreakerState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  constructor(private readonly threshold = 3, private readonly cooldownMs = 30_000) {}
  get state(): BreakerState {
    if (this.failures < this.threshold) return 'closed';
    if (Date.now() - this.openedAt > this.cooldownMs) return 'half-open';
    return 'open';
  }
  canRequest(): boolean { return this.state !== 'open'; }
  recordSuccess(): void { this.failures = 0; this.openedAt = 0; }
  recordFailure(): void { this.failures += 1; if (this.failures >= this.threshold) this.openedAt = Date.now(); }
  reset(): void { this.failures = 0; this.openedAt = 0; }
}
