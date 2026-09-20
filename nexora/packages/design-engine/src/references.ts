/** Plan §20 — Reference Engine: aprender composición, nunca copiar identidad. */
export type ReferenceKind = 'user-screenshot' | 'url' | 'internal-system' | 'library';

export interface Reference { id: string; kind: ReferenceKind; source: string; notes: string[]; }

export interface ReferenceExtraction {
  learnable: string[];
  forbidden: string[];
}

/** Separa explícitamente REFERENCE vs COPY. */
export function extractFromReference(ref: Reference): ReferenceExtraction {
  return {
    learnable: [
      'composición y distribución de peso visual',
      'jerarquía y orden de lectura',
      'ritmo y densidad de información',
      'patrones de interacción',
      'dirección artística general',
      ...ref.notes,
    ],
    forbidden: [
      'logotipos y marcas registradas',
      'fotografía e ilustración con derechos',
      'textos literales',
      'paletas usadas como firma de marca ajena',
      'clonado pixel-perfect del layout',
    ],
  };
}

export function referencePrompt(refs: Reference[]): string {
  if (!refs.length) return '';
  const e = refs.map(extractFromReference);
  return [
    '## Referencias',
    'Usar SOLO como aprendizaje estructural:',
    ...[...new Set(e.flatMap((x) => x.learnable))].map((l) => `- ${l}`),
    'PROHIBIDO reproducir:',
    ...[...new Set(e.flatMap((x) => x.forbidden))].map((l) => `- ${l}`),
  ].join('\n');
}
