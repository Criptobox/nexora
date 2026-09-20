import { ScopedFs, shortId } from '@nexora/core';
import { JsonlStore, type StoreRecord } from './store.js';

/** Plan §30 — tipos de memoria separados. */
export type MemoryKind = 'short-term' | 'project' | 'design' | 'technical' | 'qa' | 'preference';

export interface MemoryRecord extends StoreRecord {
  kind: MemoryKind;
  decision: string;
  reason?: string;
  doNot?: string;
  tags: string[];
  source: string;
  weight: number;
}

export class ProjectMemory {
  private store: JsonlStore<MemoryRecord>;
  constructor(private readonly fs: ScopedFs, home = '.nexora') {
    this.store = new JsonlStore<MemoryRecord>(fs, `${home}/memory/records.jsonl`);
  }

  async remember(input: {
    kind: MemoryKind; decision: string; source: string;
    reason?: string; doNot?: string; tags?: string[]; weight?: number;
  }): Promise<MemoryRecord> {
    const record: MemoryRecord = {
      id: shortId('mem'),
      ts: new Date().toISOString(),
      kind: input.kind,
      decision: input.decision,
      source: input.source,
      reason: input.reason,
      doNot: input.doNot,
      tags: input.tags ?? [],
      weight: input.weight ?? 1,
    };
    await this.store.append(record);
    return record;
  }

  async recall(kind?: MemoryKind, tag?: string): Promise<MemoryRecord[]> {
    const all = await this.store.all();
    return all
      .filter((r) => (!kind || r.kind === kind) && (!tag || r.tags.includes(tag)))
      .sort((a, b) => b.weight - a.weight || b.ts.localeCompare(a.ts));
  }

  /** Bloque inyectable en el prompt de cualquier agente. */
  async contextBlock(kinds: MemoryKind[] = ['project', 'design', 'technical', 'preference'], limit = 30): Promise<string> {
    const all = await this.store.all();
    const picked = all.filter((r) => kinds.includes(r.kind)).slice(-limit);
    if (!picked.length) return '';
    return ['## Memoria del proyecto (respetar siempre)', ...picked.map((r) =>
      `- [${r.kind}] ${r.decision}${r.reason ? ` — razón: ${r.reason}` : ''}${r.doNot ? ` — NO: ${r.doNot}` : ''}`)].join('\n');
  }

  /** Detecta preferencias explícitas del usuario en lenguaje natural (plan §47). */
  static extractPreferences(text: string): Array<{ decision: string; doNot?: string }> {
    const out: Array<{ decision: string; doNot?: string }> = [];
    const rules: Array<[RegExp, (m: RegExpMatchArray) => { decision: string; doNot?: string }]> = [
      [/no (?:uses|quiero|más)\s+([^.,;\n]{3,80})/gi, (m) => ({ decision: `Evitar: ${m[1].trim()}`, doNot: m[1].trim() })],
      [/(?:usa|prefiero|quiero)\s+([^.,;\n]{3,80})/gi, (m) => ({ decision: `Preferencia: ${m[1].trim()}` })],
      [/nunca\s+([^.,;\n]{3,80})/gi, (m) => ({ decision: `Nunca ${m[1].trim()}`, doNot: m[1].trim() })],
    ];
    for (const [re, fn] of rules) for (const m of text.matchAll(re)) out.push(fn(m));
    return out;
  }
}
