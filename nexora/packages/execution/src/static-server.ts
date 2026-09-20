import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { AddressInfo } from 'node:net';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

export interface StaticServer { url: string; port: number; close: () => Promise<void>; }

/** Sirve el proyecto generado para preview y QA. Confinado al directorio raíz. */
export async function serveStatic(root: string, opts: { port?: number; host?: string } = {}): Promise<StaticServer> {
  const rootAbs = path.resolve(root);
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const abs = path.resolve(rootAbs, '.' + rel);
      if (!abs.startsWith(rootAbs)) { res.writeHead(403).end('forbidden'); return; }
      let data: Buffer;
      try { data = await fs.readFile(abs); }
      catch {
        try { data = await fs.readFile(path.join(rootAbs, 'index.html')); }
        catch { res.writeHead(404).end('not found'); return; }
      }
      res.writeHead(200, {
        'content-type': MIME[path.extname(abs).toLowerCase()] ?? 'application/octet-stream',
        'cache-control': 'no-store',
      }).end(data);
    } catch (e) { res.writeHead(500).end(String(e)); }
  });

  await new Promise<void>((resolve) => server.listen(opts.port ?? 0, opts.host ?? '0.0.0.0', resolve));
  const port = (server.address() as AddressInfo).port;
  return {
    url: `http://localhost:${port}`, port,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
