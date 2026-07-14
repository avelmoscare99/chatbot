import { AuthError, verifyFirebaseToken } from './auth'
import { corsHeaders, preflightResponse } from './cors'
import type { Env } from './types'

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers }
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return preflightResponse(request, env)
    }

    const cors = corsHeaders(request, env)

    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true }, { headers: cors })
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const user = await verifyFirebaseToken(request, env)
        const body = (await request.json().catch(() => ({}))) as { message?: string }

        return json(
          { reply: `(stub) Worker received: "${body.message ?? ''}" from uid ${user.uid}` },
          { headers: cors }
        )
      } catch (err) {
        const status = err instanceof AuthError ? err.status : 500
        const message = err instanceof Error ? err.message : 'Internal error'
        return json({ error: message }, { status, headers: cors })
      }
    }

    return json({ error: 'Not found' }, { status: 404, headers: cors })
  }
} satisfies ExportedHandler<Env>
