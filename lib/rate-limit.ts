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

  return `ip:${ip}`
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  route = "default"
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request)
  const windowMs = config.windowMs
  const max = config.maxRequests

  cleanupExpiredEntries()

  const key = `${route}:${identifier}`
  const now = Date.now()

  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }

    return {
      success: true,
      limit: max,
      remaining: max - 1,
      reset: store[key].resetTime,
    }
  }

  const entry = store[key]

  if (entry.count >= max) {
    return {
      success: false,
      limit: max,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  entry.count++

  return {
    success: true,
    limit: max,
    remaining: max - entry.count,
    reset: entry.resetTime,
  }
}
