# Troubleshooting

## `npm run build` falla con errores de tipos

Compilación incremental corrupta:

```bash
npm run clean && npm run build
```

## "playwright no disponible — Visual QA usará análisis estático"

Es el comportamiento esperado sin Playwright. No es un error: NEXORA degrada y **lo declara**
en el informe. Para QA completo:

```bash
npm i -D playwright && npx playwright install chromium
```

## El gate dice "Partially verified" y no "Verified"

Correcto por diseño. `Partially verified` significa que hay comprobaciones en estado
`unknown` (típicamente "Tests pass", "No critical console errors" y "Regression passed" en
la primera ejecución, porque aún no hay baseline ni navegador). El sistema **no miente**:
mira la tabla del `REPORT.md` para ver exactamente qué falta.

## "no healthy provider available for policy"

Todos los proveedores tienen el circuit breaker abierto o ninguno cubre las capacidades
pedidas. Comprueba con `nexora doctor`. El proveedor `mock` siempre debería estar presente.

## "command not allowed: X"

El sandbox bloqueó un binario fuera de la allowlist. Es intencional. Si el comando es
legítimo, añádelo a `allowedCommands` en la política — y documenta por qué.

## "path traversal blocked"

Algún componente intentó salir de la raíz del proyecto. Siempre es un bug o un intento de
escape: no lo silencies, revisa la ruta.

## El daemon no arranca / puerto ocupado

```bash
PORT=7790 npm run daemon
```

## El preview sale en blanco en la UI

El iframe usa `sandbox="allow-scripts allow-forms"`. Recursos externos (CDN, fuentes
remotas) no cargarán. El sitio generado no los usa; si añadiste alguno, sírvelo local.

## Los tests E2E fallan por timeout

Suben un daemon real. Si la máquina es lenta, aumenta la espera en
`tests/e2e/daemon.test.js` o ejecuta solo unit: `node --test tests/unit`.

## El sitio generado es siempre parecido

Sin proveedor de modelo real, el Code Engine usa su generador determinista (ADR-002). La
dirección visual, la paleta, la tipografía y las secciones sí cambian según el brief.
Configura una API key para obtener variedad real de copy y estructura.

## `Cannot find module '@nexora/core'` al compilar

**Síntoma:** `npm run build` falla con decenas de `error TS2307: Cannot find module
'@nexora/core'` y `TS7006: implicitly has an 'any' type`, aunque `node_modules/@nexora/`
existe y los symlinks del workspace están bien.

**Causa:** hay archivos `.tsbuildinfo` de una compilación anterior pero los directorios
`dist/` no están. TypeScript usa `.tsbuildinfo` para saber qué ya compiló: si dice que
todo está al día, **no emite nada**, y los paquetes que dependen de `@nexora/core` no
encuentran sus `.d.ts`. Pasa al copiar el repo sin `dist/`, al restaurar un backup
parcial o cuando una herramienta excluye `dist/` pero no `*.tsbuildinfo`.

**Solución:**

```bash
npm run rebuild     # equivale a: npm run clean && npm run build
```

`npm run clean` borra los `dist/` y **todos** los `.tsbuildinfo`. No uses
`tsc -b --clean` para esto: necesita los `dist/` para saber qué borrar, así que no
puede recuperarse de este estado.

**Cómo evitarlo:** si empaquetas el repo, excluye ambas cosas a la vez:

```bash
zip -r nexora.zip nexora \
  -x "nexora/node_modules/*" "nexora/**/dist/*" "*.tsbuildinfo"
```
