import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  private getClientKey(request: NextRequest): string {
    // Use IP address as primary identifier
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               request.ip || 
               'unknown';
    
    // Add user agent as secondary identifier to prevent simple IP spoofing
    const userAgent = request.headers.get('user-agent') || 'unknown';
    return `${ip}:${userAgent.slice(0, 50)}`;
  }

  public checkLimit(
    request: NextRequest, 
    maxRequests: number = 100, 
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getClientKey(request);
    const now = Date.now();
    const resetTime = now + windowMs;

    if (!this.store[key] || this.store[key].resetTime <= now) {
      // First request or window expired
      this.store[key] = {
        count: 1,
        resetTime
      };
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime
      };
    }

    // Increment counter
    this.store[key].count++;

    return {
      allowed: this.store[key].count <= maxRequests,
      remaining: Math.max(0, maxRequests - this.store[key].count),
      resetTime: this.store[key].resetTime
    };
  }

  public destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Different rate limits for different endpoint types
export const rateLimits = {
  // Strict limits for expensive operations
  upload: { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 uploads per 15 min
  process: { maxRequests: 20, windowMs: 15 * 60 * 1000 }, // 20 processes per 15 min
  chat: { maxRequests: 50, windowMs: 15 * 60 * 1000 }, // 50 chats per 15 min
  
  // More lenient for read operations
  files: { maxRequests: 200, windowMs: 15 * 60 * 1000 }, // 200 file ops per 15 min
  
  // General API limit
  general: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 min
};

export function createRateLimitResponse(remaining: number, resetTime: number) {
  const headers = new Headers();
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
  headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
  
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
    }),
    { 
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(headers.entries())
      }
    }
  );
}

export { rateLimiter };