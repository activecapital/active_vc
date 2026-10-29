import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { buildContentSecurityPolicy } from "./lib/csp"

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  // Next.js reads the request CSP to nonce its generated startup scripts.
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', contentSecurityPolicy)
  return response
}

export const config = {
  matcher: "/:path*",
}
