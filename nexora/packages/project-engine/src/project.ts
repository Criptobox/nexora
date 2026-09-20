import { ScopedFs, shortId, slugify, titleCase } from '@nexora/core';
import type { ProjectManifest } from '@nexora/schemas';

export class Project {
  readonly fs: ScopedFs;
  constructor(readonly root: string, public manifest: ProjectManifest, readonly home = '.nexora') {
    this.fs = new ScopedFs(root);
  }

  static async create(root: string, opts: { brief: string; name?: string; autonomy?: ProjectManifest['autonomy'] }): Promise<Project> {
    const fs = new ScopedFs(root);
    await fs.ensureDir('.');
    const name = opts.name ?? titleCase(slugify(opts.brief.split(/[.,\n]/)[0] ?? 'nexora project').replace(/-/g, ' '));
    const manifest: ProjectManifest = {
      id: shortId('prj'), name, slug: slugify(name), brief: opts.brief, mode: 'create',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      version: '0.1.0', stack: ['html', 'css', 'javascript'], autonomy: opts.autonomy ?? 'balanced',
    };
    const project = new Project(root, manifest);
    await project.initHome();
    await project.save();
    return project;
  }

  static async open(root: string): Promise<Project> {
    const fs = new ScopedFs(root);
    const manifest = await fs.readJson<ProjectManifest>('.nexora/config/manifest.json');
    return new Project(root, manifest);
  }

  /** Plan §59 — .nexora/ separado del proyecto del usuario. */
  async initHome(): Promise<void> {
    for (const dir of ['memory', 'artifacts', 'snapshots', 'logs', 'cache', 'config', 'baselines', 'reports']) {
      await this.fs.ensureDir(`${this.home}/${dir}`);
    }
  }

  async save(): Promise<void> {
    this.manifest.updatedAt = new Date().toISOString();
    await this.fs.writeJson(`${this.home}/config/manifest.json`, this.manifest);
  }
}
