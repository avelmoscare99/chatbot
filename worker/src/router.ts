import type { Env } from './types'

export type Intent =
  | 'GREETING'
  | 'PLACE_LOOKUP'
  | 'TOPIC_SEARCH'
  | 'ITINERARY_REQUEST'
  | 'FOLLOW_UP'
  | 'WEB_SEARCH'
  | 'OUT_OF_SCOPE'

const INTENTS: Intent[] = [
  'GREETING',
  'PLACE_LOOKUP',
  'TOPIC_SEARCH',
  'ITINERARY_REQUEST',
  'FOLLOW_UP',
  'WEB_SEARCH',
  'OUT_OF_SCOPE'
]

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface ClassifiedQuery {
  intent: Intent
  standaloneQuery: string
  placeName: string
}

const CLASSIFIER_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8'

const SYSTEM_PROMPT = `You are the query classifier for a Samal Island (Philippines) tourism chatbot.
Classify the user's latest message into exactly one of these intents:

GREETING - small talk, hello, thanks, goodbye, no travel content
PLACE_LOOKUP - asking about one specific named place (an attraction, resort, restaurant, or activity)
TOPIC_SEARCH - asking for places matching a topic, theme, or criteria without naming one specific place
ITINERARY_REQUEST - asking for a day-by-day plan or itinerary
FOLLOW_UP - a short follow-up question that only makes sense in light of the previous turns
WEB_SEARCH - asking for something time-sensitive or outside a static tourism database (current prices, weather, news, ferry schedules today)
OUT_OF_SCOPE - anything unrelated to Samal Island tourism

Respond with ONLY a JSON object, no other text, in this exact shape:
{"intent": "<one of the intents above>", "standaloneQuery": "<the user's request rewritten as a standalone search query, resolving any pronouns/references using the conversation history>", "placeName": "<the specific place name mentioned, or empty string if none>"}`

export async function classifyQuery(env: Env, message: string, history: ChatTurn[]): Promise<ClassifiedQuery> {
  const recentHistory = history.slice(-4)
  const historyText = recentHistory.map((turn) => `${turn.role}: ${turn.content}`).join('\n')
  const userContent = historyText ? `Conversation so far:\n${historyText}\n\nLatest message: ${message}` : message

  const result = await env.AI.run(CLASSIFIER_MODEL, {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent }
    ]
  })

  return parseClassification(result.response ?? '', message)
}

function parseClassification(raw: string, fallbackQuery: string): ClassifiedQuery {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) {
    return { intent: 'TOPIC_SEARCH', standaloneQuery: fallbackQuery, placeName: '' }
  }

  try {
    const parsed = JSON.parse(match[0])
    const intent = INTENTS.includes(parsed.intent) ? (parsed.intent as Intent) : 'TOPIC_SEARCH'
    const standaloneQuery =
      typeof parsed.standaloneQuery === 'string' && parsed.standaloneQuery.trim()
        ? parsed.standaloneQuery
        : fallbackQuery
    const placeName = typeof parsed.placeName === 'string' ? parsed.placeName : ''
    return { intent, standaloneQuery, placeName }
  } catch {
    return { intent: 'TOPIC_SEARCH', standaloneQuery: fallbackQuery, placeName: '' }
  }
}
