# Design Systems

Cada archivo `.json` es una **dirección visual** consultable por el Design Engine.
El catálogo base vive en `packages/design-systems/src/catalog.ts` y se exporta aquí
para que sea editable sin recompilar: el `DesignSystemRegistry` carga este directorio
al arrancar y sobreescribe el catálogo embebido por `id`.

## Añadir una dirección

1. Copia un archivo existente y cámbiale el `id`.
2. Ajusta `palette`, `typography`, `layout`, `motion`, `components` y `tone`.
3. Registra la industria en `INDUSTRY_HINTS` si debe proponerse automáticamente.
4. Verifica contraste: `contrast(ink, bg) >= 4.5` y `contrast(accent, bg) >= 3`.

## Filosofía

Adoptamos de OpenDesign Design Intelligence la idea de tratar los sistemas visuales
como **datos consultables**, no como prompts. No importamos su catálogo: construimos
el nuestro con pipeline propio (ver `docs/research/FEATURE-MATRIX.md`, fila
"1.486 design systems → INSPIRE + BUILD OWN PIPELINE").
