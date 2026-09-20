---
id: portfolio
version: 0.1.0
name: Portfolio
category: design
purpose: Mostrar trabajo con jerarquía y contexto.
when_to_use:
  - portfolio
  - portafolio
  - diseñador
  - fotógrafo
  - 3d
  - freelance
inputs:
  - proyectos
  - biografía
outputs:
  - índice de trabajo
  - caso de estudio
permissions:
  - read:project
---

## Purpose
Que el trabajo se vea antes que la biografía y que cada pieza tenga contexto.

## Rules
- El trabajo aparece en el primer viewport.
- Cada proyecto indica rol, año y resultado.
- La imagen manda: la tipografía acompaña, no compite.
- Contacto accesible desde cualquier punto de la página.

## Anti-patterns
- Intro animada bloqueante.
- Galerías sin títulos ni contexto.
- Biografía en primera posición.

## Validation
- Hay al menos tres piezas con título y contexto.
- Existe un medio de contacto directo.
