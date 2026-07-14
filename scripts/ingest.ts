import 'dotenv/config'
import { embedTexts, upsertVectors, type VectorizeRecord } from './cloudflare'
import { getAdminFirestore } from './firebaseAdmin'
import type { TourismContentItem } from '../types/tourism'

const VECTORIZE_INDEX = 'samal-tourism'
const BATCH_SIZE = 50

function buildTextBlob(item: TourismContentItem): string {
  const parts = [`${item.name} — ${item.category} in ${item.barangay}.`, item.description]
  if (item.priceRange) parts.push(`Price range: ${item.priceRange}.`)
  if (item.hours) parts.push(`Hours: ${item.hours}.`)
  if (item.tips) parts.push(`Tips: ${item.tips}.`)
  return parts.join(' ')
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

async function main() {
  const firestore = getAdminFirestore()
  const snapshot = await firestore.collection('tourismContent').get()
  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as TourismContentItem)

  if (items.length === 0) {
    console.log('No tourismContent documents found. Run `pnpm seed` first.')
    return
  }

  let upserted = 0
  for (const batch of chunk(items, BATCH_SIZE)) {
    const texts = batch.map(buildTextBlob)
    const embeddings = await embedTexts(texts)

    const records: VectorizeRecord[] = batch.map((item, index) => ({
      id: item.id,
      values: embeddings[index],
      metadata: {
        type: item.type,
        name: item.name,
        category: item.category,
        barangay: item.barangay,
        priceTier: item.priceTier ?? ''
      }
    }))

    await upsertVectors(VECTORIZE_INDEX, records)
    upserted += records.length
  }

  console.log(`Upserted ${upserted} vectors into "${VECTORIZE_INDEX}".`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
