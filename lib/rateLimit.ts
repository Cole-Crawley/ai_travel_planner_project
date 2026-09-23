import { NextRequest, NextResponse } from 'next/server';

// The live demo runs on my own API key, so slow down anyone planning far more
// trips than a person would. Per-instance and best-effort: serverless instances
// come and go, and the spend limit on the Anthropic account is the real ceiling.
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

export function rateLimit(req: NextRequest, bucket: string, maxPerWindow: number): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (recent.length <= maxPerWindow) return null;
  return NextResponse.json(
    {
      error: 'rate_limit',
      message: "That's a lot of planning in a short time. Please try again in a few minutes.",
      retryAfter: WINDOW_MS / 1000,
    },
    { status: 429 },
  );
}
