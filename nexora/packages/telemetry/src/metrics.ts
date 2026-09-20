export interface Timing { name: string; ms: number; }

export class Metrics {
  private counters = new Map<string, number>();
  private timings: Timing[] = [];
  private marks = new Map<string, number>();

  inc(name: string, by = 1): void { this.counters.set(name, (this.counters.get(name) ?? 0) + by); }
  start(name: string): void { this.marks.set(name, Date.now()); }
  end(name: string): number {
    const t0 = this.marks.get(name);
    const ms = t0 ? Date.now() - t0 : 0;
    this.timings.push({ name, ms });
    this.marks.delete(name);
    return ms;
  }
  async time<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try { return await fn(); } finally { this.end(name); }
  }
  snapshot() {
    return { counters: Object.fromEntries(this.counters), timings: [...this.timings] };
  }
}
