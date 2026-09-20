import type { DesignDirection, DesignSystem, DesignTokens } from '@nexora/schemas';
import { BASE_TOKENS, mergeTokens, tokensToCss } from '@nexora/design-systems';
import type { Intent } from './intent.js';

/** Construye el Design System y su DESIGN.md (plan §17/§18). */
export function buildDesignSystem(intent: Intent, direction: DesignDirection, brief: string): DesignSystem {
  const tokens: DesignTokens = mergeTokens(BASE_TOKENS, {
    color: direction.palette,
    typography: { 'font-display': direction.typography.display, 'font-body': direction.typography.body },
  });

  return {
    identity: `${direction.name.replace(/^\d+\s—\s/, '')} aplicada a un proyecto de tipo "${intent.industry}".`,
    brand: intent.brandGiven ? 'Identidad aportada por el usuario; el sistema la respeta y la extiende.' : 'Identidad generada por NEXORA a partir de la dirección visual elegida.',
    color: direction.palette,
    typography: {
      display: direction.typography.display,
      body: direction.typography.body,
      scale: direction.typography.scale,
      rules: [
        'Un único nivel de display por pantalla.',
        'Cuerpo mínimo 16px; línea de lectura entre 60 y 75 caracteres.',
        'Contraste de jerarquía mediante tamaño y peso, no mediante color saturado.',
      ],
    },
    spacing: tokens.spacing,
    layout: [direction.layout, 'Grid de 12 columnas con gutter de 24px.', 'Ritmo vertical basado en múltiplos de 8px.'],
    components: direction.components,
    motion: [direction.motion, 'Respetar prefers-reduced-motion en todas las animaciones.'],
    voice: [`Tono: ${direction.tone}`, 'Frases cortas, verbos concretos, sin superlativos vacíos.'],
    antiPatterns: [
      'Más de un gradiente decorativo por sección.',
      'Tarjetas sin contenido diferenciado.',
      'Texto sobre imagen sin capa de contraste.',
      'Más de dos botones primarios visibles a la vez.',
      'Lorem ipsum en entrega final.',
    ],
    accessibility: [
      'Contraste mínimo AA (4.5:1 texto normal, 3:1 texto grande).',
      'Foco visible en todos los elementos interactivos.',
      'Áreas táctiles de al menos 44x44px.',
      'Landmarks semánticos: header, nav, main, footer.',
      'alt descriptivo en toda imagen informativa.',
    ],
    responsive: [
      'Diseño mobile-first; el desktop amplía, no rediseña.',
      'La navegación colapsa a menú accesible por teclado bajo 768px.',
      'Prioridad de contenido: acción principal siempre visible en móvil.',
    ],
    references: direction.references,
    decisions: [
      `Brief original: "${brief.slice(0, 180)}"`,
      `Acción principal: ${intent.primaryAction}.`,
      `Dirección elegida: ${direction.name}.`,
    ],
    tokens,
  };
}

export function renderDesignMd(ds: DesignSystem): string {
  const list = (items: string[]) => items.map((i) => `- ${i}`).join('\n');
  const table = (obj: Record<string, string>) =>
    ['| Token | Valor |', '|---|---|', ...Object.entries(obj).map(([k, v]) => `| \`${k}\` | \`${v}\` |`)].join('\n');

  return `# DESIGN.md

> Documento legible por humanos y por agentes. Es la fuente de verdad visual del proyecto.
> Cualquier desviación detectada en Visual QA se reporta contra este archivo.

## 1. Identity
${ds.identity}

## 2. Brand
${ds.brand}

## 3. Color
${table(ds.color)}

## 4. Typography
- Display: \`${ds.typography.display}\`
- Body: \`${ds.typography.body}\`
- Escala: ${ds.typography.scale}

${list(ds.typography.rules)}

## 5. Spacing
${table(ds.spacing)}

## 6. Layout
${list(ds.layout)}

## 7. Components
${list(ds.components)}

## 8. Motion
${list(ds.motion)}

## 9. Voice
${list(ds.voice)}

## 10. Anti-patterns
${list(ds.antiPatterns)}

## 11. Accessibility
${list(ds.accessibility)}

## 12. Responsive rules
${list(ds.responsive)}

## 13. References
${list(ds.references)}

## 14. Decisions
${list(ds.decisions)}

---

## Tokens (CSS)

\`\`\`css
${tokensToCss(ds.tokens)}
\`\`\`
`;
}
