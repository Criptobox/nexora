---
id: web-general
version: 0.1.0
name: Web General
category: design
purpose: Reglas base que aplican a cualquier sitio web generado por NEXORA.
when_to_use:
  - cualquier proyecto web
  - siempre como base antes de skills específicas
inputs:
  - brief
  - DESIGN.md
outputs:
  - estructura semántica
  - jerarquía de contenido
permissions:
  - read:project
  - write:project
---

## Purpose
Garantizar un suelo mínimo de calidad estructural, semántica y de contenido en todo sitio.

## Rules
- Un único H1 por página que exprese la propuesta de valor, no el nombre del negocio a secas.
- Estructura semántica obligatoria: header, nav, main, footer.
- La acción principal debe ser visible sin hacer scroll en móvil.
- Todo bloque debe aportar información nueva; si repite, se elimina.
- Máximo cinco secciones en una landing salvo justificación explícita.
- El contenido se escribe en el idioma detectado en el brief.
- Los textos generados sin datos reales se marcan con data-placeholder="true".

## Anti-patterns
- Secciones "Sobre nosotros" genéricas sin información concreta.
- Titulares que no dicen qué se vende.
- Más de dos botones primarios compitiendo en la misma vista.
- Iconografía decorativa sin significado.

## Validation
- El documento tiene exactamente un h1.
- Existe main y footer.
- La acción principal aparece en el primer viewport móvil (375x812).

## Examples
- Hero con kicker, título, subtítulo, dos acciones y tres métricas de confianza.
