import { runTextModel } from './cloudflare'
import type { ScrapableTopic } from './samalguide'

const MAX_ARTICLE_CHARS = 4000

const TOPIC_FIELD_SPECS: Record<ScrapableTopic, string> = {
  touristSpot: `{"name": string, "category": string (e.g. "Beach", "Waterfall", "Viewpoint"), "description": string (2-3 sentences), "location": string (barangay/area within Island Garden City of Samal, Philippines, if mentioned, otherwise ""), "entranceFee": string or "", "operatingHours": string or "", "contactNumber": string or "", "tips": string or "", "priceTier": one of "free","budget","mid","premium" or ""}`,
  restaurant: `{"name": string, "cuisine": string, "description": string (2-3 sentences), "location": string, "operatingHours": string or "", "contactNumber": string or "", "tips": string or "", "priceTier": one of "free","budget","mid","premium" or ""}`,
  accommodation: `{"name": string, "type": string (e.g. "Resort", "Hotel", "Vacation House"), "description": string (2-3 sentences), "location": string, "roomRate": string or "", "checkInTime": string or "", "checkOutTime": string or "", "contactNumber": string or "", "tips": string or "", "amenities": string or "", "priceTier": one of "free","budget","mid","premium" or ""}`,
  transportation: `{"origin": string, "destination": string, "transportType": string (e.g. "Ferry", "Habal-habal", "Van"), "description": string (2-3 sentences), "fare": string or "", "schedule": string or "", "contactNumber": string or "", "tips": string or ""}`
}

function buildExtractionPrompt(
  topic: ScrapableTopic,
  title: string,
  plainText: string,
  tags: string[]
): { system: string; user: string } {
  const system = `You extract structured tourism facts from an article about Island Garden City of Samal, Philippines, for a "${topic}" entry.
Read the article text and respond with ONLY a JSON object, no other text, matching exactly this shape:
${TOPIC_FIELD_SPECS[topic]}
Only include facts explicitly stated in the article. Use "" for any field not mentioned. Do not invent prices, hours, or contact numbers that aren't in the text.`

  const tagLine = tags.length > 0 ? `Tags: ${tags.join(', ')}\n` : ''
  const user = `Article title: ${title}\n${tagLine}\nArticle text:\n${plainText.slice(0, MAX_ARTICLE_CHARS)}`

  return { system, user }
}

function fallbackFields(title: string, plainText: string): Record<string, unknown> {
  return { name: title, description: plainText.slice(0, 500) }
}

export async function extractFields(
  topic: ScrapableTopic,
  title: string,
  plainText: string,
  tags: string[]
): Promise<Record<string, unknown>> {
  const { system, user } = buildExtractionPrompt(topic, title, plainText, tags)

  try {
    const raw = await runTextModel(system, user)
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return fallbackFields(title, plainText)
    return JSON.parse(match[0])
  } catch {
    return fallbackFields(title, plainText)
  }
}
