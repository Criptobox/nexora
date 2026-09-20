---
id: restaurant
version: 0.1.0
name: Restaurante / Gastronomía
category: design
purpose: Patrones específicos de sitios de restauración.
when_to_use:
  - restaurante
  - hamburguesería
  - cafetería
  - pizzería
  - bar
  - menú
  - comida
inputs:
  - carta
  - ubicación
  - canal de pedido
outputs:
  - sección de menú
  - bloque de pedido
  - horario y ubicación
permissions:
  - read:project
---

## Purpose
Resolver lo que un cliente de hostelería necesita en menos de diez segundos: qué hay, cuánto cuesta y cómo pedir.

## Rules
- El menú se muestra como lista legible con precio alineado, no como galería de tarjetas.
- Precio siempre visible junto al nombre del plato.
- El canal de pedido (WhatsApp, teléfono, formulario) está fijo o repetido en cada sección larga.
- Horario y ubicación visibles en el footer y accesibles desde la navegación.
- Fotografía de producto grande; si no hay foto real, marcar el hueco como placeholder, nunca usar stock genérico sin avisar.

## Anti-patterns
- PDF como carta.
- Menú en carrusel.
- Música automática.
- Texto blanco sobre fotografía sin capa de contraste.

## Validation
- Existe una sección con id="menu" que contiene precios.
- El enlace de pedido usa https://wa.me/<número> o tel:.
- Hay horario y dirección en el footer.
