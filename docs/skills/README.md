# Skills

Una skill es un archivo Markdown versionable, no un prompt escondido en el código.

## Estructura

```
skills/<categoría>/<id>/
├── SKILL.md          ← obligatorio
├── rules/            opcional
├── references/       opcional
├── examples/         opcional
├── validators/       opcional
└── tests/            opcional
```

## Formato de `SKILL.md`

```markdown
---
id: restaurant
version: 0.1.0
name: Restaurante / Gastronomía
category: design        # design | ui | visual | code | qa | research
purpose: Patrones específicos de sitios de restauración.
when_to_use:
  - restaurante
  - menú
permissions:
  - read:project
---

## Purpose
…

## Rules
- Regla accionable y verificable.

## Anti-patterns
- Lo que está prohibido.

## Validation
- Criterio comprobable por máquina.
```

## Skills incluidas (13)

**Diseño:** `web-general`, `landing`, `restaurant`, `saas`, `ecommerce`, `portfolio`
**Visual:** `responsive`, `typography`, `color`
**QA:** `visual-qa`, `code-qa`, `accessibility-qa`
**Código:** `html-css`

## Selección

`SkillRegistry.select(brief)` puntúa cada skill contra el brief usando `when_to_use`,
`name` e `id`. Las de categoría visual y QA reciben un plus porque siempre aplican.

`tests/unit/skills.test.js` valida **automáticamente todas las skills del repo**: si añades
una mal formada o sin reglas, el test falla.
