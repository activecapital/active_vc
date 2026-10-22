export function buildContentSecurityPolicy(
  nonce: string,
  supabaseUrl?: string,
  isDevelopment = process.env.NODE_ENV === 'development',
): string {
  const scriptSources = `'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://stats.g.doubleclick.net${isDevelopment ? " 'unsafe-eval'" : ''}`
  const supabaseOrigin = supabaseUrl ? ` ${new URL(supabaseUrl).origin}` : ''

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "font-src 'self' https: data:",
    "img-src 'self' data: https://cdn.bunny.net",
    "style-src 'self' 'unsafe-inline'",
    `script-src ${scriptSources}`,
    `script-src-elem ${scriptSources}`,
    `connect-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net https://analytics.vercel.com https://speed-insights.vercel.com${supabaseOrigin}`,
    "frame-src 'self' https://www.googletagmanager.com",
  ].join('; ')
}
