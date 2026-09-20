import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ScopedFs, slugify, bump, compare, EventBus, ok, err, unwrap } from '../../packages/core/dist/index.js';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('core', () => {
  test('slugify normaliza acentos y símbolos', () => {
    assert.equal(slugify('Hamburguesería Frente al Mar'), 'hamburgueseria-frente-al-mar');
    assert.equal(slugify('   '), 'project');
  });

  test('semver bump y compare', () => {
    assert.equal(bump('0.1.0', 'minor'), '0.2.0');
    assert.equal(bump('1.2.3', 'major'), '2.0.0');
    assert.equal(bump('1.2.3', 'patch'), '1.2.4');
    assert.ok(compare('1.0.0', '0.9.9') > 0);
  });

  test('Result helpers', () => {
    assert.equal(unwrap(ok(42)), 42);
    assert.throws(() => unwrap(err('boom')));
  });

  test('EventBus entrega y desuscribe', () => {
    const bus = new EventBus();
    let n = 0;
    const off = bus.on('x', () => n++);
    bus.emit('x', {}); bus.emit('x', {});
    off();
    bus.emit('x', {});
    assert.equal(n, 2);
  });

  test('ScopedFs bloquea path traversal', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'nx-'));
    const fs = new ScopedFs(dir);
    await fs.write('a/b.txt', 'hola');
    assert.equal(await fs.read('a/b.txt'), 'hola');
    assert.throws(() => fs.resolve('../../etc/passwd'));
    assert.ok(await fs.exists('a/b.txt'));
  });
});
