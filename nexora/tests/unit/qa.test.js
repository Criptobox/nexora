import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { codeQa, functionalQa, expectationsFor, performanceQa, verificationGate, RegressionEngine } from '../../packages/qa/dist/index.js';
import { contrastRatio, meetsAA, snapshotDom, analyzeVisual } from '../../packages/vision/dist/index.js';
import { ScopedFs } from '../../packages/core/dist/index.js';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('qa', () => {
  test('codeQa detecta secretos y eval', () => {
    const issues = codeQa([{ path: 'app.js', contents: 'const api_key = "abcdefghijkl"; eval(x);' }]);
    assert.ok(issues.some((i) => i.severity === 'critical'));
    assert.ok(issues.some((i) => /eval/.test(i.title)));
  });

  test('contraste WCAG calculado correctamente', () => {
    assert.equal(contrastRatio('#000000', '#ffffff'), 21);
    assert.ok(meetsAA(contrastRatio('#ffffff', '#0b1f2a')));
    assert.equal(meetsAA(contrastRatio('#777777', '#888888')), false);
  });

  test('snapshotDom extrae estructura', () => {
    const s = snapshotDom('<html lang="es"><head><title>T</title></head><body><main><h1>Hola</h1><img src="a.png"></main></body></html>');
    assert.equal(s.lang, 'es');
    assert.equal(s.title, 'T');
    assert.equal(s.headings.length, 1);
    assert.ok(s.landmarks.includes('main'));
  });

  test('analyzeVisual reporta falta de h1 y viewport', () => {
    const r = analyzeVisual({ html: '<html><body><p>hola</p></body></html>', css: '' });
    assert.ok(r.issues.some((i) => /H1/i.test(i.title)));
    assert.ok(r.issues.some((i) => /viewport/i.test(i.title)));
    assert.ok(r.scores.overall < 100);
    assert.equal(r.observedWithBrowser, false);
  });

  test('functionalQa valida requisitos derivados del brief', () => {
    const exp = expectationsFor(['whatsapp', 'menu'], 'Pedir por WhatsApp');
    const bad = functionalQa('<html><body></body></html>', exp);
    assert.ok(bad.length >= 3);
    const good = functionalQa('<html><head><title>X</title></head><body><nav></nav><footer></footer><a href="https://wa.me/5350000000">Pedir</a><section id="menu">€8.50</section></body></html>', exp);
    assert.ok(good.length < bad.length);
  });

  test('performanceQa aplica presupuesto', () => {
    const issues = performanceQa([{ path: 'styles.css', contents: 'a{}'.repeat(40000) }]);
    assert.ok(issues.some((i) => /CSS pesado/.test(i.title)));
  });

  test('verificationGate nunca declara Verified con fallos', () => {
    const fail = verificationGate({ requirementsMet: true, buildOk: false, testsOk: true, consoleClean: true, visualQaPassed: true, responsivePassed: true, accessibilityPassed: true, regressionPassed: true, changesSaved: true, issues: [] });
    assert.equal(fail.level, 'Not verified');
    assert.ok(fail.blocking.includes('Build works'));

    const partial = verificationGate({ requirementsMet: true, buildOk: true, testsOk: null, consoleClean: null, visualQaPassed: true, responsivePassed: true, accessibilityPassed: true, regressionPassed: true, changesSaved: true, issues: [] });
    assert.equal(partial.level, 'Partially verified');

    const full = verificationGate({ requirementsMet: true, buildOk: true, testsOk: true, consoleClean: true, visualQaPassed: true, responsivePassed: true, accessibilityPassed: true, regressionPassed: true, changesSaved: true, issues: [] });
    assert.equal(full.level, 'Verified');
    assert.equal(full.verified, true);
  });

  test('regresión detecta pérdida de contenido', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'nx-reg-'));
    const fs = new ScopedFs(dir);
    const engine = new RegressionEngine(fs);
    const full = '<html><body>' + '<p>contenido importante aquí</p>'.repeat(20) + '</body></html>';
    await engine.saveBaseline('index', full);
    const same = await engine.compare('index', full);
    assert.equal(same.changed, false);
    const stripped = await engine.compare('index', '<html><body><p>uno</p></body></html>');
    assert.ok(stripped.issues.length > 0);
  });
});
