import type { ChatTurn } from './router'
import type { RetrievedItem } from './retrieve'
import type { Env } from './types'

const GENERATION_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8'

function formatItem(item: RetrievedItem): string {
  switch (item.topic) {
    case 'touristSpot': {
      const lines = [`${item.name} (${item.category}, ${item.location})`, item.description]
      if (item.entranceFee) lines.push(`Entrance fee: ${item.entranceFee}`)
      if (item.priceTier) lines.push(`Price tier: ${item.priceTier}`)
      if (item.hours) lines.push(`Hours: ${item.hours}`)
      if (item.tips) lines.push(`Tips: ${item.tips}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      return lines.join('\n')
    }
    case 'restaurant': {
      const lines = [`${item.name}, a ${item.cuisine} spot in ${item.location}`, item.description]
      if (item.hours) lines.push(`Hours: ${item.hours}`)
      if (item.tips) lines.push(`Tips: ${item.tips}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      return lines.join('\n')
    }
    case 'accommodation': {
      const lines = [`${item.name}, a ${item.type} in ${item.location}`, item.description]
      if (item.roomRate) lines.push(`Room rate: ${item.roomRate}`)
      if (item.tips) lines.push(`Tips: ${item.tips}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      return lines.join('\n')
    }
    case 'transportation': {
      const lines = [`Getting from ${item.origin} to ${item.destination} by ${item.transportType}`, item.description]
      if (item.fare) lines.push(`Fare: ${item.fare}`)
      if (item.schedule) lines.push(`Schedule: ${item.schedule}`)
      if (item.tips) lines.push(`Tips: ${item.tips}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      return lines.join('\n')
    }
    case 'emergencyContact':
      return `${item.officeName} — ${item.description}\nContact: ${item.contactNumber}`
    case 'faq':
      return `Q: ${item.question}\nA: ${item.answer}`
  }
}

function buildSystemPrompt(items: RetrievedItem[]): string {
  const notes = items.map(formatItem).join('\n\n')

  return `You are the Samal Tourism Chatbot, a friendly local guide to Island Garden City of Samal, Philippines.
Here is what you personally know about the places, food spots, stays, transport, contacts, and facts relevant to this conversation:

${notes}

Talk naturally, like a knowledgeable local recommending places to a friend, as if this is just stuff you know - never say phrases like "based on the notes", "according to the information given", "based on the context", or any other reference to where these facts came from.
Only state prices, hours, fares, or contact details that appear above - never invent ones that aren't there. If asked something the above doesn't cover, say so honestly and naturally, without mentioning notes or context.
Mention the specific name(s) you're talking about.
When asked for an itinerary, format the answer as a day-by-day markdown list.`
}

export async function streamAnswer(
  env: Env,
  message: string,
  items: RetrievedItem[],
  history: ChatTurn[]
): Promise<ReadableStream> {
  const recentHistory = history.slice(-6)

  return env.AI.run(GENERATION_MODEL, {
    messages: [{ role: 'system', content: buildSystemPrompt(items) }, ...recentHistory, { role: 'user', content: message }],
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
