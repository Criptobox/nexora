import { ScopedFs } from '@nexora/core';
import type { ProjectMap, ProjectNode, ProjectNodeType } from '@nexora/schemas';
import type { ScanResult } from './scan.js';

function typeOf(path: string, scan: ScanResult): ProjectNodeType {
  if (scan.tests.includes(path)) return 'test';
  if (scan.configs.includes(path)) return 'config';
  if (scan.styles.includes(path)) return 'style';
  if (scan.assets.includes(path)) return 'asset';
  if (scan.components.includes(path)) return 'component';
  if (scan.pages.includes(path)) return 'page';
  if (/\/api\//.test(path)) return 'api';
  if (/\.(json|ya?ml|csv)$/.test(path)) return 'data';
  return 'component';
}

const IMPORT_RE = /(?:import\s[^'"]*from\s*|import\s*\(|require\(|@import\s+|href="|src=")['"]?([^'"\s)]+)['"]?/g;

/** Plan §29 — grafo consultable para no leer todo el código. */
export async function buildProjectMap(fs: ScopedFs, scan: ScanResult): Promise<ProjectMap> {
  const files = await fs.list('.', { recursive: true });
  const nodes = new Map<string, ProjectNode>();

  for (const path of files) {
    if (/\.(png|jpe?g|webp|avif|gif|woff2?|mp4|ico)$/.test(path)) {
      nodes.set(path, { id: path, type: 'asset', path, dependencies: [], dependents: [], importance: 1, lastModified: (await fs.stat(path)).mtime.toISOString() });
      continue;
    }
    let contents = '';
    try { contents = await fs.read(path); } catch { continue; }
    const deps = [...contents.matchAll(IMPORT_RE)].map((m) => m[1])
      .filter((d) => d.startsWith('.') || d.startsWith('/') || files.includes(d))
      .map((d) => d.replace(/^\.\//, '').replace(/^\//, ''))
      .filter((d, i, a) => a.indexOf(d) === i);
    nodes.set(path, {
      id: path, type: typeOf(path, scan), path, dependencies: deps, dependents: [],
      importance: 1, lastModified: (await fs.stat(path)).mtime.toISOString(),
      designRole: /hero/i.test(path) ? 'hero' : /nav/i.test(path) ? 'navigation' : undefined,
    });
  }

  for (const node of nodes.values()) {
    for (const dep of node.dependencies) {
      const target = [...nodes.keys()].find((k) => k === dep || k.startsWith(dep + '.') || k.endsWith('/' + dep) || k.startsWith(dep + '/index'));
      if (target) nodes.get(target)!.dependents.push(node.id);
    }
  }
  for (const node of nodes.values()) {
    node.importance = 1 + node.dependents.length * 2 + (node.type === 'page' ? 3 : 0) + (scan.entryPoints.includes(node.path) ? 5 : 0);
  }

  return {
    generatedAt: new Date().toISOString(), root: fs.root,
    nodes: [...nodes.values()].sort((a, b) => b.importance - a.importance),
    framework: scan.framework, packageManager: scan.packageManager, entryPoints: scan.entryPoints,
  };
}

/** Consulta barata para el agente: los N nodos más importantes. */
export function topNodes(map: ProjectMap, n = 15): ProjectNode[] { return map.nodes.slice(0, n); }
