/**
 * Простой in-memory rate-limiter (fixed window) для не-auth API.
 * Достаточно для одного процесса Node (VPS); auth-роуты лимитирует
 * сам better-auth через MongoDB.
 */

type WindowEntry = { count: number; resetAt: number };

const buckets = new Map<string, WindowEntry>();

const MAX_BUCKETS = 10_000;

export function checkRateLimit(
    key: string,
    { windowMs, max }: { windowMs: number; max: number },
): { allowed: boolean; retryAfterSec: number } {
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || entry.resetAt <= now) {
        // Защита от разрастания Map.
        if (buckets.size >= MAX_BUCKETS) {
            for (const [k, v] of buckets) {
                if (v.resetAt <= now) buckets.delete(k);
            }
        }
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSec: 0 };
    }

    entry.count += 1;
    if (entry.count > max) {
        return {
            allowed: false,
            retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
        };
    }
    return { allowed: true, retryAfterSec: 0 };
}

/** IP клиента из заголовков (за nginx/прокси — x-forwarded-for). */
export function getClientIp(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.headers.get('x-real-ip') || 'unknown';
}
