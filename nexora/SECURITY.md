# SECURITY.md

> **Regla absoluta: ningún modelo tiene permisos ilimitados.**

## Modelo de amenazas

Detalle completo en [`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md).

| Amenaza | Mitigación | Dónde | Test |
|---|---|---|---|
| Comandos destructivos generados por el modelo | Allowlist de binarios + patrones prohibidos + ejecución sin shell | `sandbox/policy.ts` | `tests/unit/sandbox.test.js` |
| Path traversal | `ScopedFs.resolve()` confina toda ruta a la raíz | `core/fs.ts` | `tests/unit/core.test.js` |
| Fuga de secretos al subproceso | `sanitizeEnv()` elimina toda clave con KEY/TOKEN/SECRET/PASSWORD | `sandbox/policy.ts` | sí |
| Secretos en logs y salidas | `redactSecrets()` sobre stdout/stderr | `sandbox/policy.ts` | sí |
| Secretos embebidos en el código generado | Code QA con severidad `critical` | `qa/code-qa.ts` | sí |
| SSRF / red no controlada | Política `deny` por defecto; solo localhost | `sandbox/policy.ts` | sí |
| Prompt injection desde repos o referencias | Referencias entran como datos etiquetados, no como instrucciones; permisos por agente; sin ejecución automática de instrucciones halladas en archivos | `agents/registry.ts`, `design-engine/references.ts` | parcial |
| Procesos colgados | Timeout + SIGKILL + límite de salida | `sandbox/sandbox.ts` | sí |
| Bucles infinitos de autocorrección | `maxIterations` + parada si no mejora | `orchestrator.ts` | sí (E2E) |
| `eval` / `innerHTML` en la salida | Code QA severidad `high` | `qa/code-qa.ts` | sí |
| Tabnabbing en el sitio generado | Regla `target="_blank"` sin `noopener` + reparación automática | `qa`, `code-engine/repair.ts` | sí |
| Dependencias maliciosas | Cero dependencias en runtime (ADR-008) | todo el motor | — |

## Política de sandbox por defecto

```ts
allowedCommands: node, npm, npx, pnpm, yarn, tsc, vite, playwright, git, ls, cat, echo
network: 'deny'          // solo localhost / 127.0.0.1
timeoutMs: 120_000
maxOutputBytes: 1_000_000
shell: false             // nunca se interpola una cadena en un shell
```

Endurecer para entornos hostiles: ejecutar el daemon dentro de un contenedor con
`--network=none`, usuario sin privilegios y volumen de solo lectura salvo el directorio del proyecto.

## Qué NO hace NEXORA v0.1

- No ejecuta código arbitrario del usuario fuera de la allowlist.
- No instala dependencias sin que el proyecto tenga `package.json`.
- No envía el proyecto a ningún servicio sin configuración explícita.
- No requiere cuenta ni conexión.

## Reportar una vulnerabilidad

Abre un issue con la etiqueta `security` **sin incluir un exploit funcional**, o escribe al
responsable del repositorio. Se responde antes de divulgar.
