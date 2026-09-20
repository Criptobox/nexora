import { promises as fs } from 'node:fs';
import path from 'node:path';

/** Abstracción de filesystem con raíz obligatoria: base del aislamiento (plan §32). */
export class ScopedFs {
  constructor(readonly root: string) {}

  resolve(rel: string): string {
    const abs = path.resolve(this.root, rel);
    const rootAbs = path.resolve(this.root);
    if (abs !== rootAbs && !abs.startsWith(rootAbs + path.sep)) {
      throw new Error(`path traversal blocked: ${rel}`);
    }
    return abs;
  }
  async ensureDir(rel: string): Promise<void> { await fs.mkdir(this.resolve(rel), { recursive: true }); }
  async write(rel: string, contents: string): Promise<void> {
    const abs = this.resolve(rel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, contents, 'utf8');
  }
  async writeJson(rel: string, value: unknown): Promise<void> {
    await this.write(rel, JSON.stringify(value, null, 2) + '\n');
  }
  async read(rel: string): Promise<string> { return fs.readFile(this.resolve(rel), 'utf8'); }
  async readJson<T>(rel: string): Promise<T> { return JSON.parse(await this.read(rel)) as T; }
  async exists(rel: string): Promise<boolean> {
    try { await fs.stat(this.resolve(rel)); return true; } catch { return false; }
  }
  async list(rel = '.', opts: { recursive?: boolean; ignore?: string[] } = {}): Promise<string[]> {
    const ignore = new Set(opts.ignore ?? ['node_modules', '.git', 'dist', '.nexora', 'build', 'out', 'coverage']);
    const out: string[] = [];
    const walk = async (dir: string) => {
      let entries;
      try { entries = await fs.readdir(this.resolve(dir), { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        if (ignore.has(e.name)) continue;
        const child = path.posix.join(dir === '.' ? '' : dir, e.name);
        if (e.isDirectory()) { if (opts.recursive !== false) await walk(child); }
        else out.push(child);
      }
    };
    await walk(rel);
    return out.sort();
  }
  async stat(rel: string) { return fs.stat(this.resolve(rel)); }
  async remove(rel: string): Promise<void> { await fs.rm(this.resolve(rel), { recursive: true, force: true }); }
}
