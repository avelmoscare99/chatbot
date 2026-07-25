export type PriceTier = 'free' | 'budget' | 'mid' | 'premium'

export type TourismTopic =
  | 'touristSpot'
  | 'restaurant'
  | 'accommodation'
  | 'transportation'
  | 'emergencyContact'
  | 'faq'
  | 'souvenirShop'
  | 'ferryTerminal'
  | 'beachResort'

export interface TouristSpot {
  id: string
  topic: 'touristSpot'
  name: string
  category: string
  description: string
  location: string
  entranceFee?: string
  priceTier?: PriceTier
  operatingHours?: string
  contactNumber?: string
  tips?: string
  imageKey?: string
  lat?: number
  lng?: number
  updatedAt?: unknown
}

export interface Restaurant {
  id: string
  topic: 'restaurant'
  name: string
  cuisine: string
  description: string
  location: string
  contactNumber?: string
  operatingHours?: string
  priceTier?: PriceTier
  tips?: string
  imageKey?: string
  lat?: number
  lng?: number
  email?: string
  facebookPage?: string
  status?: string
  priceRange?: string
  updatedAt?: unknown
}

export interface Accommodation {
  id: string
  topic: 'accommodation'
  name: string
  type: string
  description: string
  location: string
  contactNumber?: string
  roomRate?: string
  priceTier?: PriceTier
  tips?: string
  imageKey?: string
  lat?: number
  lng?: number
  email?: string
  website?: string
  amenities?: string
  status?: string
  checkInTime?: string
  checkOutTime?: string
  updatedAt?: unknown
}

export interface Transportation {
  id: string
  topic: 'transportation'
  origin: string
  destination: string
  transportType: string
  description: string
  fare?: string
  schedule?: string
  contactNumber?: string
  tips?: string
  operatorName?: string
  travelTime?: string
  updatedAt?: unknown
}

export interface EmergencyContact {
  id: string
  topic: 'emergencyContact'
  officeName: string
  contactNumber: string
  description: string
  telephone?: string
  email?: string
  address?: string
  operatingHours?: string
  updatedAt?: unknown
}

export interface Faq {
  id: string
  topic: 'faq'
  category: string
  question: string
  answer: string
  keywords?: string[]
  status?: string
  updatedAt?: unknown
}

export interface SouvenirShop {
  id: string
  topic: 'souvenirShop'
  name: string
  category: string
  description: string
  location: string
  contactNumber?: string
  email?: string
  facebookPage?: string
  operatingHours?: string
  productsSold?: string
  status?: string
  updatedAt?: unknown
}

export interface FerryTerminal {
  id: string
  topic: 'ferryTerminal'
  name: string
  category: string
  location: string
  route?: string
  operatingHours?: string
  description: string
  contactNumber?: string
  status?: string
  updatedAt?: unknown
}

export interface BeachResort {
  id: string
  topic: 'beachResort'
  name: string
  category: string
  description: string
  location: string
  contactNumber?: string
  email?: string
  website?: string
  dayTourFee?: {
    under3?: string
    age4to10?: string
    adult?: string
  }
  overnightFee?: {
    adult?: string
    age4to10?: string
    under3?: string
  }
  inclusive?: string
  cottageRate?: {
    picnicHut?: string
    campingTent?: string
  }
  roomRate?: {
    hotelTypeRoom?: string
    concreteWithAircon?: string
    nativeRoom?: string
  }
  checkInTime?: string
  checkOutTime?: string
  amenities?: string
  rentals?: string
  boatFare?: string
  baoBaoFare?: string
  modeOfTransportation?: string
  directions?: string
  lat?: number
  lng?: number
  status?: string
  otherServices?: string
  otherCharges?: string
  updatedAt?: unknown
}

export type TourismRecord =
  | TouristSpot
  | Restaurant
  | Accommodation
  | Transportation
  | EmergencyContact
  | Faq
  | SouvenirShop
  | FerryTerminal
  | BeachResort

export interface UserProfile {
  displayName: string | null
  email: string | null
  photoURL: string | null
  createdAt: unknown
  lastLoginAt: unknown
}

export interface ChatSession {
  id: string
  title: string
  createdAt: unknown
  updatedAt: unknown
  lastMessagePreview: string
}

export type ChatMessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  createdAt: unknown
  sources?: string[]
}

export interface FavoriteItem {
  id: string
  topic: TourismTopic
  refId: string
  savedAt: unknown
}
