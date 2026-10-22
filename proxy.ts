import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { buildContentSecurityPolicy } from "./lib/csp"

const SESSION_MAX_AGE_HOURS = 1

export async function proxy(request: NextRequest) {
  const isProd = process.env.VERCEL_ENV === "production"
  const supabaseUrl = isProd
    ? process.env.NEXT_PUBLIC_PRODUCTION_SUPABASE_URL!
    : process.env.NEXT_PUBLIC_STAGING_SUPABASE_URL!
  const supabaseAnonKey = isProd
    ? process.env.NEXT_PUBLIC_PRODUCTION_SUPABASE_ANON_KEY!
    : process.env.NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY!

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce, supabaseUrl)
  const createResponse = () => {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('x-pathname', request.nextUrl.pathname)
    // Next.js reads the request CSP to nonce its generated startup scripts.
    requestHeaders.set('Content-Security-Policy', contentSecurityPolicy)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }
  let supabaseResponse = createResponse()

  if (supabaseAnonKey) {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = createResponse()
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Required to keep session fresh — do not add logic between this and getUser()
    const { data: { user } } = await supabase.auth.getUser()

    // Enforce session max age on admin routes
    if (request.nextUrl.pathname.startsWith("/admin") && user?.last_sign_in_at) {
      const ageHours =
        (Date.now() - new Date(user.last_sign_in_at).getTime()) /
        (1000 * 60 * 60)

      if (ageHours > SESSION_MAX_AGE_HOURS) {
        await supabase.auth.signOut()
        const url = request.nextUrl.clone()
        url.pathname = "/admin"
        const redirectResponse = NextResponse.redirect(url)
        redirectResponse.headers.set('Content-Security-Policy', contentSecurityPolicy)
        // Transfer the sign-out Set-Cookie headers so session cookies are deleted
        const signOutCookies =
          (supabaseResponse.headers as any).getSetCookie?.() ?? []
        signOutCookies.forEach((cookie: string) => {
          redirectResponse.headers.append("set-cookie", cookie)
        })
        return redirectResponse
      }
    }
  }

  supabaseResponse.headers.set("x-pathname", request.nextUrl.pathname)
  supabaseResponse.headers.set('Content-Security-Policy', contentSecurityPolicy)
  return supabaseResponse
}

export const config = {
  matcher: "/:path*",
}
