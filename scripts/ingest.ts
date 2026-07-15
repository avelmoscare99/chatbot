import 'dotenv/config'
import { embedTexts, upsertVectors, type VectorizeRecord } from './cloudflare'
import { getAdminFirestore } from './firebaseAdmin'
import type { TourismRecord } from '../types/tourism'

const VECTORIZE_INDEX = 'samal-tourism'
const BATCH_SIZE = 50

const COLLECTIONS = ['touristSpots', 'restaurants', 'accommodations', 'transportation', 'emergencyContacts', 'faqs']

function buildTextBlob(record: TourismRecord): string {
  switch (record.topic) {
    case 'touristSpot': {
      const parts = [`${record.name} — ${record.category} in ${record.location}.`, record.description]
      if (record.entranceFee) parts.push(`Entrance fee: ${record.entranceFee}.`)
      if (record.operatingHours) parts.push(`Hours: ${record.operatingHours}.`)
      if (record.tips) parts.push(`Tips: ${record.tips}.`)
      if (record.contactNumber) parts.push(`Contact: ${record.contactNumber}.`)
      return parts.join(' ')
    }
    case 'restaurant': {
      const parts = [`${record.name} — a ${record.cuisine} restaurant in ${record.location}.`, record.description]
      if (record.operatingHours) parts.push(`Hours: ${record.operatingHours}.`)
      if (record.tips) parts.push(`Tips: ${record.tips}.`)
      if (record.contactNumber) parts.push(`Contact: ${record.contactNumber}.`)
      return parts.join(' ')
    }
    case 'accommodation': {
      const parts = [`${record.name} — a ${record.type} in ${record.location}.`, record.description]
      if (record.roomRate) parts.push(`Room rate: ${record.roomRate}.`)
      if (record.tips) parts.push(`Tips: ${record.tips}.`)
      if (record.contactNumber) parts.push(`Contact: ${record.contactNumber}.`)
      return parts.join(' ')
    }
    case 'transportation': {
      const parts = [`Getting from ${record.origin} to ${record.destination} by ${record.transportType}.`, record.description]
      if (record.fare) parts.push(`Fare: ${record.fare}.`)
      if (record.schedule) parts.push(`Schedule: ${record.schedule}.`)
      if (record.tips) parts.push(`Tips: ${record.tips}.`)
      if (record.contactNumber) parts.push(`Contact: ${record.contactNumber}.`)
      return parts.join(' ')
    }
    case 'emergencyContact':
      return `${record.officeName}. ${record.description} Contact number: ${record.contactNumber}.`
    case 'faq': {
      const parts = [record.question, `Topic: ${record.category}.`]
      if (record.keywords?.length) parts.push(`Keywords: ${record.keywords.join(', ')}.`)
      return parts.join(' ')
    }
  }
}

function toMetadata(record: TourismRecord): Record<string, string> {
  const empty: Record<string, string> = {
    topic: record.topic,
    name: '',
    category: '',
    location: '',
    description: '',
    priceTier: '',
    priceInfo: '',
    hours: '',
    tips: '',
    contactNumber: '',
    origin: '',
    destination: '',
    transportType: '',
    question: '',
    keywords: ''
  }

  switch (record.topic) {
    case 'touristSpot':
      return {
        ...empty,
        name: record.name,
        category: record.category,
        location: record.location,
        description: record.description,
        priceTier: record.priceTier ?? '',
        priceInfo: record.entranceFee ?? '',
        hours: record.operatingHours ?? '',
        tips: record.tips ?? '',
        contactNumber: record.contactNumber ?? ''
      }
    case 'restaurant':
      return {
        ...empty,
        name: record.name,
        category: record.cuisine,
        location: record.location,
        description: record.description,
        priceTier: record.priceTier ?? '',
        hours: record.operatingHours ?? '',
        tips: record.tips ?? '',
        contactNumber: record.contactNumber ?? ''
      }
    case 'accommodation':
      return {
        ...empty,
        name: record.name,
        category: record.type,
        location: record.location,
        description: record.description,
        priceTier: record.priceTier ?? '',
        priceInfo: record.roomRate ?? '',
        tips: record.tips ?? '',
        contactNumber: record.contactNumber ?? ''
      }
    case 'transportation':
      return {
        ...empty,
        name: `${record.origin} to ${record.destination}`,
        category: record.transportType,
        description: record.description,
        priceInfo: record.fare ?? '',
        hours: record.schedule ?? '',
        tips: record.tips ?? '',
        contactNumber: record.contactNumber ?? '',
        origin: record.origin,
        destination: record.destination,
        transportType: record.transportType
      }
    case 'emergencyContact':
      return {
        ...empty,
        name: record.officeName,
        category: 'Emergency',
        description: record.description,
        contactNumber: record.contactNumber
      }
    case 'faq':
      return {
        ...empty,
        name: record.question,
        category: record.category,
        description: record.answer,
        question: record.question,
        keywords: record.keywords?.join(', ') ?? ''
      }
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

async function loadAllRecords(firestore: ReturnType<typeof getAdminFirestore>): Promise<TourismRecord[]> {
  const all: TourismRecord[] = []
  for (const name of COLLECTIONS) {
    const snapshot = await firestore.collection(name).get()
    for (const doc of snapshot.docs) {
      all.push({ id: doc.id, ...doc.data() } as TourismRecord)
    }
  }
  return all
}

async function main() {
  const firestore = getAdminFirestore()
  const records = await loadAllRecords(firestore)

  if (records.length === 0) {
    console.log('No tourism documents found. Run `pnpm seed` first.')
    return
  }

  let upserted = 0
  for (const batch of chunk(records, BATCH_SIZE)) {
    const texts = batch.map(buildTextBlob)
    const embeddings = await embedTexts(texts)

    const vectorizeRecords: VectorizeRecord[] = batch.map((record, index) => ({
      id: record.id,
      values: embeddings[index],
      metadata: toMetadata(record)
    }))

    await upsertVectors(VECTORIZE_INDEX, vectorizeRecords)
    upserted += vectorizeRecords.length
  }

  console.log(`Upserted ${upserted} vectors into "${VECTORIZE_INDEX}".`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
