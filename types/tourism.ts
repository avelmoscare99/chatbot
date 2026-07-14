// Shared Firestore document shapes. Imported by the Nuxt app (via the `~~` root
// alias) and by worker/scripts (via relative import) so both sides agree on one
// source of truth for the data model described in firestore.rules.

export type TourismContentType = 'attraction' | 'resort' | 'restaurant' | 'activity'

export interface TourismContentItem {
  id: string
  type: TourismContentType
  name: string
  category: string
  barangay: string
  description: string
  priceRange?: string
  priceTier?: 'free' | 'budget' | 'mid' | 'premium'
  hours?: string
  tips?: string
  imageKey?: string
  lat?: number
  lng?: number
  updatedAt?: unknown
}

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
  type: TourismContentType
  refId: string
  savedAt: unknown
}
