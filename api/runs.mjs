/**
 * Run completo en una sola invocación.
 *
 * En serverless no hay proceso persistente ni SSE: el daemon local emite eventos por
 * streaming, pero aquí se ejecuta el loop entero y se devuelve el sitio ya generado.
 * El filesystem es de solo lectura salvo /tmp, así que ahí va la salida.
 */
import { bootstrap, Orchestrator } from '../packages/orchestrator/dist/index.js';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
let runtimePromise;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'usa POST' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
    const brief = String(body.brief ?? '').trim();
    if (!brief) return res.status(400).json({ error: 'brief requerido' });

    runtimePromise ??= bootstrap({ repoRoot });
    const runtime = await runtimePromise;

    const outDir = await mkdtemp(path.join(tmpdir(), 'nexora-run-'));
    const orchestrator = new Orchestrator(runtime);
    const phases = [];
    orchestrator.bus.on('phase', (p) => phases.push(p));

    const { report } = await orchestrator.run({
      brief,
      outDir,
      autonomy: body.autonomy ?? 'autonomous',
      usePreviewServer: false,
    });

    // Se devuelve el HTML autocontenido: en serverless no hay dónde servir el sitio.
    const site = path.join(outDir, 'site');
    const [html, css, js] = await Promise.all([
      readFile(path.join(site, 'index.html'), 'utf8'),
      readFile(path.join(site, 'styles.css'), 'utf8').catch(() => ''),
      readFile(path.join(site, 'app.js'), 'utf8').catch(() => ''),
    ]);
    const inlined = html
      .replace(/<link[^>]*styles\.css[^>]*>/, () => `<style>\n${css}\n</style>`)
      .replace(/<script[^>]*src="[^"]*app\.js"[^>]*><\/script>/, () => `<script>\n${js}\n</script>`);

    res.status(200).json({
      ok: true,
      gate: report.gate,
      issues: report.issues,
      phases: phases.map((p) => p.phase),
      html: inlined,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, where: 'api/runs' });
  }
}
