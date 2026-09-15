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

function fallbackFields(topic: ScrapableTopic, title: string, plainText: string): Record<string, unknown> {
  const description = plainText.slice(0, 500)
  switch (topic) {
    case 'touristSpot':
      return { name: title, category: '', description, location: '' }
    case 'restaurant':
      return { name: title, cuisine: '', description, location: '' }
    case 'accommodation':
      return { name: title, type: '', description, location: '' }
    case 'transportation':
      return { origin: title, destination: '', transportType: '', description }
  }
}

const IDENTITY_FIELD: Record<ScrapableTopic, string> = {
  touristSpot: 'name',
  restaurant: 'name',
  accommodation: 'name',
  transportation: 'origin'
}

function isValidExtraction(topic: ScrapableTopic, parsed: unknown): parsed is Record<string, unknown> {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false
  const record = parsed as Record<string, unknown>
  const identity = record[IDENTITY_FIELD[topic]]
  return (
    typeof identity === 'string' &&
    identity.trim().length > 0 &&
    typeof record.description === 'string' &&
    record.description.trim().length > 0
  )
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
    if (!match) return fallbackFields(topic, title, plainText)
    const parsed = JSON.parse(match[0])
    return isValidExtraction(topic, parsed) ? parsed : fallbackFields(topic, title, plainText)
  } catch {
    return fallbackFields(topic, title, plainText)
  }
}
