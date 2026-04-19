import type { TemporaryUnblock } from './types';

export const UNBLOCK_DURATION_MS = 60 * 60 * 1000;

export function pruneExpired(
  list: TemporaryUnblock[],
  now: number = Date.now(),
): TemporaryUnblock[] {
  return list.filter((u) => u.expiresAt > now);
}

export function isTempUnblocked(
  domain: string,
  list: TemporaryUnblock[],
  now: number = Date.now(),
): boolean {
  return list.some((u) => u.domain === domain && u.expiresAt > now);
}
