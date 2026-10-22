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

  const sessionId = request.cookies.get("sb-session-token")?.value || request.cookies.get("session_id")?.value

  return sessionId ? `session:${sessionId}` : `ip:${ip}`
}

// Distributed counter via Upstash Redis REST. Returns null when Redis is not
// configured or the call fails, so callers can fall back to the in-memory store.
// Uses a single atomic pipe: INCR then set the TTL to the window length.
async function checkRedis(
  identifier: string,
  route: string,
  windowMs: number,
  max: number
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const key = `${route}:${identifier}`
  const windowSec = Math.max(1, Math.round(windowMs / 1000))

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        commands: [
          ["incr", key],
          ["pexpire", key, windowSec],
        ],
      }),
    })

    if (!res.ok) return null
    const json = await res.json()
    const count = Number(json.results?.[0] ?? 0)
    if (!Number.isFinite(count)) return null

    return {
      success: count <= max,
      limit: max,
      remaining: Math.max(0, max - count),
      reset: Date.now() + windowMs,
    }
  } catch {
    return null
  }
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  route = "default"
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request)
  const windowMs = config.windowMs
  const max = config.maxRequests

  // Prefer a shared Redis counter in production (serverless instances are
  // ephemeral, so the in-memory store alone does not persist across requests).
  const redis = await checkRedis(identifier, route, windowMs, max)
  if (redis) return redis

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

export const rateLimitConfigs = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  chat: { maxRequests: 30, windowMs: 60 * 1000 },
  deploy: { maxRequests: 10, windowMs: 60 * 1000 },
  publish: { maxRequests: 5, windowMs: 60 * 1000 },
  fileEdit: { maxRequests: 50, windowMs: 60 * 1000 },
}
