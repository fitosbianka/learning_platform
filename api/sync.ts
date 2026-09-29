/**
 * Sync endpoint, runs as a Vercel serverless function. Stores one JSON
 * record per device code in an Upstash Redis database, which is created
 * once through the Vercel dashboard (Storage, Upstash for Redis) and
 * connected to this project. The integration injects the credentials as
 * environment variables, no code change is needed.
 *
 * GET  /api/sync?code=XXXX          returns { exists, data }
 * PUT  /api/sync  { code, data }    stores the record
 *
 * Without the database the endpoint answers 503 and the app shows a
 * friendly hint instead of the sync section.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CODE_RE = /^[a-z0-9]{10,24}$/;
const MAX_BYTES = 900 * 1024;
const KEY_PREFIX = 'zahnkurs:';
/** Records disappear after two years without any sync. */
const TTL_SECONDS = 60 * 60 * 24 * 730;

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? null;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? null;
  if (!url || !token) return null;
  return { url, token };
}

async function redisCommand(config: { url: string; token: string }, command: string[]): Promise<unknown> {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) {
    throw new Error(`redis status ${response.status}`);
  }
  const payload = (await response.json()) as { result?: unknown; error?: string };
  if (payload.error) throw new Error(payload.error);
  return payload.result ?? null;
}

function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const code = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  return CODE_RE.test(code) ? code : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  const config = redisConfig();
  if (!config) {
    // A missing database is an expected state, not an error, so the
    // browser console stays clean while the store is not set up yet.
    res.status(200).json({ configured: false });
    return;
  }

  try {
    if (req.method === 'GET') {
      const code = normalizeCode(req.query.code);
      if (!code) {
        res.status(400).json({ error: 'bad_code' });
        return;
      }
      const raw = await redisCommand(config, ['GET', KEY_PREFIX + code]);
      if (typeof raw !== 'string' || raw === '') {
        res.status(200).json({ exists: false });
        return;
      }
      let data: unknown;
      try {
        data = JSON.parse(raw);
      } catch {
        res.status(200).json({ exists: false });
        return;
      }
      res.status(200).json({ exists: true, data });
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<string, unknown>;
      const code = normalizeCode(body.code);
      if (!code) {
        res.status(400).json({ error: 'bad_code' });
        return;
      }
      if (typeof body.data !== 'object' || body.data === null) {
        res.status(400).json({ error: 'bad_data' });
        return;
      }
      const serialized = JSON.stringify(body.data);
      if (serialized.length > MAX_BYTES) {
        res.status(413).json({ error: 'too_large' });
        return;
      }
      await redisCommand(config, ['SET', KEY_PREFIX + code, serialized, 'EX', String(TTL_SECONDS)]);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'method_not_allowed' });
  } catch {
    res.status(502).json({ error: 'storage_unreachable' });
  }
}
