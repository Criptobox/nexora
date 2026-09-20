---
id: saas
version: 0.1.0
name: SaaS / Producto
category: design
purpose: Comunicar un producto de software y su modelo de precios.
when_to_use:
  - saas
  - plataforma
  - software
  - automatización
  - herramienta
inputs:
  - propuesta de valor
  - planes
outputs:
  - hero de producto
  - grid de capacidades
  - tabla de precios
permissions:
  - read:project
---

## Purpose
Explicar qué hace el producto, para quién y cuánto cuesta, sin jerga vacía.

## Rules
- El hero explica el resultado para el cliente, no la tecnología.
- Captura o diagrama del producto visible en el primer tercio.
- Precios con al menos dos planes y un plan destacado con criterio.
- Cada capacidad se enuncia como beneficio medible.

## Anti-patterns
- "Impulsado por IA" como única propuesta de valor.
- Precios ocultos tras "contáctanos" en todos los planes.
- Muros de logotipos sin contexto.

## Validation
- Existe sección con id="pricing" y al menos dos planes con precio.
- El hero contiene un verbo de resultado.
