import { ScopedFs } from '@nexora/core';

/**
 * Store JSONL append-only. ADR-007: arrancamos sin SQLite para mantener cero dependencias
 * nativas; la interfaz permite sustituirlo por SQLite sin tocar los consumidores.
 */
export interface StoreRecord { id: string; ts: string; [k: string]: unknown; }

export class JsonlStore<T extends StoreRecord> {
  constructor(private readonly fs: ScopedFs, private readonly file: string) {}
  async append(record: T): Promise<void> {
    const prev = (await this.fs.exists(this.file)) ? await this.fs.read(this.file) : '';
    await this.fs.write(this.file, prev + JSON.stringify(record) + '\n');
  }
  async all(): Promise<T[]> {
    if (!(await this.fs.exists(this.file))) return [];
    return (await this.fs.read(this.file)).split('\n').filter(Boolean).map((l) => JSON.parse(l) as T);
  }
  async find(pred: (r: T) => boolean): Promise<T[]> { return (await this.all()).filter(pred); }
  async replaceAll(records: T[]): Promise<void> {
    await this.fs.write(this.file, records.map((r) => JSON.stringify(r)).join('\n') + (records.length ? '\n' : ''));
  }
}
