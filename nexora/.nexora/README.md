# .nexora/

Directorio de trabajo de NEXORA **dentro de cada proyecto**. Siempre separado de los
archivos del usuario (plan §59).

```
.nexora/
├── config/manifest.json      manifest del proyecto
├── memory/records.jsonl      memoria (append-only)
├── artifacts/<id>/v<x.y.z>/  artifacts versionados, nunca sobrescritos
│   └── screenshots/          capturas de Visual QA
├── baselines/<key>.json      firmas para detección de regresión
├── reports/                  run.json · changes.json · CHANGES.md
├── snapshots/                puntos de restauración
├── logs/
└── cache/
```

Este directorio en la raíz del repositorio existe para documentar la estructura; el
contenido real de cada run se genera dentro del proyecto de salida. `runs/`, `cache/` y
`logs/` están en `.gitignore`.
