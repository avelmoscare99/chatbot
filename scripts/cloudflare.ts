const CF_API_BASE = 'https://api.cloudflare.com/client/v4'

interface CloudflareResponse<T> {
  success: boolean
  errors: Array<{ code: number; message: string }>
  result: T | null
}

function cloudflareHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!token) {
    throw new Error('CLOUDFLARE_API_TOKEN is not set')
  }
  return { Authorization: `Bearer ${token}`, ...extra }
}

function accountId(): string {
  const id = process.env.CLOUDFLARE_ACCOUNT_ID
  if (!id) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID is not set')
  }
  return id
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await fetch(
    `${CF_API_BASE}/accounts/${accountId()}/ai/run/@cf/baai/bge-m3`,
    {
      method: 'POST',
      headers: cloudflareHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ text: texts })
    }
  )
  const json = (await response.json()) as CloudflareResponse<{ data: number[][] }>
  if (!json.success || !json.result) {
    throw new Error(`Workers AI embedding request failed: ${JSON.stringify(json.errors)}`)
  }
  return json.result.data
}

export interface VectorizeRecord {
  id: string
  values: number[]
  metadata: Record<string, string>
}

export async function upsertVectors(indexName: string, records: VectorizeRecord[]): Promise<void> {
  const body = records.map((record) => JSON.stringify(record)).join('\n')
  const response = await fetch(
    `${CF_API_BASE}/accounts/${accountId()}/vectorize/v2/indexes/${indexName}/upsert`,
    {
      method: 'POST',
      headers: cloudflareHeaders({ 'Content-Type': 'application/x-ndjson' }),
      body
    }
  )
  const json = (await response.json()) as CloudflareResponse<{ mutationId: string }>
  if (!json.success) {
    throw new Error(`Vectorize upsert failed: ${JSON.stringify(json.errors)}`)
  }
}
