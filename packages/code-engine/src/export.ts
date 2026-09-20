import type { ArtifactFile } from '@nexora/schemas';
import { ScopedFs } from '@nexora/core';

/** Plan FASE 16 — export: primero ZIP/HTML/Git; los deploy adapters se declaran, no se fingen. */
export async function exportToDir(files: ArtifactFile[], fs: ScopedFs, dir: string): Promise<string[]> {
  const written: string[] = [];
  for (const f of files) { await fs.write(`${dir}/${f.path}`, f.contents); written.push(`${dir}/${f.path}`); }
  return written;
}

export interface DeployAdapter { id: string; status: 'PLANNED' | 'IMPLEMENTING' | 'VERIFIED'; requires: string[]; }

export const DEPLOY_ADAPTERS: DeployAdapter[] = [
  { id: 'zip', status: 'VERIFIED', requires: [] },
  { id: 'local-dir', status: 'VERIFIED', requires: [] },
  { id: 'git', status: 'VERIFIED', requires: ['git'] },
  { id: 'vercel', status: 'PLANNED', requires: ['VERCEL_TOKEN'] },
  { id: 'netlify', status: 'PLANNED', requires: ['NETLIFY_TOKEN'] },
  { id: 'cloudflare-pages', status: 'PLANNED', requires: ['CF_API_TOKEN'] },
  { id: 'github-pages', status: 'PLANNED', requires: ['GITHUB_TOKEN'] },
];
