---
id: color
version: 0.1.0
name: Color
category: visual
purpose: Uso de color con función, no como decoración.
when_to_use:
  - siempre
inputs:
  - paleta
outputs:
  - asignación semántica de color
permissions:
  - read:project
---

## Purpose
Que cada color tenga un trabajo asignado.

## Rules
- Un solo color de acento para la acción principal.
- Contraste AA mínimo en todo texto.
- El fondo y la superficie se diferencian por luminancia, no por saturación.
- Los estados (error, éxito, aviso) no reutilizan el acento de marca.

## Anti-patterns
- Gradientes decorativos en cada sección.
- Texto de marca sobre fondo saturado.
- Color como único portador de información.

## Validation
- contrast(ink, bg) >= 4.5.
- contrast(accent, bg) >= 3.
