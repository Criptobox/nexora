# ADR-007 — Persistencia en JSONL y filesystem antes que SQLite

**Estado:** Accepted · 2026-09-19

## Context

El plan (§9) propone SQLite para uso local y filesystem para proyectos, con esquema
versionado. Pero `better-sqlite3` es una dependencia nativa que requiere compilación y es
la primera causa de instalaciones rotas en Node; `node:sqlite` sigue siendo experimental en
Node 20. ADR-008 fija cero dependencias de runtime.

## Decision

v0.1 persiste en **JSONL + filesystem**, detrás de una interfaz sustituible:

```
.nexora/
├── config/manifest.json     manifest del proyecto
├── memory/records.jsonl     memoria (append-only)
├── artifacts/<id>/v<x.y.z>/ artifacts versionados
├── baselines/<key>.json     firmas de regresión
├── reports/                 run.json, changes.json, CHANGES.md
├── snapshots/  logs/  cache/
```

`JsonlStore<T>` encapsula el acceso; cambiar a SQLite implica reimplementar esa clase sin
tocar `ProjectMemory`, `ArtifactStore` ni ningún consumidor.

## Alternatives

1. **SQLite ya** — consultas y transacciones reales, pero dependencia nativa y riesgo de instalación.
2. **`node:sqlite`** — sin dependencia externa, pero experimental y con warnings en runtime.
3. **Base de datos embebida en JS (LevelDB, lowdb)** — dependencia sin ventaja clara sobre JSONL a esta escala.

## Consequences

**Positivas**
- `npm install` nunca falla por compilación nativa.
- Todo el estado es legible, diffeable y editable a mano: excelente para depurar.
- Append-only encaja con memoria y auditoría.

**Negativas**
- Sin consultas complejas ni índices: hoy se filtra en memoria.
- No escala a decenas de miles de registros por proyecto.
- Sin transacciones ni escritura concurrente segura entre procesos.

**Disparador de revisión:** cuando un proyecto supere ~10.000 registros de memoria o se
necesiten consultas por rango, se migra a SQLite (reevaluar en Node 22 LTS).
