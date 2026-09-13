import 'dotenv/config'
import { embedTexts, upsertVectors, type VectorizeRecord } from './cloudflare'
import { getAdminFirestore } from './firebaseAdmin'
import type { BeachResort, TourismRecord } from '../types/tourism'

const VECTORIZE_INDEX = 'samal-tourism'
const BATCH_SIZE = 50

const COLLECTIONS = [
  'touristSpots',
  'restaurants',
  'accommodations',
  'transportation',
  'emergencyContacts',
  'faqs',
  'souvenirShops',
  'ferryTerminals',
  'beachResorts'
]

function formatBeachResortPricing(record: BeachResort): string {
  const parts: string[] = []
  if (record.inclusive) parts.push(`Inclusive: ${record.inclusive}`)
  const dayTour = record.dayTourFee
  if (dayTour && (dayTour.under3 || dayTour.age4to10 || dayTour.adult)) {
    const bracket = [
      dayTour.under3 && `3 years old and below: ${dayTour.under3}`,
      dayTour.age4to10 && `4 to 10 years old: ${dayTour.age4to10}`,
      dayTour.adult && `Adult: ${dayTour.adult}`
    ]
      .filter(Boolean)
      .join(', ')
    parts.push(`Day Tour entrance fee — ${bracket}`)
  }
  const overnight = record.overnightFee
  if (overnight && (overnight.under3 || overnight.age4to10 || overnight.adult)) {
    const bracket = [
      overnight.adult && `Adult: ${overnight.adult}`,
      overnight.age4to10 && `4 to 10 years old: ${overnight.age4to10}`,
      overnight.under3 && `3 years old and below: ${overnight.under3}`
    ]
      .filter(Boolean)
      .join(', ')
    parts.push(`Overnight entrance fee — ${bracket}`)
  }
  const cottage = record.cottageRate
  if (cottage && (cottage.picnicHut || cottage.campingTent)) {
    parts.push(
      [cottage.picnicHut && `Picnic hut: ${cottage.picnicHut}`, cottage.campingTent && `Camping tent: ${cottage.campingTent}`]
        .filter(Boolean)
        .join(', ')
    )
  }
  const room = record.roomRate
  if (room && (room.hotelTypeRoom || room.concreteWithAircon || room.nativeRoom)) {
    parts.push(
      [
        room.hotelTypeRoom && `Hotel type room: ${room.hotelTypeRoom}`,
        room.concreteWithAircon && `Concrete room with aircon: ${room.concreteWithAircon}`,
        room.nativeRoom && `Native room: ${room.nativeRoom}`
      ]
        .filter(Boolean)
        .join(', ')
    )
  }
  return parts.join('. ')
}

function formatBeachResortLogistics(record: BeachResort): string {
  const parts: string[] = []
  if (record.checkInTime) parts.push(`Check-in: ${record.checkInTime}`)
  if (record.checkOutTime) parts.push(`Check-out: ${record.checkOutTime}`)
  if (record.rentals) parts.push(`Rentals: ${record.rentals}`)
  if (record.boatFare) parts.push(`Boat fare: ${record.boatFare}`)
  if (record.baoBaoFare) parts.push(`Bao-bao fare: ${record.baoBaoFare}`)
  if (record.modeOfTransportation) parts.push(`Mode of transportation: ${record.modeOfTransportation}`)
  if (record.directions) parts.push(`Directions: ${record.directions}`)
  if (record.otherServices) parts.push(`Other services: ${record.otherServices}`)
  if (record.otherCharges) parts.push(`Other charges: ${record.otherCharges}`)
  return parts.join('. ')
}

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
      if (record.checkInTime) parts.push(`Check-in: ${record.checkInTime}.`)
      if (record.checkOutTime) parts.push(`Check-out: ${record.checkOutTime}.`)
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
    case 'emergencyContact': {
      const parts = [`${record.officeName}.`, record.description, `Contact number: ${record.contactNumber}.`]
      if (record.telephone) parts.push(`Telephone: ${record.telephone}.`)
      if (record.address) parts.push(`Address: ${record.address}.`)
      if (record.operatingHours) parts.push(`Hours: ${record.operatingHours}.`)
      return parts.join(' ')
    }
    case 'faq': {
      const parts = [record.question, `Topic: ${record.category}.`]
      if (record.keywords?.length) parts.push(`Keywords: ${record.keywords.join(', ')}.`)
      return parts.join(' ')
    }
    case 'souvenirShop': {
      const parts = [`${record.name} — a ${record.category} in ${record.location}.`, record.description]
      if (record.productsSold) parts.push(`Products sold: ${record.productsSold}.`)
      if (record.operatingHours) parts.push(`Hours: ${record.operatingHours}.`)
      if (record.contactNumber) parts.push(`Contact: ${record.contactNumber}.`)
      return parts.join(' ')
    }
    case 'ferryTerminal': {
      const parts = [`${record.name} — a ${record.category} in ${record.location}.`, record.description]
      if (record.route) parts.push(`Route: ${record.route}.`)
      if (record.operatingHours) parts.push(`Hours: ${record.operatingHours}.`)
      if (record.contactNumber) parts.push(`Contact: ${record.contactNumber}.`)
      return parts.join(' ')
    }
    case 'beachResort': {
      const parts = [`${record.name} — a ${record.category} in ${record.location}.`, record.description]
      const pricing = formatBeachResortPricing(record)
      if (pricing) parts.push(pricing + '.')
      if (record.amenities) parts.push(`Amenities: ${record.amenities}.`)
      if (record.contactNumber) parts.push(`Contact: ${record.contactNumber}.`)
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
    keywords: '',
    route: '',
    productsSold: '',
    email: '',
    website: '',
    amenities: '',
    pricingSummary: '',
    logisticsSummary: '',
    checkInTime: '',
    checkOutTime: '',
    sourceUrl: ''
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
        contactNumber: record.contactNumber ?? '',
        sourceUrl: record.sourceUrl ?? ''
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
        contactNumber: record.contactNumber ?? '',
        sourceUrl: record.sourceUrl ?? ''
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
        contactNumber: record.contactNumber ?? '',
        checkInTime: record.checkInTime ?? '',
        checkOutTime: record.checkOutTime ?? '',
        sourceUrl: record.sourceUrl ?? ''
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
        transportType: record.transportType,
        sourceUrl: record.sourceUrl ?? ''
      }
    case 'emergencyContact':
      return {
        ...empty,
        name: record.officeName,
        category: 'Emergency',
        location: record.address ?? '',
        description: record.description,
        contactNumber: record.contactNumber,
        hours: record.operatingHours ?? ''
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
    case 'souvenirShop':
      return {
        ...empty,
        name: record.name,
        category: record.category,
        location: record.location,
        description: record.description,
        hours: record.operatingHours ?? '',
        contactNumber: record.contactNumber ?? '',
        email: record.email ?? '',
        productsSold: record.productsSold ?? ''
      }
    case 'ferryTerminal':
      return {
        ...empty,
        name: record.name,
        category: record.category,
        location: record.location,
        description: record.description,
        route: record.route ?? '',
        hours: record.operatingHours ?? '',
        contactNumber: record.contactNumber ?? ''
      }
    case 'beachResort':
      return {
        ...empty,
        name: record.name,
        category: record.category,
        location: record.location,
        description: record.description,
        contactNumber: record.contactNumber ?? '',
        email: record.email ?? '',
        website: record.website ?? '',
        amenities: record.amenities ?? '',
        pricingSummary: formatBeachResortPricing(record),
        logisticsSummary: formatBeachResortLogistics(record)
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
      id: `${record.topic}-${record.id}`.slice(0, 64).replace(/-+$/, ''),
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
