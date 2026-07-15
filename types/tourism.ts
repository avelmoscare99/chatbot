export type PriceTier = 'free' | 'budget' | 'mid' | 'premium'

export type TourismTopic =
  | 'touristSpot'
  | 'restaurant'
  | 'accommodation'
  | 'transportation'
  | 'emergencyContact'
  | 'faq'

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
  updatedAt?: unknown
}

export interface EmergencyContact {
  id: string
  topic: 'emergencyContact'
  officeName: string
  contactNumber: string
  description: string
  updatedAt?: unknown
}

export interface Faq {
  id: string
  topic: 'faq'
  category: string
  question: string
  answer: string
  keywords?: string[]
  updatedAt?: unknown
}

export type TourismRecord =
  | TouristSpot
  | Restaurant
  | Accommodation
  | Transportation
  | EmergencyContact
  | Faq

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
