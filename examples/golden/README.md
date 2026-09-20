# Golden Projects

Proyectos de prueba permanentes (plan §65). Sirven para comprobar que una versión nueva
**no degrada** NEXORA.

Cada carpeta contiene:

- `brief.md` — el prompt exacto de la Golden Prompt Suite (plan §78).
- `expected.json` — intención que debe detectarse, principios de diseño y estructura esperada.

Ejecutar la suite:

```bash
npm run golden      # ejecuta todos y verifica expectativas
npm run benchmark   # mide tiempos, issues, reparaciones y coste
```

`npm run golden` falla si un proyecto deja de cumplir sus expectativas: es la red de
seguridad contra regresiones del motor completo.
