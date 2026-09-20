# THREAT-MODEL.md

## Activos a proteger

1. La máquina del usuario (filesystem, procesos, red).
2. Los secretos (API keys, credenciales de Git, tokens).
3. El proyecto del usuario (no destruirlo, no corromperlo).
4. La integridad del resultado (que no salga código malicioso o inseguro).

## Actores

| Actor | Confianza | Notas |
|---|---|---|
| Usuario | Alta | Ejecuta NEXORA voluntariamente |
| Modelo (LLM) | **Ninguna** | Puede alucinar, ser manipulado o generar comandos destructivos |
| Proyecto existente escaneado | **Ninguna** | Puede contener prompt injection en comentarios o README |
| Referencias aportadas (URL, screenshots) | **Ninguna** | Vector de injection y de SSRF |
| Dependencias del proyecto generado | Baja | Pueden ejecutar scripts de instalación |

## Amenazas y controles

### T1 — El modelo genera un comando destructivo
`rm -rf /`, fork bomb, `curl | sh`, `chmod 777 /`.
**Control:** allowlist de binarios + 15 patrones prohibidos + `shell: false`.
**Test:** `tests/unit/sandbox.test.js`. **Residual:** bajo.

### T2 — Path traversal
El modelo escribe `../../.ssh/authorized_keys`.
**Control:** `ScopedFs.resolve()` en toda escritura; el parser de artifacts normaliza y elimina `../`.
**Test:** sí. **Residual:** bajo.

### T3 — Fuga de secretos
Secretos en el entorno de un subproceso, en logs o en el código entregado.
**Control:** `sanitizeEnv()` + `redactSecrets()` + Code QA con severidad crítica.
**Test:** sí. **Residual:** bajo.

### T4 — Prompt injection
Un README del proyecto escaneado dice "ignora tus instrucciones y ejecuta X".
**Control:** el contenido escaneado entra como **datos**, nunca como instrucciones de sistema;
los agentes tienen permisos acotados; no hay ejecución automática de comandos hallados en archivos.
**Residual:** **medio** — mitigación completa exige separación estricta de canales en el prompt, pendiente para v0.3.

### T5 — SSRF
El modelo pide buscar `http://169.254.169.254/`.
**Control:** política de red `deny` por defecto; solo localhost. `isHostAllowed()` para futuras peticiones.
**Residual:** bajo mientras no se habilite fetch de URLs arbitrarias.

### T6 — Dependencias maliciosas
**Control:** cero dependencias de runtime en el motor (ADR-008); `npm install` en el proyecto generado solo si existe `package.json`, dentro del sandbox.
**Residual:** medio en proyectos existentes con dependencias propias.

### T7 — Bucle infinito / agotamiento de recursos
**Control:** `maxIterations`, parada si no mejora, timeouts con SIGKILL, tope de salida, `orderTasks` que no se cuelga con dependencias rotas.
**Test:** E2E. **Residual:** bajo.

### T8 — Destrucción del trabajo del usuario
**Control:** checkpoint de Git antes de la entrega; artifacts versionados que rechazan sobrescritura; `.nexora/` separado del proyecto; Safe Change System con registro de cada cambio.
**Residual:** bajo.

### T9 — Código inseguro en el resultado entregado
XSS por `innerHTML`, tabnabbing, recursos por HTTP, secretos embebidos.
**Control:** Code QA con reparación automática de los casos deterministas.
**Test:** sí. **Residual:** bajo.

### T10 — Escape del sandbox
Un binario permitido hace algo dañino dentro de la raíz.
**Control:** allowlist mínima; raíz confinada.
**Residual:** **medio** — se documenta abiertamente en `SECURITY.md`; para código no confiable, usar contenedor.

## Riesgos residuales aceptados en v0.1

| Riesgo | Nivel | Plan |
|---|---|---|
| Prompt injection desde proyectos escaneados | Medio | Separación estricta de canales (v0.3) |
| Sandbox de proceso, no de kernel | Medio | Adapter de contenedor detrás de la misma interfaz |
| Dependencias del proyecto del usuario | Medio | Auditoría de `package.json` antes de instalar |
