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
      if (item.email) lines.push(`Email: ${item.email}`)
      if (item.facebookPage) lines.push(`Facebook: ${item.facebookPage}`)
      if (item.status) lines.push(`Status: ${item.status}`)
      return lines
    }
    case 'accommodation': {
      const lines = [item.type, item.location, item.description]
      if (item.roomRate) lines.push(`Room rate: ${item.roomRate}`)
      if (item.priceTier) lines.push(`Price tier: ${item.priceTier}`)
      if (item.checkInTime) lines.push(`Check-in: ${item.checkInTime}`)
      if (item.checkOutTime) lines.push(`Check-out: ${item.checkOutTime}`)
      if (item.tips) lines.push(`Tips: ${item.tips}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      if (item.email) lines.push(`Email: ${item.email}`)
      if (item.website) lines.push(`Website: ${item.website}`)
      if (item.amenities) lines.push(`Amenities: ${item.amenities}`)
      if (item.status) lines.push(`Status: ${item.status}`)
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
    case 'emergencyContact': {
      const lines = [item.description, `Contact: ${item.contactNumber}`]
      if (item.telephone) lines.push(`Telephone: ${item.telephone}`)
      if (item.address) lines.push(item.address)
      if (item.operatingHours) lines.push(`Hours: ${item.operatingHours}`)
      return lines
    }
    case 'faq':
      return [item.answer]
    case 'souvenirShop': {
      const lines = [item.category, item.location, item.description]
      if (item.operatingHours) lines.push(`Hours: ${item.operatingHours}`)
      if (item.productsSold) lines.push(`Products sold: ${item.productsSold}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      if (item.email) lines.push(`Email: ${item.email}`)
      if (item.facebookPage) lines.push(`Facebook: ${item.facebookPage}`)
      if (item.status) lines.push(`Status: ${item.status}`)
      return lines
    }
    case 'ferryTerminal': {
      const lines = [item.category, item.location, item.description]
      if (item.route) lines.push(`Route: ${item.route}`)
      if (item.operatingHours) lines.push(`Hours: ${item.operatingHours}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      if (item.status) lines.push(`Status: ${item.status}`)
      return lines
    }
    case 'beachResort': {
      const lines = [item.category, item.location, item.description]
      if (item.dayTourFee) {
        const { under3, age4to10, adult } = item.dayTourFee
        const bracket = [
          under3 && `3 yrs & below: ${under3}`,
          age4to10 && `4-10 yrs: ${age4to10}`,
          adult && `Adult: ${adult}`
        ]
          .filter(Boolean)
          .join(', ')
        if (bracket) lines.push(`Day Tour entrance fee — ${bracket}`)
      }
      if (item.overnightFee) {
        const { under3, age4to10, adult } = item.overnightFee
        const bracket = [
          adult && `Adult: ${adult}`,
          age4to10 && `4-10 yrs: ${age4to10}`,
          under3 && `3 yrs & below: ${under3}`
        ]
          .filter(Boolean)
          .join(', ')
        if (bracket) lines.push(`Overnight entrance fee — ${bracket}`)
      }
      if (item.inclusive) lines.push(`Inclusive: ${item.inclusive}`)
      if (item.cottageRate) {
        const { picnicHut, campingTent } = item.cottageRate
        const rate = [picnicHut && `Picnic hut: ${picnicHut}`, campingTent && `Camping tent: ${campingTent}`]
          .filter(Boolean)
          .join(', ')
        if (rate) lines.push(`Cottage rate — ${rate}`)
      }
      if (item.roomRate) {
        const { hotelTypeRoom, concreteWithAircon, nativeRoom } = item.roomRate
        const rate = [
          hotelTypeRoom && `Hotel type room: ${hotelTypeRoom}`,
          concreteWithAircon && `Concrete room with aircon: ${concreteWithAircon}`,
          nativeRoom && `Native room: ${nativeRoom}`
        ]
          .filter(Boolean)
          .join(', ')
        if (rate) lines.push(`Room rate — ${rate}`)
      }
      if (item.checkInTime) lines.push(`Check-in: ${item.checkInTime}`)
      if (item.checkOutTime) lines.push(`Check-out: ${item.checkOutTime}`)
      if (item.amenities) lines.push(`Amenities: ${item.amenities}`)
      if (item.rentals) lines.push(`Rentals: ${item.rentals}`)
      if (item.boatFare) lines.push(`Boat fare: ${item.boatFare}`)
      if (item.baoBaoFare) lines.push(`Bao-bao fare: ${item.baoBaoFare}`)
      if (item.modeOfTransportation) lines.push(`Mode of transportation: ${item.modeOfTransportation}`)
      if (item.directions) lines.push(`Directions: ${item.directions}`)
      if (item.otherServices) lines.push(`Other services: ${item.otherServices}`)
      if (item.otherCharges) lines.push(`Other charges: ${item.otherCharges}`)
      if (item.contactNumber) lines.push(`Contact: ${item.contactNumber}`)
      if (item.email) lines.push(`Email: ${item.email}`)
      if (item.website) lines.push(`Website: ${item.website}`)
      if (item.status) lines.push(`Status: ${item.status}`)
      return lines
    }
  }
}
