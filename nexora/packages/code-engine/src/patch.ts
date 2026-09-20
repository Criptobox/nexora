import type { ArtifactFile } from '@nexora/schemas';

export interface Patch { path: string; find: string | RegExp; replace: string; description: string; }

/** Sistema de parches determinista con verificación de aplicación (plan FASE 9). */
export function applyPatches(files: ArtifactFile[], patches: Patch[]): { files: ArtifactFile[]; applied: Patch[]; failed: Patch[] } {
  const out = files.map((f) => ({ ...f }));
  const applied: Patch[] = [], failed: Patch[] = [];
  for (const p of patches) {
    const file = out.find((f) => f.path === p.path);
    if (!file) { failed.push(p); continue; }
    const before = file.contents;
    file.contents = typeof p.find === 'string'
      ? file.contents.split(p.find).join(p.replace)
      : file.contents.replace(p.find, p.replace);
    (before === file.contents ? failed : applied).push(p);
  }
  return { files: out, applied, failed };
}

export function upsertFile(files: ArtifactFile[], file: ArtifactFile): ArtifactFile[] {
  const i = files.findIndex((f) => f.path === file.path);
  if (i < 0) return [...files, file];
  const copy = [...files];
  copy[i] = file;
  return copy;
}
