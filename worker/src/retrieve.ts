import type { TourismTopic } from '../../types/tourism'
import type { Env } from './types'

const EMBEDDING_MODEL = '@cf/baai/bge-m3'

export interface RetrievedTouristSpot {
  topic: 'touristSpot'
  id: string
  score: number
  name: string
  category: string
  description: string
  location: string
  entranceFee: string
  priceTier: string
  hours: string
  tips: string
  contactNumber: string
}

export interface RetrievedRestaurant {
  topic: 'restaurant'
  id: string
  score: number
  name: string
  cuisine: string
  description: string
  location: string
  hours: string
  tips: string
  contactNumber: string
  priceTier: string
}

export interface RetrievedAccommodation {
  topic: 'accommodation'
  id: string
  score: number
  name: string
  type: string
  description: string
  location: string
  roomRate: string
  priceTier: string
  tips: string
  contactNumber: string
}

export interface RetrievedTransportation {
  topic: 'transportation'
  id: string
  score: number
  origin: string
  destination: string
  transportType: string
  description: string
  fare: string
  schedule: string
  tips: string
  contactNumber: string
}

export interface RetrievedEmergencyContact {
  topic: 'emergencyContact'
  id: string
  score: number
  officeName: string
  contactNumber: string
  description: string
}

export interface RetrievedFaq {
  topic: 'faq'
  id: string
  score: number
  category: string
  question: string
  answer: string
  keywords: string
}

export type RetrievedItem =
  | RetrievedTouristSpot
  | RetrievedRestaurant
  | RetrievedAccommodation
  | RetrievedTransportation
  | RetrievedEmergencyContact
  | RetrievedFaq

export interface RetrieveOptions {
  topK?: number
  filter?: VectorizeVectorMetadataFilter
}

export async function embedQuery(env: Env, text: string): Promise<number[]> {
  const result = (await env.AI.run(EMBEDDING_MODEL, { text: [text] })) as { data: number[][] }
  return result.data[0]
}

export async function retrievePlaces(
  env: Env,
  queryText: string,
  options: RetrieveOptions = {}
): Promise<RetrievedItem[]> {
  const vector = await embedQuery(env, queryText)
  const results = await env.VECTORIZE.query(vector, {
    topK: options.topK ?? 5,
    returnMetadata: 'all',
    filter: options.filter
  })
  return results.matches.map(toRetrievedItem)
}

function toRetrievedItem(match: VectorizeMatch): RetrievedItem {
  const m = (match.metadata ?? {}) as Record<string, string>
  const base = { id: match.id, score: match.score }

  switch (m.topic as TourismTopic) {
    case 'restaurant':
      return {
        ...base,
        topic: 'restaurant',
        name: m.name ?? '',
        cuisine: m.category ?? '',
        description: m.description ?? '',
        location: m.location ?? '',
        hours: m.hours ?? '',
        tips: m.tips ?? '',
        contactNumber: m.contactNumber ?? '',
        priceTier: m.priceTier ?? ''
      }
    case 'accommodation':
      return {
        ...base,
        topic: 'accommodation',
        name: m.name ?? '',
        type: m.category ?? '',
        description: m.description ?? '',
        location: m.location ?? '',
        roomRate: m.priceInfo ?? '',
        priceTier: m.priceTier ?? '',
        tips: m.tips ?? '',
        contactNumber: m.contactNumber ?? ''
      }
    case 'transportation':
      return {
        ...base,
        topic: 'transportation',
        origin: m.origin ?? '',
        destination: m.destination ?? '',
        transportType: m.transportType ?? '',
        description: m.description ?? '',
        fare: m.priceInfo ?? '',
        schedule: m.hours ?? '',
        tips: m.tips ?? '',
        contactNumber: m.contactNumber ?? ''
      }
    case 'emergencyContact':
      return {
        ...base,
        topic: 'emergencyContact',
        officeName: m.name ?? '',
        contactNumber: m.contactNumber ?? '',
        description: m.description ?? ''
      }
    case 'faq':
      return {
        ...base,
        topic: 'faq',
        category: m.category ?? '',
        question: m.question ?? '',
        answer: m.description ?? '',
        keywords: m.keywords ?? ''
      }
    case 'touristSpot':
    default:
      return {
        ...base,
        topic: 'touristSpot',
        name: m.name ?? '',
        category: m.category ?? '',
        description: m.description ?? '',
        location: m.location ?? '',
        entranceFee: m.priceInfo ?? '',
        priceTier: m.priceTier ?? '',
        hours: m.hours ?? '',
        tips: m.tips ?? '',
        contactNumber: m.contactNumber ?? ''
      }
  }
}
