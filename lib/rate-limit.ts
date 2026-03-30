import { NextRequest } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

const CLEANUP_INTERVAL = 60000
let lastCleanup = Date.now()

function cleanupExpiredEntries() {
  const now = Date.now()
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
    lastCleanup = now
  }
}

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
  
  const sessionId = request.cookies.get("session_id")?.value
  
  return sessionId ? `session:${sessionId}` : `ip:${ip}`
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  cleanupExpiredEntries()

  const identifier = getClientIdentifier(request)
  const now = Date.now()
  const windowStart = now - config.windowMs

  if (!store[identifier] || store[identifier].resetTime < now) {
    store[identifier] = {
      count: 1,
      resetTime: now + config.windowMs,
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: store[identifier].resetTime,
    }
  }

  const entry = store[identifier]

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  entry.count++

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  }
}

export const rateLimitConfigs = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  chat: { maxRequests: 30, windowMs: 60 * 1000 },
  deploy: { maxRequests: 10, windowMs: 60 * 1000 },
  publish: { maxRequests: 5, windowMs: 60 * 1000 },
  fileEdit: { maxRequests: 50, windowMs: 60 * 1000 },
}
