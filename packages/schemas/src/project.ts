export interface ProjectManifest {
  id: string;
  name: string;
  slug: string;
  brief: string;
  mode: 'create' | 'existing';
  createdAt: string;
  updatedAt: string;
  version: string;
  stack: string[];
  autonomy: 'guided' | 'balanced' | 'autonomous' | 'expert';
}

export type ProjectNodeType =
  | 'page' | 'component' | 'data' | 'style' | 'asset' | 'api' | 'dependency' | 'test' | 'config';

/** Plan §29 — nodo del Project Map. */
export interface ProjectNode {
  id: string;
  type: ProjectNodeType;
  path: string;
  dependencies: string[];
  dependents: string[];
  importance: number;
  lastModified: string;
  designRole?: string;
}

export interface ProjectMap {
  generatedAt: string;
  root: string;
  nodes: ProjectNode[];
  framework?: string;
  packageManager?: string;
  entryPoints: string[];
}
