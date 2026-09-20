import type { Artifact, ArtifactFile, ArtifactType } from '@nexora/schemas';
import { ScopedFs, shortId, bump, compare } from '@nexora/core';

/** Plan §39/§40 — versionado sin sobrescritura silenciosa. */
export class ArtifactStore {
  constructor(private readonly fs: ScopedFs, private readonly home = '.nexora') {}

  private dir(id: string, version: string) { return `${this.home}/artifacts/${id}/v${version}`; }

  async save(input: {
    id?: string; type: ArtifactType; source: string; project: string;
    version?: string; files: ArtifactFile[]; preview?: string; metadata?: Record<string, unknown>;
  }): Promise<Artifact> {
    const id = input.id ?? shortId('art');
    const version = input.version ?? (await this.nextVersion(id));
    const artifact: Artifact = {
      id, type: input.type, source: input.source, project: input.project, version,
      createdAt: new Date().toISOString(), files: input.files,
      preview: input.preview, metadata: input.metadata ?? {},
    };
    const dir = this.dir(id, version);
    if (await this.fs.exists(`${dir}/artifact.json`)) {
      throw new Error(`refusing to overwrite artifact ${id} v${version}`);
    }
    for (const f of artifact.files) await this.fs.write(`${dir}/files/${f.path}`, f.contents);
    await this.fs.writeJson(`${dir}/artifact.json`, { ...artifact, files: artifact.files.map((f) => ({ path: f.path })) });
    return artifact;
  }

  async versions(id: string): Promise<string[]> {
    const files = await this.fs.list(`${this.home}/artifacts/${id}`, { recursive: true });
    const vs = new Set(files.map((f) => f.split('/').find((p) => p.startsWith('v'))?.slice(1)).filter(Boolean) as string[]);
    return [...vs].sort(compare);
  }
  async nextVersion(id: string): Promise<string> {
    const vs = await this.versions(id);
    return vs.length ? bump(vs[vs.length - 1], 'minor') : '0.1.0';
  }
  async latest(id: string): Promise<Artifact | null> {
    const vs = await this.versions(id);
    if (!vs.length) return null;
    return this.load(id, vs[vs.length - 1]);
  }
  async load(id: string, version: string): Promise<Artifact> {
    const dir = this.dir(id, version);
    const meta = await this.fs.readJson<Artifact>(`${dir}/artifact.json`);
    const paths = (await this.fs.list(`${dir}/files`, { recursive: true }));
    const files: ArtifactFile[] = [];
    for (const p of paths) {
      const rel = p.replace(`${dir}/files/`, '').replace(/^files\//, '');
      files.push({ path: rel, contents: await this.fs.read(`${dir}/files/${rel}`) });
    }
    return { ...meta, files };
  }
  async list(): Promise<string[]> {
    const files = await this.fs.list(`${this.home}/artifacts`, { recursive: true });
    return [...new Set(files.map((f) => f.split('/')[0]).filter(Boolean))];
  }
}
