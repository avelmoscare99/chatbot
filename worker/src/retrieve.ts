import type { Env } from './types'

const EMBEDDING_MODEL = '@cf/baai/bge-m3'

export interface RetrievedPlace {
  id: string
  score: number
  name: string
  type: string
  category: string
  barangay: string
  description: string
  priceTier: string
  priceRange: string
  hours: string
  tips: string
}

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
): Promise<RetrievedPlace[]> {
  const vector = await embedQuery(env, queryText)
  const results = await env.VECTORIZE.query(vector, {
    topK: options.topK ?? 5,
    returnMetadata: 'all',
    filter: options.filter
  })
  return results.matches.map(toRetrievedPlace)
}

function toRetrievedPlace(match: VectorizeMatch): RetrievedPlace {
  const metadata = (match.metadata ?? {}) as Record<string, string>
  return {
    id: match.id,
    score: match.score,
    name: metadata.name ?? '',
    type: metadata.type ?? '',
    category: metadata.category ?? '',
    barangay: metadata.barangay ?? '',
    description: metadata.description ?? '',
    priceTier: metadata.priceTier ?? '',
    priceRange: metadata.priceRange ?? '',
    hours: metadata.hours ?? '',
    tips: metadata.tips ?? ''
  }
}
