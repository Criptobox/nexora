import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { NEXORA_VERSION } from '../../packages/core/dist/index.js';

// Regresión: la UI mostraba v0.1.0 con el paquete ya en 0.1.1. La versión vive en dos
// sitios (package.json y core/version.ts) y hay que mantenerlos sincronizados.
test('NEXORA_VERSION coincide con la versión del package.json raíz', async () => {
  const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  assert.equal(
    NEXORA_VERSION,
    pkg.version,
    `core/version.ts dice ${NEXORA_VERSION} pero package.json dice ${pkg.version}`,
  );
});
