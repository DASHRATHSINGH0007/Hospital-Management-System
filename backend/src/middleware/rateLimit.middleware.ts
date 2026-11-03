import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter
 * @param windowMs Window duration in milliseconds (default: 60s)
 * @param maxRequests Maximum allowed requests per window (default: 60)
 */
export const rateLimiter = (windowMs: number = 60000, maxRequests: number = 60) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const record = ipRequestMap.get(ip);

    if (!record || now > record.resetTime) {
      ipRequestMap.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests from this IP. Please wait ${retryAfterSeconds} seconds before retrying.`,
          retryAfterSeconds,
        },
      });
    }

    record.count += 1;
    next();
  };
};

/**
 * Strict rate limiter for authentication routes (prevents brute-force)
 */
export const authRateLimiter = rateLimiter(60000, 10); // 10 login requests per minute
