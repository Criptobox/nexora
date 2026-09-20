# Arquitectura

- Visión general y mapa de paquetes: [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md)
- Decisiones: [`ADR/`](ADR/)
- Opciones evaluadas y descartadas: [`../research/ARCHITECTURE-OPTIONS.md`](../research/ARCHITECTURE-OPTIONS.md)

## Reglas estructurales

1. **DAG estricto.** Las dependencias entre paquetes no tienen ciclos; TypeScript project
   references lo verifica en cada build.
2. **Una responsabilidad por paquete.** Si un paquete necesita dos frases para explicarse, se divide.
3. **`schemas` no depende de nada.** Es el vocabulario común.
4. **`orchestrator` es el único que conoce a todos.** El resto se ignora mutuamente salvo su dependencia declarada.
5. **Nada de estado global.** Cada run lleva su contexto; los runs son aislados y cancelables.
