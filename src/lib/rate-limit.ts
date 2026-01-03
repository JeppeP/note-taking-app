// IP-based rate limiting for API routes
// Edge Runtime compatible (no Node.js APIs)

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

// In-memory store for request counts per IP
// For production with multiple instances, consider using Upstash Redis
const requestCounts = new Map<
  string,
  { count: number; resetAt: number }
>();

/**
 * Rate limit requests based on a unique identifier (typically IP address)
 * Uses a sliding window algorithm
 */
export function rateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  // Clean up expired record
  if (record && now > record.resetAt) {
    requestCounts.delete(identifier);
  }

  const current = requestCounts.get(identifier) || {
    count: 0,
    resetAt: now + WINDOW_MS,
  };

  // Check if limit exceeded
  if (current.count >= MAX_REQUESTS) {
    return {
      success: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      resetAt: new Date(current.resetAt),
    };
  }

  // Increment count
  current.count++;
  requestCounts.set(identifier, current);

  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - current.count,
    resetAt: new Date(current.resetAt),
  };
}

/**
 * Extract client IP address from request headers
 * Checks x-forwarded-for and x-real-ip headers (set by proxies/load balancers)
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2)
  // The first one is the original client IP
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP.trim();
  }

  // Fallback for local development
  return "unknown";
}

// Periodic cleanup to prevent memory leaks
// Runs every 5 minutes to remove expired entries
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, value] of requestCounts.entries()) {
        if (now > value.resetAt) {
          requestCounts.delete(key);
        }
      }
    },
    5 * 60 * 1000
  );
}
