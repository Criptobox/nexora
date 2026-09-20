---
id: ecommerce
version: 0.1.0
name: Ecommerce
category: design
purpose: Patrones de catálogo, ficha de producto y confianza de compra.
when_to_use:
  - tienda
  - ecommerce
  - productos
  - catálogo
  - comprar
inputs:
  - catálogo
  - política de envíos
outputs:
  - grid de producto
  - ficha
  - señales de confianza
permissions:
  - read:project
---

## Purpose
Reducir la fricción entre descubrir un producto y comprarlo.

## Rules
- Precio, disponibilidad y coste de envío visibles en la tarjeta de producto.
- Imagen de producto con relación de aspecto constante en todo el grid.
- Señales de confianza explícitas: devoluciones, garantía, soporte.
- El botón de compra no cambia de posición entre fichas.

## Anti-patterns
- Precios que solo aparecen en el carrito.
- Grids con imágenes de proporciones distintas.
- Contadores de urgencia falsos.

## Validation
- Toda tarjeta de producto muestra precio.
- Existe información de envío y devoluciones.
