import type { Change } from '@nexora/schemas';
import { ScopedFs, seqId } from '@nexora/core';

/** Plan §35 — Safe Change System: cada modificación se registra con razón, riesgo y verificación. */
export class ChangeLog {
  private changes: Change[] = [];
  constructor(private readonly fs: ScopedFs, private readonly home = '.nexora') {}

  record(input: Omit<Change, 'id'>): Change {
    const change: Change = { id: seqId('CHANGE', this.changes.length + 1), ...input };
    this.changes.push(change);
    return change;
  }
  all(): Change[] { return [...this.changes]; }

  async persist(): Promise<void> {
    await this.fs.writeJson(`${this.home}/reports/changes.json`, this.changes);
    await this.fs.write(`${this.home}/reports/CHANGES.md`, this.render());
  }

  render(): string {
    return ['# Registro de cambios (Safe Change System)', '', ...this.changes.map((c) => [
      `## ${c.id}`, '', `**Qué:** ${c.what}`, '', `**Por qué:** ${c.why}`, '',
      `**Archivos:**`, ...c.files.map((f) => `- \`${f}\``), '',
      `**Riesgo:** ${c.risk}`, '', `**Verificación:**`, ...c.tests.map((t) => `- ${t}`), '',
      `**Resultado:** ${c.result}`, '',
    ].join('\n'))].join('\n');
  }
}
