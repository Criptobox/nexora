import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fsp } from 'node:fs';
import { bootstrap, Orchestrator } from '@nexora/orchestrator';
import { analyzeIntent, planDiscovery, generateDirections } from '@nexora/design-engine';
import { createLogger, NEXORA_VERSION, shortId } from '@nexora/core';

const log = createLogger('daemon');
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const PORT = Number(process.env.PORT ?? 7788);
const HOST = process.env.HOST ?? '0.0.0.0';
const WEB_DIR = path.join(repoRoot, 'apps/web/public');

interface Run { id: string; status: string; events: unknown[]; report?: unknown; outDir: string; }
const runs = new Map<string, Run>();
const listeners = new Map<string, Set<http.ServerResponse>>();

function json(res: http.ServerResponse, code: number, body: unknown) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' }).end(JSON.stringify(body));
}
async function readBody(req: http.IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}
function push(runId: string, event: string, payload: unknown) {
  const run = runs.get(runId);
  run?.events.push({ event, payload, ts: new Date().toISOString() });
  for (const res of listeners.get(runId) ?? []) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  }
}

const MIME: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' };

async function main() {
  const runtime = await bootstrap({ repoRoot });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' }).end();
      return;
    }

    // API
    if (url.pathname === '/api/health') {
      return json(res, 200, { ok: true, version: NEXORA_VERSION, providers: runtime.providers.ids(), skills: runtime.skills.list().length, agents: runtime.agents.list().map((a) => a.id) });
    }
    if (url.pathname === '/api/plan' && req.method === 'POST') {
      const body = await readBody(req);
      const brief = String(body.brief ?? '');
      if (!brief) return json(res, 400, { error: 'brief requerido' });
      const intent = analyzeIntent(brief);
      return json(res, 200, { intent, discovery: planDiscovery(intent, body.autonomy ?? 'balanced'), directions: generateDirections(intent, 3) });
    }
    if (url.pathname === '/api/runs' && req.method === 'POST') {
      const body = await readBody(req);
      const brief = String(body.brief ?? '');
      if (!brief) return json(res, 400, { error: 'brief requerido' });
      const id = shortId('run');
      const outDir = path.join(repoRoot, 'examples/output', id);
      runs.set(id, { id, status: 'running', events: [], outDir });

      const orchestrator = new Orchestrator(runtime);
      for (const ev of ['phase', 'task', 'issue', 'question', 'error'] as const) {
        orchestrator.bus.on(ev, (p) => push(id, ev, p));
      }
      // El orchestrator emite su propio 'done' interno sin gate. Se reenvía con otro
      // nombre para que no se confunda con el evento terminal del run, que lleva el informe.
      orchestrator.bus.on('done', (p) => push(id, 'phase-done', p));
      orchestrator.run({ brief, outDir, autonomy: body.autonomy ?? 'balanced', directionChoice: body.direction, usePreviewServer: false })
        .then((o) => { const r = runs.get(id)!; r.status = 'done'; r.report = o.report; push(id, 'done', o.report); })
        .catch((e) => { const r = runs.get(id)!; r.status = 'failed'; push(id, 'error', { where: 'run', what: e.message, tried: 'orchestrator.run', canDo: 'revisar logs', needs: 'intervención' }); });

      return json(res, 202, { id, stream: `/api/runs/${id}/events`, output: `/api/runs/${id}` });
    }
    const runMatch = url.pathname.match(/^\/api\/runs\/([\w-]+)(\/events)?$/);
    if (runMatch) {
      const run = runs.get(runMatch[1]);
      if (!run) return json(res, 404, { error: 'run no encontrado' });
      if (runMatch[2]) {
        res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', 'access-control-allow-origin': '*' });
        if (!listeners.has(run.id)) listeners.set(run.id, new Set());
        listeners.get(run.id)!.add(res);
        for (const e of run.events as any[]) res.write(`event: ${e.event}\ndata: ${JSON.stringify(e.payload)}\n\n`);
        req.on('close', () => listeners.get(run.id)?.delete(res));
        return;
      }
      return json(res, 200, run);
    }
    const siteMatch = url.pathname.match(/^\/preview\/([\w-]+)\/(.*)$/);
    if (siteMatch) {
      const run = runs.get(siteMatch[1]);
      if (!run) return json(res, 404, { error: 'run no encontrado' });
      const rel = siteMatch[2] || 'index.html';
      const abs = path.resolve(run.outDir, 'site', rel);
      if (!abs.startsWith(path.resolve(run.outDir))) { res.writeHead(403).end('forbidden'); return; }
      try {
        const data = await fsp.readFile(abs);
        res.writeHead(200, { 'content-type': MIME[path.extname(abs)] ?? 'application/octet-stream' }).end(data);
      } catch { res.writeHead(404).end('not found'); }
      return;
    }

    // UI estática
    const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const abs = path.resolve(WEB_DIR, rel);
    if (abs.startsWith(WEB_DIR)) {
      try {
        const data = await fsp.readFile(abs);
        res.writeHead(200, { 'content-type': MIME[path.extname(abs)] ?? 'application/octet-stream' }).end(data);
        return;
      } catch { /* cae al 404 */ }
    }
    json(res, 404, { error: 'not found' });
  });

  server.listen(PORT, HOST, () => log.info(`NEXORA daemon en http://${HOST}:${PORT}`));
}

main().catch((e) => { console.error(e); process.exit(1); });
