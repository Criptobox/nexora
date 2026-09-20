# Design Engine

## Pipeline

```
brief → analyzeIntent() → planDiscovery() → generateDirections()
      → chooseDirection() → buildDesignSystem() → renderDesignMd() + tokens
```

## `DESIGN.md`

14 secciones (ADR-004): Identity, Brand, Color, Typography, Spacing, Layout, Components,
Motion, Voice, Anti-patterns, Accessibility, Responsive rules, References, Decisions —
más un bloque final de tokens CSS.

Es la fuente de verdad: Visual QA evalúa **contra** este archivo.

## Tokens

```ts
tokensToCss(tokens)            // → :root { --color-accent: …; --space-4: 16px; … }
findUndeclaredTokens(css, t)   // → valores mágicos fuera del sistema
```

Ningún componente inventa valores. Si aparece un `var(--algo)` no declarado, es deriva y se
reporta.

## Anti-patterns

12 reglas activas: exceso de gradientes y sombras, jerarquía débil, card soup, lorem,
botones sin prioridad, falta de foco, sin `prefers-reduced-motion`, mobile roto, spacing
fuera de rejilla, diseño genérico, texto sobre imagen sin contraste.

Añadir una regla: `packages/design-engine/src/anti-patterns.ts`, con `detect` y `fix`.

## Direcciones visuales

`design-systems/*.json` — ver [`../../design-systems/README.md`](../../design-systems/README.md).

## Referencias

`Reference Engine` separa siempre:

- **learnable:** composición, jerarquía, ritmo, densidad, interacción, dirección artística.
- **forbidden:** logotipos, fotografía con derechos, textos literales, paletas de marca ajena, clonado pixel-perfect.
