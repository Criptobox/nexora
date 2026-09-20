# Sandbox

Ver también [`../../SECURITY.md`](../../SECURITY.md) y [ADR-003](../architecture/ADR/ADR-003-sandbox.md).

## Uso

```ts
const sandbox = new Sandbox({ ...DEFAULT_POLICY, root: '/ruta/proyecto' });
const r = await sandbox.exec('npm', ['run', 'build'], { timeoutMs: 120_000 });
// r.code, r.stdout, r.stderr (con secretos redactados), r.timedOut
```

## Política

```ts
{
  allowedCommands: ['node','npm','npx','pnpm','yarn','tsc','vite','playwright','git','ls','cat','echo'],
  deniedPatterns: [ /rm -rf \//, /curl.*\| sh/, /\bsudo\b/, /~\/\.ssh/, … ],
  network: 'deny',            // solo localhost
  timeoutMs: 120_000,
  maxOutputBytes: 1_000_000,
}
```

## Garantías

- `shell: false` — no hay interpolación de cadenas, no hay inyección de comandos.
- `ScopedFs` confina toda ruta a la raíz.
- `sanitizeEnv()` elimina cualquier variable con KEY/TOKEN/SECRET/PASSWORD/CREDENTIAL/AUTH.
- `redactSecrets()` limpia la salida antes de loguearla.
- Timeout con SIGKILL y tope de bytes.

## Limitación honesta

Esto **no es aislamiento fuerte**. Un binario permitido puede hacer daño dentro de la raíz
del proyecto. Para código no confiable, ejecuta el daemon en un contenedor con
`--network=none` y usuario sin privilegios.
