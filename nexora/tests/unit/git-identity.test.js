import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { GitEngine } from '../../packages/git/dist/index.js';
import { Sandbox, DEFAULT_POLICY } from '../../packages/sandbox/dist/index.js';

// Regresión: init() salía antes si el repo ya existía, sin configurar la identidad.
// En una máquina sin git config global, checkpoint() fallaba con "Author identity
// unknown" y devolvía null — el run seguía como si nada, sin punto de restauración.
test('checkpoint funciona en un repo preexistente sin identidad global', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'nx-git-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  await writeFile(path.join(dir, 'index.html'), '<!doctype html><title>t</title>');

  const git = new GitEngine(new Sandbox({ ...DEFAULT_POLICY, root: dir }));
  const sha = await git.checkpoint('test');

  assert.ok(sha, 'checkpoint devolvió null: el commit no llegó a crearse');
  assert.match(sha, /^[0-9a-f]{7,40}$/, `sha inesperado: ${sha}`);
});

test('no se sobrescribe una identidad ya configurada en el repo', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'nx-git-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'yo@ejemplo.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Yo'], { cwd: dir });
  await writeFile(path.join(dir, 'a.txt'), 'hola');

  const git = new GitEngine(new Sandbox({ ...DEFAULT_POLICY, root: dir }));
  await git.checkpoint('test');

  const email = execFileSync('git', ['config', '--get', 'user.email'], { cwd: dir }).toString().trim();
  assert.equal(email, 'yo@ejemplo.com', 'NEXORA pisó la identidad del usuario');
});

// Regresión: un segundo checkpoint sin cambios registraba "commit failed" y devolvía
// null. git sale con código 1 en "nothing to commit", pero eso es un no-op, no un
// error: el árbol ya está en el estado deseado y el checkpoint es el HEAD actual.
test('un checkpoint sin cambios devuelve el HEAD en vez de fallar', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'nx-git-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  await writeFile(path.join(dir, 'a.txt'), 'hola');

  const git = new GitEngine(new Sandbox({ ...DEFAULT_POLICY, root: dir }));
  const first = await git.checkpoint('uno');
  const second = await git.checkpoint('dos');

  assert.ok(first, 'el primer checkpoint debería crear un commit');
  assert.ok(second, 'el segundo checkpoint no debe devolver null sin cambios');
  assert.equal(second, first, 'sin cambios, el checkpoint es el mismo HEAD');
});
