import { ScopedFs, seqId } from '@nexora/core';
import type { Issue } from '@nexora/schemas';
import { createHash } from 'node:crypto';

export interface Baseline { key: string; hash: string; textLength: number; elementCount: number; createdAt: string; }

/** Plan §37 — comparación contra baseline. Sin screenshot usa firma estructural del DOM. */
export class RegressionEngine {
  constructor(private readonly fs: ScopedFs, private readonly home = '.nexora') {}

  private file(key: string) { return `${this.home}/baselines/${key}.json`; }

  static signature(html: string): Baseline {
    const normalized = html.replace(/\s+/g, ' ').trim();
    return {
      key: '', hash: createHash('sha256').update(normalized).digest('hex').slice(0, 32),
      textLength: normalized.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length,
      elementCount: (normalized.match(/<[a-zA-Z]/g) ?? []).length,
      createdAt: new Date().toISOString(),
    };
  }

  async saveBaseline(key: string, html: string): Promise<Baseline> {
    const baseline = { ...RegressionEngine.signature(html), key };
    await this.fs.writeJson(this.file(key), baseline);
    return baseline;
  }

  async compare(key: string, html: string): Promise<{ hasBaseline: boolean; changed: boolean; issues: Issue[]; delta?: Record<string, number> }> {
    if (!(await this.fs.exists(this.file(key)))) return { hasBaseline: false, changed: false, issues: [] };
    const base = await this.fs.readJson<Baseline>(this.file(key));
    const now = RegressionEngine.signature(html);
    const delta = {
      textLength: now.textLength - base.textLength,
      elementCount: now.elementCount - base.elementCount,
    };
    const issues: Issue[] = [];
    let n = 0;
    const lostText = base.textLength > 0 && delta.textLength / base.textLength < -0.25;
    const lostNodes = base.elementCount > 0 && delta.elementCount / base.elementCount < -0.25;
    if (lostText || lostNodes) {
      issues.push({
        id: seqId('REG', ++n), category: 'Regression', title: 'Pérdida significativa de contenido respecto al baseline',
        severity: 'high', location: key, suggestedFix: 'Revisar el último cambio: se han eliminado elementos o texto de forma inesperada.',
        status: 'open', evidence: [{ kind: 'metric', ref: key, detail: JSON.stringify(delta) }],
      });
    }
    return { hasBaseline: true, changed: base.hash !== now.hash, issues, delta };
  }
}
