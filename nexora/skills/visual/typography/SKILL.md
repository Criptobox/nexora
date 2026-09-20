---
id: typography
version: 0.1.0
name: Typography
category: visual
purpose: Jerarquía tipográfica legible y con carácter.
when_to_use:
  - siempre
inputs:
  - tokens de tipografía
outputs:
  - escala aplicada
permissions:
  - read:project
---

## Purpose
Construir jerarquía con tamaño, peso y espacio antes que con color.

## Rules
- Máximo dos familias tipográficas.
- Línea de lectura entre 60 y 75 caracteres.
- Interlineado 1.5-1.7 en cuerpo, 1.0-1.2 en display.
- Tamaño mínimo de cuerpo 16px.
- El display usa tracking negativo ligero; el cuerpo no.

## Anti-patterns
- Texto en mayúsculas en párrafos largos.
- Más de tres pesos distintos en la misma vista.
- Justificado completo en web.

## Validation
- font-size del cuerpo >= 16px.
- No más de dos font-family declaradas en tokens.
