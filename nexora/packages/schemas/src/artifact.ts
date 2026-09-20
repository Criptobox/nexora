export const ARTIFACT_TYPES = ['prototype', 'web', 'component', 'design-system', 'image', 'document', 'report'] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export interface ArtifactFile { path: string; contents: string; encoding?: 'utf8' | 'base64'; }

/** Plan §39 / §40 — todo resultado es un artifact identificable y versionado. */
export interface Artifact {
  id: string;
  type: ArtifactType;
  source: string;
  project: string;
  version: string;
  createdAt: string;
  files: ArtifactFile[];
  preview?: string;
  metadata: Record<string, unknown>;
}
