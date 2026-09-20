---
id: visual-qa
version: 0.1.0
name: Visual QA
category: qa
purpose: Detectar desviaciones visuales respecto a DESIGN.md.
when_to_use:
  - después de cada implementación
  - después de cada reparación
inputs:
  - screenshot
  - DOM
  - DESIGN.md
outputs:
  - issues con evidencia
permissions:
  - read:project
  - browser
---

## Purpose
Comparar lo que se ve con lo que se decidió, y convertir cada desviación en una tarea.

## Rules
- Todo issue lleva categoría, severidad, ubicación, fix sugerido y evidencia.
- Sin evidencia no se reporta el issue.
- Se evalúa en 375, 768 y 1440 como mínimo.
- El score interno no se presenta como nota estética al usuario salvo que sea útil.

## Anti-patterns
- Afirmar "se ve bien" sin captura ni análisis.
- Reportar problemas genéricos sin ubicación.

## Validation
- Cada issue tiene al menos un elemento de evidencia.
