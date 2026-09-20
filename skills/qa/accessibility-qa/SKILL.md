---
id: accessibility-qa
version: 0.1.0
name: Accessibility QA
category: qa
purpose: Accesibilidad desde el diseño, no como parche final.
when_to_use:
  - siempre
inputs:
  - DOM
  - tokens de color
outputs:
  - issues de accesibilidad
permissions:
  - read:project
  - browser
---

## Purpose
Que el sitio sea usable con teclado, lector de pantalla y bajo contraste.

## Rules
- HTML semántico antes que ARIA.
- Foco visible siempre; nunca outline:none sin sustituto.
- Toda imagen informativa con alt descriptivo; decorativa con alt="".
- Formularios con label asociado por for/id.
- prefers-reduced-motion respetado.
- El idioma del documento declarado en html lang.

## Anti-patterns
- div con onclick en lugar de button.
- Enlaces cuyo texto es "aquí" o "leer más" sin contexto.
- Contraste por debajo de AA en texto secundario.

## Validation
- 0 issues de severidad high en la categoría Accessibility.
