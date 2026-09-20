---
id: landing
version: 0.1.0
name: Landing Page
category: design
purpose: Estructura y ritmo de una landing orientada a conversión.
when_to_use:
  - landing
  - página única
  - campaña
  - lanzamiento
inputs:
  - brief
  - acción principal
outputs:
  - secciones ordenadas por intención
permissions:
  - read:project
---

## Purpose
Ordenar una página única para que conduzca a una sola acción.

## Rules
- Orden base: hero, prueba, oferta/detalle, objeciones, cierre.
- Repetir la acción principal al menos dos veces: hero y cierre.
- La prueba social va después del hero, no al final.
- Cada sección tiene un objetivo declarado; si no lo tiene, se elimina.

## Anti-patterns
- Carruseles de hero automáticos.
- Formularios largos antes de explicar el valor.
- Pop-ups de intención de salida.

## Validation
- La acción principal aparece al menos dos veces.
- No hay más de una llamada a la acción distinta compitiendo por sección.
