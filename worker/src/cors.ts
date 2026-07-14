import type { Env } from './types'

function resolveAllowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin')
  if (!origin) return null
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  return allowed.includes(origin) ? origin : null
}

export function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = resolveAllowedOrigin(request, env)
  const headers: Record<string, string> = { Vary: 'Origin' }
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

export function preflightResponse(request: Request, env: Env): Response {
  const origin = resolveAllowedOrigin(request, env)
  return new Response(null, {
    status: origin ? 204 : 403,
    headers: {
      ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin'
    }
  })
}
