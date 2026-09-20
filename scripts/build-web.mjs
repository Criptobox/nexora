#!/usr/bin/env node
/**
 * Prepara `public/` para un hosting estático (Vercel).
 * La UI vive en apps/web/public; aquí se copia y se marca como build de despliegue.
 */
import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'apps/web/public');
const out = path.join(root, 'public');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(src, out, { recursive: true });

// En serverless no hay SSE ni proceso persistente: la UI debe saberlo para no
// intentar abrir un EventSource que nunca emitirá eventos.
const marker = '<!-- deploy-target -->';
const indexPath = path.join(out, 'index.html');
let html = await readFile(indexPath, 'utf8');
if (!html.includes(marker)) {
  html = html.replace('</head>', `  ${marker}\n  <script>window.NEXORA_DEPLOY = 'serverless';</script>\n</head>`);
  await writeFile(indexPath, html);
}

console.log(`public/ listo para desplegar (origen: apps/web/public)`);
