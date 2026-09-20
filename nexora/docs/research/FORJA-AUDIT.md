# FORJA-AUDIT.md

**Estado: PENDIENTE — no se ha leído el código de `Criptobox/FORJA-IA`.**

Este documento existe como plantilla de auditoría obligatoria del plan §2.1 y §88.
Declararlo completo sin haber leído el repositorio violaría la regla §63 ("si NEXORA no
verificó algo, no puede afirmar que está verificado").

## Procedimiento

```bash
git clone https://github.com/Criptobox/FORJA-IA /tmp/forja
cd /tmp/forja && git log -1 --format='%H %ci'   # anotar commit auditado
cloc . --exclude-dir=node_modules               # tamaño real
cat LICENSE                                     # licencia ANTES de leer para reutilizar
```

## Plantilla a completar

### Metadatos
- Commit auditado: _pendiente_
- Fecha: _pendiente_
- Licencia: _pendiente_ → registrar en `LICENSE-MATRIX.md`
- Tamaño (LoC por lenguaje): _pendiente_

### Arquitectura
- Estructura de carpetas: _pendiente_
- Límites entre módulos, ¿hay ciclos?: _pendiente_
- Estado global vs inyección de dependencias: _pendiente_

### Subsistemas a evaluar

| Subsistema | ¿Existe? | ¿Funciona? | Arquitectura | Deuda técnica | Acción |
|---|---|---|---|---|---|
| Agentes | | | | | |
| Web Studio | | | | | |
| Project Map | | | | | |
| Memoria | | | | | |
| Visual QA | | | | | |
| Ejecución | | | | | |
| Router / modelos | | | | | |
| Sandbox | | | | | |
| Git | | | | | |
| UI | | | | | |
| Persistencia | | | | | |
| Seguridad | | | | | |

### Preguntas obligatorias por subsistema
1. ¿Qué problema resuelve?
2. ¿Realmente funciona (hay tests, hay evidencia de ejecución)?
3. ¿Qué principios extraer?
4. ¿Qué deuda técnica arrastra?
5. `KEEP` / `ADAPT` / `REBUILD` / `INSPIRE` / `REJECT`

### Componentes candidatos a reutilizar
_Ninguno aprobado todavía: requiere licencia verificada y registro en `THIRD-PARTY.md`._

## Decisión provisional

Mientras la auditoría esté pendiente, NEXORA **no incorpora código de FORJA**. Los
subsistemas equivalentes se han construido desde cero con contratos propios
(`packages/schemas`). Si la auditoría revela un patrón superior, entra como ADR nuevo y
cambio explícito, nunca como copia silenciosa.
