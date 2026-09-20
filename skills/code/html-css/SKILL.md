---
id: html-css
version: 0.1.0
name: HTML + CSS
category: code
purpose: Implementación en HTML y CSS nativos, dirigida por tokens.
when_to_use:
  - sitios estáticos
  - landings
  - prototipos de alta fidelidad
inputs:
  - DESIGN.md
  - tokens.json
outputs:
  - index.html
  - styles.css
  - app.js
permissions:
  - read:project
  - write:project
---

## Purpose
Producir código legible, sin dependencias y alineado con los tokens.

## Rules
- Todos los valores visuales provienen de var(--token); ningún valor mágico.
- CSS organizado por capas: tokens, base, componentes, utilidades, responsive.
- JavaScript progresivo: la página funciona sin JS para leer contenido.
- Sin frameworks ni CDNs salvo requisito explícito.
- Media queries agrupadas al final del archivo.

## Anti-patterns
- !important salvo en utilidades documentadas.
- Estilos en línea.
- IDs como selectores de estilo.

## Validation
- findUndeclaredTokens(css, tokens) devuelve lista vacía.
- El CSS contiene al menos un bloque @media y un bloque prefers-reduced-motion.
