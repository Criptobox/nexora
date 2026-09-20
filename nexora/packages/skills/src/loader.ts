import { ScopedFs } from '@nexora/core';
import type { Skill } from './skill.js';

/** Parser de SKILL.md: frontmatter YAML mínimo + secciones markdown. */
export function parseSkillMarkdown(raw: string, path: string): Skill {
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta: Record<string, any> = {};
  if (fm) {
    let currentKey: string | null = null;
    for (const line of fm[1].split('\n')) {
      const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
      const item = line.match(/^\s*-\s+(.*)$/);
      if (kv) {
        currentKey = kv[1];
        meta[currentKey] = kv[2] === '' ? [] : kv[2].replace(/^["']|["']$/g, '');
      } else if (item && currentKey) {
        if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
        meta[currentKey].push(item[1].replace(/^["']|["']$/g, ''));
      }
    }
  }
  const body = raw.slice(fm?.[0].length ?? 0);
  // Trocea el cuerpo en secciones "## Nombre" (incluida la última, hasta el fin del documento).
  const sections = new Map<string, string[]>();
  let current: string | null = null;
  for (const line of body.split('\n')) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) { current = heading[1].toLowerCase(); sections.set(current, []); continue; }
    if (!current) continue;
    const item = line.replace(/^\s*[-*]\s+/, '').trim();
    if (item && !item.startsWith('#')) sections.get(current)!.push(item);
  }
  const section = (name: string): string[] => sections.get(name.toLowerCase()) ?? [];
  const arr = (v: unknown): string[] => Array.isArray(v) ? v : v ? [String(v)] : [];
  return {
    id: meta.id ?? path.split('/').slice(-2, -1)[0] ?? 'unknown',
    version: meta.version ?? '0.1.0',
    name: meta.name ?? meta.id ?? 'unnamed skill',
    category: (meta.category ?? 'design') as Skill['category'],
    purpose: meta.purpose ?? section('Purpose').join(' '),
    whenToUse: arr(meta.when_to_use).concat(section('When to use')),
    inputs: arr(meta.inputs).concat(section('Inputs')),
    outputs: arr(meta.outputs).concat(section('Outputs')),
    permissions: arr(meta.permissions),
    path,
    rules: section('Rules'),
    antiPatterns: section('Anti-patterns'),
    references: section('References'),
    validation: section('Validation'),
    examples: section('Examples'),
    body,
  };
}

export async function loadSkillsFromDir(fs: ScopedFs, dir = 'skills'): Promise<Skill[]> {
  const files = (await fs.list(dir, { recursive: true })).filter((f) => f.endsWith('SKILL.md'));
  const skills: Skill[] = [];
  for (const f of files) skills.push(parseSkillMarkdown(await fs.read(f), f));
  return skills;
}
