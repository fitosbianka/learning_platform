/**
 * Client side of the device sync. Talks to /api/sync, which stores one
 * record per device code. The code is generated on the first device and
 * entered once on every further device, afterwards the app pulls and
 * pushes automatically.
 */

import type { SyncPayload } from '../storage/storage';
import { parseSyncPayload } from '../storage/storage';

/** Without lookalike characters, so the code is easy to type. */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const CODE_LENGTH = 12;

export function generateSyncCode(): string {
  const values = new Uint32Array(CODE_LENGTH);
  crypto.getRandomValues(values);
  let code = '';
  for (const v of values) code += ALPHABET[v % ALPHABET.length];
  return code;
}

/** Accepts pasted codes with spaces or capitals, rejects everything else. */
export function normalizeSyncCode(raw: string): string | null {
  const code = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  return /^[a-z0-9]{10,24}$/.test(code) ? code : null;
}

/** Groups of four, easier to read out and to type. */
export function formatSyncCode(code: string): string {
  return code.replace(/(.{4})(?=.)/g, '$1 ');
}

export function pairingLink(code: string, origin: string): string {
  return `${origin}/#/einstellungen?verbinden=${code}`;
}

export type PullResult =
  | { status: 'ok'; payload: SyncPayload | null }
  | { status: 'unconfigured' }
  | { status: 'error' };

export type PushResult = 'ok' | 'unconfigured' | 'error';

type FetchLike = typeof fetch;

export async function pullRemote(code: string, fetchFn: FetchLike = fetch): Promise<PullResult> {
  try {
    const response = await fetchFn(`/api/sync?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 503) return { status: 'unconfigured' };
    if (!response.ok) return { status: 'error' };
    const body = (await response.json()) as { configured?: boolean; exists?: boolean; data?: unknown };
    if (body.configured === false) return { status: 'unconfigured' };
    if (!body.exists) return { status: 'ok', payload: null };
    try {
      return { status: 'ok', payload: parseSyncPayload(body.data) };
    } catch {
      return { status: 'error' };
    }
  } catch {
    return { status: 'error' };
  }
}

export async function pushRemote(
  code: string,
  payload: SyncPayload,
  fetchFn: FetchLike = fetch,
): Promise<PushResult> {
  try {
    const response = await fetchFn('/api/sync', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, data: payload }),
    });
    if (response.status === 503) return 'unconfigured';
    if (!response.ok) return 'error';
    const body = (await response.json()) as { configured?: boolean };
    return body.configured === false ? 'unconfigured' : 'ok';
  } catch {
    return 'error';
  }
}
