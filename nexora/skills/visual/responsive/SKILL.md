---
id: responsive
version: 0.1.0
name: Responsive Intelligence
category: visual
purpose: Adaptación real del contenido, no solo reflow de columnas.
when_to_use:
  - siempre
  - móvil
  - tablet
inputs:
  - layout
outputs:
  - reglas de adaptación
permissions:
  - read:project
---

## Purpose
Que el diseño móvil sea una decisión, no una consecuencia.

## Rules
- Mobile-first: el desktop amplía, no rediseña.
- Prioridad de contenido explícita: qué se ve primero en 375px.
- La navegación colapsa a un menú operable por teclado con Escape para cerrar.
- Áreas táctiles mínimas de 44x44px.
- La tipografía escala con clamp, no con saltos bruscos.
- Sin scroll horizontal en ningún breakpoint.

## Anti-patterns
- Ocultar contenido esencial en móvil.
- Tablas anchas sin contenedor desplazable.
- Anchos fijos en píxeles en contenedores principales.

## Validation
- document.scrollWidth <= clientWidth en 375, 768 y 1440.
- Todos los controles interactivos miden al menos 44px.
