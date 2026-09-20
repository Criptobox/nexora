import { ScopedFs } from '@nexora/core';
import type { DesignDirection } from '@nexora/schemas';
import { DIRECTION_CATALOG } from './catalog.js';

/** Carga direcciones desde disco (design-systems/*.json) y las fusiona con el catálogo base. */
export class DesignSystemRegistry {
  private directions = new Map<string, DesignDirection>();
  constructor(seed: DesignDirection[] = DIRECTION_CATALOG) { for (const d of seed) this.directions.set(d.id, d); }

  async loadFrom(fs: ScopedFs, dir = 'design-systems'): Promise<number> {
    const files = (await fs.list(dir, { recursive: true })).filter((f) => f.endsWith('.json'));
    let n = 0;
    for (const f of files) {
      try {
        const d = await fs.readJson<DesignDirection>(f);
        if (d?.id) { this.directions.set(d.id, d); n++; }
      } catch { /* archivo inválido: se ignora, no rompe el arranque */ }
    }
    return n;
  }
  get(id: string) { return this.directions.get(id); }
  list(): DesignDirection[] { return [...this.directions.values()]; }
  add(d: DesignDirection) { this.directions.set(d.id, d); return this; }
}
