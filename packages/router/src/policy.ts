import type { ModelCapability } from '@nexora/schemas';

/** Perfiles de routing del plan §12. */
export const ROUTING_PROFILES = {
  'design-concept': ['REASONING', 'TEXT'],
  'discovery': ['FAST', 'TEXT'],
  'code': ['CODE', 'REASONING'],
  'visual-critique': ['VISION'],
  'quick-fix': ['FAST', 'CODE'],
  'local': ['LOCAL'],
  'complex': ['REASONING', 'LONG_CONTEXT'],
  'general': ['TEXT'],
} as const satisfies Record<string, readonly ModelCapability[]>;

export type RoutingProfile = keyof typeof ROUTING_PROFILES;

export interface RoutePolicy {
  profile?: RoutingProfile;
  capabilities?: ModelCapability[];
  /** Fuerza un proveedor concreto (modo Expert, plan §45). */
  pin?: string;
  preferLocal?: boolean;
  maxCostUsdPer1k?: number;
}

export function resolveCapabilities(policy: RoutePolicy): ModelCapability[] {
  const fromProfile = policy.profile ? [...ROUTING_PROFILES[policy.profile]] : [];
  return [...new Set([...(policy.capabilities ?? []), ...fromProfile])];
}
