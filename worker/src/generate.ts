import type { ChatTurn } from './router'
import type { RetrievedPlace } from './retrieve'
import type { Env } from './types'

const GENERATION_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8'

function buildSystemPrompt(places: RetrievedPlace[]): string {
  const placeNotes = places
    .map((place) => {
      const lines = [`${place.name} (${place.category}, ${place.barangay})`, place.description]
      if (place.priceRange) lines.push(`Price range: ${place.priceRange}`)
      if (place.priceTier) lines.push(`Price tier: ${place.priceTier}`)
      if (place.hours) lines.push(`Hours: ${place.hours}`)
      if (place.tips) lines.push(`Tips: ${place.tips}`)
      return lines.join('\n')
    })
    .join('\n\n')

  return `You are the Samal Tourism Chatbot, a friendly local guide to Island Garden City of Samal, Philippines.
Here is what you personally know about the places relevant to this conversation:

${placeNotes}

Talk naturally, like a knowledgeable local recommending places to a friend, as if this is just stuff you know - never say phrases like "based on the notes", "according to the information given", "based on the context", or any other reference to where these facts came from.
Only state prices, hours, or details that appear above - never invent ones that aren't there. If asked something the above doesn't cover, say so honestly and naturally, without mentioning notes or context.
Mention the specific place name(s) you're talking about.
When asked for an itinerary, format the answer as a day-by-day markdown list.`
}

export async function streamAnswer(
  env: Env,
  message: string,
  places: RetrievedPlace[],
  history: ChatTurn[]
): Promise<ReadableStream> {
  const recentHistory = history.slice(-6)

  return env.AI.run(GENERATION_MODEL, {
    messages: [{ role: 'system', content: buildSystemPrompt(places) }, ...recentHistory, { role: 'user', content: message }],
    stream: true
  })
}

export function textToEventStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: text })}\n\n`))
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })
}
