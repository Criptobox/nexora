#!/usr/bin/env node
/** Comprobación de formato mínima: sin tabs, sin espacios finales, salto final. */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', 'dist', '.git', '.nexora', 'examples']);
const fix = process.argv.includes('--fix');

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(full));
    else if (/\.(ts|mjs|js|json|md|css|html)$/.test(e.name)) out.push(full);
  }
  return out;
}

let changed = 0;
for (const file of await walk(repoRoot)) {
  const original = await readFile(file, 'utf8');
  let next = original.replace(/\t/g, '  ').replace(/[ \t]+$/gm, '');
  if (!next.endsWith('\n')) next += '\n';
  if (next === original) continue;
  changed++;
  if (fix) await writeFile(file, next);
  else console.log(`formato: ${path.relative(repoRoot, file)}`);
}
console.log(fix ? `formateados ${changed} archivos` : `${changed} archivos necesitan formato (usa --fix)`);
