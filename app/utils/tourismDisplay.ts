import type { TourismRecord, TourismTopic } from '~~/types/tourism'

export const TOPIC_ORDER: TourismTopic[] = [
  'touristSpot',
  'restaurant',
  'accommodation',
  'transportation',
  'emergencyContact',
  'faq',
  'souvenirShop',
  'ferryTerminal',
  'beachResort'
]

export const TOPIC_LABELS: Record<TourismTopic, string> = {
  touristSpot: 'Tourist Spots',
  restaurant: 'Restaurants',
  accommodation: 'Accommodations',
  transportation: 'Transportation',
  emergencyContact: 'Emergency Contacts',
  faq: 'FAQ',
  souvenirShop: 'Souvenir Shops',
  ferryTerminal: 'Ferry Terminals',
  beachResort: 'Beach Resorts'
}

export function getItemLabel(item: TourismRecord): string {
  switch (item.topic) {
    case 'touristSpot':
    case 'restaurant':
    case 'accommodation':
    case 'souvenirShop':
    case 'ferryTerminal':
    case 'beachResort':
      return item.name
    case 'transportation':
      return `${item.origin} → ${item.destination}`
    case 'emergencyContact':
      return item.officeName
    case 'faq':
      return item.question
  }
}

export function getAskQuery(item: TourismRecord): string {
  if (item.topic === 'faq') return item.question
  return `Tell me about ${getItemLabel(item)}`
}
