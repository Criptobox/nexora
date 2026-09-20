import type { DesignDirection } from '@nexora/schemas';
import { DIRECTION_CATALOG, INDUSTRY_HINTS } from '@nexora/design-systems';
import type { Intent } from './intent.js';

/** Plan §22 — generar varias direcciones; el usuario elige o delega ("decídelo tú"). */
export function generateDirections(intent: Intent, limit = 3): DesignDirection[] {
  const hinted = INDUSTRY_HINTS[intent.industry] ?? INDUSTRY_HINTS.generic;
  const scored = DIRECTION_CATALOG.map((d) => {
    let score = hinted.includes(d.id) ? 10 : 0;
    for (const p of intent.personality) {
      const hay = `${d.name} ${d.tone} ${d.rationale}`.toLowerCase();
      if (p === 'premium' && /premium|lujo|elegan|exclusiv/.test(hay)) score += 4;
      if (p === 'youthful' && /joven|energ|juvenil|directo/.test(hay)) score += 4;
      if (p === 'minimal' && /minimal|sobrio|editorial/.test(hay)) score += 4;
      if (p === 'bold' && /contundente|brutal|contraste/.test(hay)) score += 4;
      if (p === 'warm' && /cálid|acogedor|oficio/.test(hay)) score += 3;
      if (p === 'technical' && /técnic|preciso|producto/.test(hay)) score += 4;
    }
    return { d, score };
  }).sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s, i) => ({ ...s.d, id: s.d.id, name: `${String(i + 1).padStart(2, '0')} — ${s.d.name}` }));
}

export function chooseDirection(directions: DesignDirection[], choice?: string): { direction: DesignDirection; rationale: string } {
  if (choice) {
    const found = directions.find((d) => d.id === choice || d.name.toLowerCase().includes(choice.toLowerCase()));
    if (found) return { direction: found, rationale: `Seleccionada por el usuario: ${found.name}.` };
  }
  const direction = directions[0];
  return {
    direction,
    rationale: `Elegida automáticamente: mejor ajuste entre industria, personalidad del brief y legibilidad. ${direction.rationale}`,
  };
}
