export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
  retryAfterSeconds?: number;
}

interface ClientRecord {
  timestamps: number[];
}

export class RateLimiter {
  private clients: Map<string, ClientRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic garbage collection every 60 seconds
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
      if (this.cleanupInterval && typeof this.cleanupInterval.unref === "function") {
        this.cleanupInterval.unref();
      }
    }
  }

  checkLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let record = this.clients.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.clients.set(identifier, record);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= config.maxRequests) {
      const oldestInWindow = record.timestamps[0] || now;
      const resetTimeMs = oldestInWindow + config.windowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTimeMs,
        retryAfterSeconds,
      };
    }

    record.timestamps.push(now);

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - record.timestamps.length,
      resetTimeMs: now + config.windowMs,
      retryAfterSeconds: 0,
    };
  }

  check(identifier: string, config: RateLimitConfig): RateLimitResult {
    return this.checkLimit(identifier, config);
  }

  private cleanup(): void {
    const now = Date.now();
    const maxWindow = 300000; // 5 minutes max window retention
    for (const [key, record] of this.clients.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > now - maxWindow);
      if (record.timestamps.length === 0) {
        this.clients.delete(key);
      }
    }
  }

  reset(): void {
    this.clients.clear();
  }
}

export const rateLimiter = new RateLimiter();

export const RATE_LIMIT_POLICIES: Record<string, RateLimitConfig> = {
  standard: { maxRequests: 60, windowMs: 60000 },     // 60 req/min
  ai: { maxRequests: 20, windowMs: 60000 },           // 20 req/min for AI endpoints
  upload: { maxRequests: 10, windowMs: 60000 },       // 10 uploads/min
  publicShare: { maxRequests: 120, windowMs: 60000 },  // 120 req/min for public snapshot reads
};
