# ADR-005 — Project Map como grafo consultable antes de leer código

**Estado:** Accepted · 2026-09-19

## Context

Plan §29: el agente debe consultar un mapa antes de leer grandes cantidades de código. En
proyectos existentes, volcar el repositorio en el contexto del modelo es caro, lento y
degrada la calidad. Hace falta saber **qué importa** antes de decidir **qué leer**.

## Decision

`buildProjectMap()` produce un grafo donde cada nodo tiene:

```
id · type · path · dependencies · dependents · importance · lastModified · designRole
```

- `type` se deriva del scan (page, component, style, asset, api, test, config, data).
- Las aristas se extraen con análisis estático de imports/require/@import/href/src.
- `importance = 1 + dependents×2 + (página ? 3) + (entry point ? 5)`.
- `designRole` etiqueta nodos visuales relevantes (hero, navigation).

`topNodes(map, n)` da al agente los nodos más relevantes sin leer un solo archivo completo.

## Alternatives

1. **Leerlo todo** — inviable por coste y ventana de contexto.
2. **Embeddings + búsqueda semántica** — potente, pero añade dependencias, índice y coste; el grafo estructural resuelve el 80 % del problema con cero dependencias.
3. **Solo listado de archivos** — no distingue lo importante de lo accesorio.

## Consequences

**Positivas**
- Coste de contexto acotado y predecible.
- El grafo revela acoplamientos y puntos de riesgo antes de modificar.
- `PROJECT-MAP.json` es inspeccionable por el usuario (`nexora scan`).

**Negativas**
- El análisis estático de imports no resuelve alias de bundler ni imports dinámicos complejos.
- La heurística de `importance` es simple y puede afinarse con datos de uso real.
