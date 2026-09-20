# ADR-003 — Sandbox de proceso con allowlist en vez de contenedor obligatorio

**Estado:** Accepted · 2026-09-19

## Context

Plan §31-§33: la ejecución debe ser siempre controlada, sin privilegios del sistema, y
"ningún modelo debe tener permisos ilimitados". Las amenazas incluyen comandos destructivos
generados por el modelo, path traversal, SSRF, fuga de secretos y procesos colgados. Al
mismo tiempo, ADR-001 exige que NEXORA arranque sin infraestructura adicional.

## Decision

Sandbox implementado en el proceso, con defensa en capas:

| Control | Implementación |
|---|---|
| Allowlist de binarios | Solo `node, npm, npx, pnpm, yarn, tsc, vite, playwright, git, ls, cat, echo` |
| Sin shell | `spawn(cmd, args, { shell: false })` — no hay interpolación, no hay inyección |
| Patrones prohibidos | 15 expresiones: `rm -rf /`, fork bombs, `curl \| sh`, `sudo`, `~/.ssh`, `/etc/passwd`… |
| Confinamiento de rutas | `ScopedFs.resolve()` rechaza cualquier ruta fuera de la raíz |
| Entorno saneado | Se elimina toda variable que contenga KEY/TOKEN/SECRET/PASSWORD/CREDENTIAL/AUTH |
| Redacción | `redactSecrets()` sobre stdout/stderr antes de loguear |
| Límites | Timeout con SIGKILL, tope de bytes de salida |
| Red | `deny` por defecto: solo localhost |

## Alternatives

1. **Docker obligatorio** — aislamiento mucho más fuerte, pero requisito pesado que rompe local-first y complica CI. Queda **recomendado** para producción, no obligatorio.
2. **Sin sandbox, confiando en el modelo** — inaceptable.
3. **VM / gVisor / Firecracker** — sobredimensionado para v0.1.

## Consequences

**Positivas**
- Funciona en cualquier máquina con Node, sin daemon de contenedores.
- Cubierto por 7 tests de seguridad que verifican los bloqueos reales.

**Negativas**
- **No es un aislamiento fuerte**: un binario permitido podría hacer daño dentro de la raíz del proyecto. Se documenta explícitamente en `SECURITY.md`.
- Para entornos hostiles (código de terceros no confiable) hace falta contenedor.

**Acción futura:** adapter de sandbox por contenedor detrás de la misma interfaz `Sandbox`.
