import { randomUUID } from 'node:crypto';
let counter = 0;
export function uuid(): string { return randomUUID(); }
export function shortId(prefix = 'nx'): string {
  counter = (counter + 1) % 100000;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}
export function seqId(prefix: string, n: number, width = 3): string {
  return `${prefix}-${String(n).padStart(width, '0')}`;
}
