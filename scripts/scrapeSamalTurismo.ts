import 'dotenv/config'
import crypto from 'node:crypto'
import {
  fetchAllOperators,
  operatorLocation,
  operatorName,
  operatorWebsite,
  splitContacts,
  OPERATOR_PAGE_SLUG,
  OPERATOR_TYPES,
  type Operator,
  type OperatorType
} from './samalturismo'
import { getAdminFirestore } from './firebaseAdmin'

const BATCH_LIMIT = 400
const READ_CONCURRENCY = 8

type MappedTopic = 'beachResort' | 'accommodation' | 'touristSpot' | 'restaurant'

const TOPIC_BY_OPERATOR: Record<OperatorType, MappedTopic> = {
  beach_resorts: 'beachResort',
  inland_resorts: 'beachResort',
  mabuhay_accommodations: 'accommodation',
  tour_operators: 'touristSpot',
  tour_guides: 'touristSpot',
  dive_shops: 'touristSpot',
  dine_and_drinks: 'restaurant',
  tourist_attractions: 'touristSpot'
}

const CATEGORY_LABEL: Record<OperatorType, string> = {
  beach_resorts: 'Beach Resort',
  inland_resorts: 'Inland Resort',
  mabuhay_accommodations: 'Mabuhay Accommodation',
  tour_operators: 'Tour Operator',
  tour_guides: 'Tour Guide',
  dive_shops: 'Dive Shop',
  dine_and_drinks: 'Dine & Drink Establishment',
  tourist_attractions: 'Tourist Attraction'
}

const COLLECTION_BY_TOPIC: Record<MappedTopic, string> = {
  beachResort: 'beachResorts',
  accommodation: 'accommodations',
  touristSpot: 'touristSpots',
  restaurant: 'restaurants'
}

interface PendingWrite {
  collection: string
  id: string
  data: Record<string, unknown>
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

async function mapWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor++]
      await fn(item)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
}

function buildAmenitiesSummary(op: Operator): string {
  const notes: string[] = []
  if (op.is_island_hopping) notes.push('Island hopping tours available')
  if (op.boat_required) notes.push('Boat trip required to reach it')
  if (op.has_dot_accreditation) notes.push('Accredited by the Department of Tourism')
  if (op.resort_capacity) notes.push(`Day tour capacity of about ${op.resort_capacity} guests`)
  if (op.resort_overnight_capacity) notes.push(`Overnight capacity of about ${op.resort_overnight_capacity} guests`)
  return notes.join(', ')
}

function contentHash(op: Operator): string {
  const relevant = {
    name: operatorName(op),
    district: op.district,
    barangay: op.barangay?.name ?? '',
    isIslandHopping: !!op.is_island_hopping,
    boatRequired: !!op.boat_required,
    resortCapacity: op.resort_capacity ?? null,
    resortOvernightCapacity: op.resort_overnight_capacity ?? null,
    hasDotAccreditation: !!op.has_dot_accreditation,
    contactNumbers: op.contact_numbers ?? [],
    socialMedia: op.social_media ?? null
  }
  return crypto.createHash('sha1').update(JSON.stringify(relevant)).digest('hex')
}

function buildRecordData(op: Operator): PendingWrite {
  const topic = TOPIC_BY_OPERATOR[op.operatorType]
  const collection = COLLECTION_BY_TOPIC[topic]
  const id = `tsc-${op.operatorType}-${op.id}`

  const name = operatorName(op)
  const location = operatorLocation(op)
  const category = CATEGORY_LABEL[op.operatorType]
  const extraNotes = buildAmenitiesSummary(op)
  const description = extraNotes
    ? `${name} is a city-registered ${category.toLowerCase()} in ${location}. ${extraNotes}.`
    : `${name} is a city-registered ${category.toLowerCase()} in ${location}.`

  const { phones, emails } = splitContacts(op)

  const shared = {
    topic,
    name,
    description,
    location,
    contactNumber: phones[0] ?? '',
    source: 'scraped' as const,
    sourceUrl: `https://turismo.samalcity.gov.ph/${OPERATOR_PAGE_SLUG[op.operatorType]}`,
    contentHash: contentHash(op),
    lastScrapedAt: new Date()
  }

  let data: Record<string, unknown>
  switch (topic) {
    case 'beachResort':
      data = { ...shared, category, email: emails[0] ?? '', website: operatorWebsite(op), amenities: extraNotes }
      break
    case 'accommodation':
      data = { ...shared, type: category, email: emails[0] ?? '', website: operatorWebsite(op), amenities: extraNotes }
      break
    case 'touristSpot':
      data = { ...shared, category, tips: extraNotes }
      break
    case 'restaurant':
      data = { ...shared, cuisine: category, tips: extraNotes }
      break
  }

  return { collection, id, data }
}

async function main() {
  const firestore = getAdminFirestore()

  console.log('Fetching registered operators from turismo.samalcity.gov.ph...')
  const operators = await fetchAllOperators()
  console.log(`Fetched ${operators.length} listing(s) across ${OPERATOR_TYPES.length} categories.`)

  const counts = { written: 0, unchanged: 0, inactive: 0 }
  const pendingWrites: PendingWrite[] = []

  await mapWithConcurrency(operators, READ_CONCURRENCY, async (op) => {
    if (op.is_active === false) {
      counts.inactive += 1
      return
    }

    const write = buildRecordData(op)
    const existing = await firestore.collection(write.collection).doc(write.id).get()
    if (existing.exists && existing.data()?.contentHash === write.data.contentHash) {
      counts.unchanged += 1
      return
    }

    pendingWrites.push(write)
  })

  for (const batchDocs of chunk(pendingWrites, BATCH_LIMIT)) {
    const batch = firestore.batch()
    for (const { collection, id, data } of batchDocs) {
      batch.set(firestore.collection(collection).doc(id), data, { merge: true })
    }
    await batch.commit()
  }

  console.log(`\nWrote/updated ${pendingWrites.length} document(s).`)
  console.log(`Skipped ${counts.unchanged} unchanged, ${counts.inactive} inactive listing(s).`)
  console.log('\nNext: run `pnpm ingest` to embed these into Vectorize.')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
