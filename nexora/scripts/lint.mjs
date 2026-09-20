#!/usr/bin/env node
/** Linter propio (ADR-008): reglas específicas de este proyecto, cero dependencias. */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', 'dist', '.git', '.nexora', 'examples', 'uploads']);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(full));
    else if (/\.(ts|mjs|js)$/.test(e.name) && !/\.d\.ts$/.test(e.name)) out.push(full);
  }
  return out;
}

const RULES = [
  { id: 'no-console-in-packages', test: (l, f) => f.includes('/packages/') && !f.includes('/logger.ts') && /^\s*console\.(log|info)\(/.test(l), msg: 'usa el logger en lugar de console en packages/' },
  { id: 'no-debugger', test: (l) => /^\s*debugger\s*;?\s*$/.test(l), msg: 'debugger olvidado' },
  { id: 'no-only', test: (l) => /\b(test|describe)\.only\(/.test(l), msg: 'test.only olvidado' },
  { id: 'no-todo-fixme', test: (l) => /\b(TODO|FIXME|XXX)\b/.test(l), msg: 'marca pendiente sin registrar en CAPABILITIES.md', warn: true },
  { id: 'no-hardcoded-key', test: (l) => /(sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,})/.test(l), msg: 'posible secreto hardcodeado' },
  { id: 'no-empty-catch', test: (l) => /catch\s*(\([^)]*\))?\s*\{\s*\}/.test(l), msg: 'catch vacío sin comentario que lo justifique' },
  { id: 'no-shell-true', test: (l) => /shell:\s*true/.test(l), msg: 'spawn con shell:true está prohibido (ADR-003)' },
];

// El propio linter contiene los patrones que busca: se excluye a sí mismo.
const SELF = path.resolve(repoRoot, 'scripts/lint.mjs');

let errors = 0, warnings = 0;
for (const file of await walk(repoRoot)) {
  if (file === SELF) continue;
  const lines = (await readFile(file, 'utf8')).split('\n');
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      if (!rule.test(line, file)) continue;
      const rel = path.relative(repoRoot, file);
      const level = rule.warn ? 'warn' : 'error';
      console.log(`${level === 'error' ? '❌' : '⚠️ '} ${rel}:${i + 1}  [${rule.id}] ${rule.msg}`);
      rule.warn ? warnings++ : errors++;
    }
  });
}

console.log(`\nlint: ${errors} errores, ${warnings} avisos`);
process.exit(errors ? 1 : 0);
