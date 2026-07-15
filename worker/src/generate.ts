import type { ChatTurn } from './router'
import type { RetrievedPlace } from './retrieve'
import type { Env } from './types'

const GENERATION_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8'

const SYSTEM_PROMPT = `You are the Samal Tourism Chatbot, a helpful guide to Island Garden City of Samal, Philippines.
Answer ONLY using the CONTEXT provided in the user message - do not use outside knowledge about specific places, prices, or hours.
If the CONTEXT does not contain enough information to answer, say so plainly instead of guessing.
Always mention which place(s) your answer is based on by name.
When asked for an itinerary, format the answer as a day-by-day markdown list.`

function buildContextBlock(places: RetrievedPlace[]): string {
  return places
    .map((place) => {
      const lines = [`${place.name} (${place.category}, ${place.barangay})`, place.description]
      if (place.priceRange) lines.push(`Price range: ${place.priceRange}`)
      if (place.priceTier) lines.push(`Price tier: ${place.priceTier}`)
      if (place.hours) lines.push(`Hours: ${place.hours}`)
      if (place.tips) lines.push(`Tips: ${place.tips}`)
      return lines.join('\n')
    })
    .join('\n\n')
}

export async function streamAnswer(
  env: Env,
  message: string,
  places: RetrievedPlace[],
  history: ChatTurn[]
): Promise<ReadableStream> {
  const contextBlock = buildContextBlock(places)
  const recentHistory = history.slice(-6)

  return env.AI.run(GENERATION_MODEL, {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentHistory,
      { role: 'user', content: `CONTEXT:\n${contextBlock}\n\nQUESTION: ${message}` }
    ],
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
