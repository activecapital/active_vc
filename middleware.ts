import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_MAX_AGE_HOURS = 1

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const isProd = process.env.VERCEL_ENV === "production"
  const supabaseUrl = isProd
    ? process.env.NEXT_PUBLIC_PRODUCTION_SUPABASE_URL!
    : process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = isProd
    ? process.env.NEXT_PUBLIC_PRODUCTION_SUPABASE_ANON_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
            supabaseResponse = NextResponse.next({ request })
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
  return supabaseResponse
}

export const config = {
  matcher: "/:path*",
}
