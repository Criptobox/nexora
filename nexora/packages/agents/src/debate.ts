import type { Issue } from '@nexora/schemas';

/** Plan §49 — debate controlado: decide el criterio, no "quién habló último". */
export interface Position { agent: 'designer' | 'developer' | 'qa'; proposal: string; rationale: string; cost: number; }

export interface DebateContext {
  requirements: string[];
  designRules: string[];
  openIssues: Issue[];
  userPreferences: string[];
}

export interface Verdict { winner: Position; reason: string; scores: Record<string, number>; }

export function resolveDebate(positions: Position[], ctx: DebateContext): Verdict {
  const scores: Record<string, number> = {};
  for (const p of positions) {
    let s = 0;
    const text = `${p.proposal} ${p.rationale}`.toLowerCase();
    s += ctx.requirements.filter((r) => text.includes(r.toLowerCase().split(' ')[0])).length * 8;
    s += ctx.designRules.filter((r) => text.includes(r.toLowerCase().split(' ')[0])).length * 5;
    s += ctx.userPreferences.filter((r) => text.includes(r.toLowerCase().split(' ')[0])).length * 10;
    const criticalOpen = ctx.openIssues.filter((i) => i.severity === 'critical').length;
    if (p.agent === 'qa' && criticalOpen > 0) s += 12; // con críticos abiertos, QA manda
    s -= p.cost;
    scores[p.agent] = s;
  }
  const winner = positions.reduce((a, b) => (scores[a.agent] >= scores[b.agent] ? a : b));
  return {
    winner,
    reason: `Decidido por criterio: requisitos, DESIGN.md, issues abiertos y preferencias del usuario (score ${scores[winner.agent]}).`,
    scores,
  };
}
