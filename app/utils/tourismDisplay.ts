import type { TourismRecord, TourismTopic } from '~~/types/tourism'

export const TOPIC_ORDER: TourismTopic[] = [
  'touristSpot',
  'restaurant',
  'accommodation',
  'transportation',
  'emergencyContact',
  'faq'
]

export const TOPIC_LABELS: Record<TourismTopic, string> = {
  touristSpot: 'Tourist Spots',
  restaurant: 'Restaurants',
  accommodation: 'Accommodations',
  transportation: 'Transportation',
  emergencyContact: 'Emergency Contacts',
  faq: 'FAQ'
}

export function getItemLabel(item: TourismRecord): string {
  switch (item.topic) {
    case 'touristSpot':
    case 'restaurant':
    case 'accommodation':
      return item.name
    case 'transportation':
      return `${item.origin} → ${item.destination}`
    case 'emergencyContact':
      return item.officeName
    case 'faq':
      return item.question
  }
}

export function getItemDetailLines(item: TourismRecord): string[] {
  switch (item.topic) {
    case 'touristSpot': {
      const lines = [item.category, item.location, item.description]
      if (item.entranceFee) lines.push(`Entrance fee: ${item.entranceFee}`)
      if (item.priceTier) lines.push(`Price tier: ${item.priceTier}`)
      if (item.operatingHours) lines.push(`Hours: ${item.operatingHours}`)
      if (item.tips) lines.push(`Tips: ${item.tips}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      return lines
    }
    case 'restaurant': {
      const lines = [item.cuisine, item.location, item.description]
      if (item.priceTier) lines.push(`Price tier: ${item.priceTier}`)
      if (item.operatingHours) lines.push(`Hours: ${item.operatingHours}`)
      if (item.tips) lines.push(`Tips: ${item.tips}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      return lines
    }
    case 'accommodation': {
      const lines = [item.type, item.location, item.description]
      if (item.roomRate) lines.push(`Room rate: ${item.roomRate}`)
      if (item.priceTier) lines.push(`Price tier: ${item.priceTier}`)
      if (item.tips) lines.push(`Tips: ${item.tips}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      return lines
    }
    case 'transportation': {
      const lines = [item.transportType, item.description]
      if (item.fare) lines.push(`Fare: ${item.fare}`)
      if (item.schedule) lines.push(`Schedule: ${item.schedule}`)
      if (item.tips) lines.push(`Tips: ${item.tips}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      return lines
    }
    case 'emergencyContact':
      return [item.description, `Contact: ${item.contactNumber}`]
    case 'faq':
      return [item.answer]
  }
}
