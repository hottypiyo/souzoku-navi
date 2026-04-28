// In-memory rate limiter — best-effort for serverless (each instance is independent).
// Primary card-testing protection is Stripe's automatic rate limiting.

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

interface Options {
  windowMs: number;
  max: number;
}

export function checkRateLimit(key: string, { windowMs, max }: Options): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count += 1;
  return true;
}
