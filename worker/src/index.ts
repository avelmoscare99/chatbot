import { AuthError, verifyFirebaseToken } from './auth'
import { corsHeaders, preflightResponse } from './cors'
import { streamAnswer, textToEventStream } from './generate'
import { retrievePlaces } from './retrieve'
import { classifyQuery, type ChatTurn, type Intent } from './router'
import type { Env } from './types'

interface ChatRequestBody {
  message?: string
  history?: ChatTurn[]
}

const CANNED_REPLIES = {
  GREETING:
    "Hi! I'm the Samal Tourism Chatbot. Ask me about attractions, resorts, activities, or request an itinerary for Island Garden City of Samal.",
  OUT_OF_SCOPE:
    'I can only help with questions about Samal Island tourism - attractions, resorts, activities, and itineraries. Could you ask something related to that?',
  WEB_SEARCH:
    "I don't have live or current information for that (like today's prices, weather, or schedules) - I only know the curated Samal tourism content in my database.",
  NO_RESULTS:
    "I couldn't find anything about that in the Samal tourism database yet. Try asking about a specific attraction, resort, or activity."
}

const TOP_K_BY_INTENT: Partial<Record<Intent, number>> = {
  PLACE_LOOKUP: 3,
  FOLLOW_UP: 3,
  TOPIC_SEARCH: 6,
  ITINERARY_REQUEST: 10
}

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers }
  })
}

function eventStreamResponse(stream: ReadableStream, cors: Record<string, string>): Response {
  return new Response(stream, {
    headers: {
      ...cors,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  })
}

async function handleChat(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  await verifyFirebaseToken(request, env)
  const body = (await request.json().catch(() => ({}))) as ChatRequestBody
  const message = (body.message ?? '').trim()
  const history = Array.isArray(body.history) ? body.history : []

  if (!message) {
    return json({ error: 'message is required' }, { status: 400, headers: cors })
  }

  const classified = await classifyQuery(env, message, history)

  if (classified.intent === 'GREETING') {
    return eventStreamResponse(textToEventStream(CANNED_REPLIES.GREETING), cors)
  }
  if (classified.intent === 'OUT_OF_SCOPE') {
    return eventStreamResponse(textToEventStream(CANNED_REPLIES.OUT_OF_SCOPE), cors)
  }
  if (classified.intent === 'WEB_SEARCH') {
    return eventStreamResponse(textToEventStream(CANNED_REPLIES.WEB_SEARCH), cors)
  }

  const topK = TOP_K_BY_INTENT[classified.intent] ?? 5
  const places = await retrievePlaces(env, classified.standaloneQuery, { topK })

  if (places.length === 0) {
    return eventStreamResponse(textToEventStream(CANNED_REPLIES.NO_RESULTS), cors)
  }

  const stream = await streamAnswer(env, message, places, history)
  return eventStreamResponse(stream, cors)
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
        return await handleChat(request, env, cors)
      } catch (err) {
        const status = err instanceof AuthError ? err.status : 500
        const message = err instanceof Error ? err.message : 'Internal error'
        return json({ error: message }, { status, headers: cors })
      }
    }

    return json({ error: 'Not found' }, { status: 404, headers: cors })
  }
} satisfies ExportedHandler<Env>
