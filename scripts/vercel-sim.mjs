/**
 * Simulador local del entorno de Vercel: sirve `public/` estático y enruta `/api/*`
 * a las funciones de `api/`. Sirve para probar el despliegue serverless sin desplegar.
 *
 *   npm run build:web && node scripts/vercel-sim.mjs   →  http://127.0.0.1:7801
 *
 * Puerto 7801 a propósito: 7788 es el daemon y 7799 lo usan los tests E2E.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.json':'application/json' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) {
    const name = url.pathname.slice(5).split('/')[0];
    let mod;
    try {
      mod = await import(path.join(root, 'api', name + '.mjs'));
    } catch {
      // Una función inexistente es un 404, no debe tumbar el simulador.
      res.writeHead(404, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: `no existe api/${name}` }));
    }
    let body = '';
    for await (const c of req) body += c;
    const vres = {
      _c: 200,
      status(c) { this._c = c; return this; },
      json(b) { res.writeHead(this._c, { 'content-type': 'application/json' }); res.end(JSON.stringify(b)); },
      setHeader(k, v) { res.setHeader(k, v); },
    };
    await mod.default({ method: req.method, body: body || undefined }, vres);
    return;
  }
  const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  try {
    const data = await readFile(path.join(root, 'public', rel));
    res.writeHead(200, { 'content-type': MIME[path.extname(rel)] ?? 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404).end('not found'); }
});
server.listen(7801, '127.0.0.1', () => console.log('vercel-sim on 7801'));
