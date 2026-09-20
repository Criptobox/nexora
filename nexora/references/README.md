# references/

Referencias visuales reutilizables que el Design Director puede consultar al proponer
direcciones (plan §30). Son **descripciones estructuradas, no imágenes**: NEXORA no
distribuye capturas de sitios de terceros por motivos de licencia (ver `THIRD-PARTY.md`).

## Formato

Cada referencia es un `.json`:

```json
{
  "id": "editorial-serif",
  "label": "Editorial serif de alto contraste",
  "industries": ["restaurant", "portfolio"],
  "traits": ["contraste tipográfico alto", "retícula asimétrica", "mucho aire"],
  "avoid": ["sombras genéricas", "iconografía de stock"],
  "whenToUse": "Marcas que compiten por criterio y no por precio."
}
```

## Cómo se usan

`packages/design-engine/src/references.ts` las carga y las ofrece al Design Director
como vocabulario visual. **Nunca se copian literalmente**: son criterios, no plantillas.

Estado: `IMPLEMENTING` — el cargador existe, el catálogo está deliberadamente vacío para
que cada instalación construya el suyo.
