import { collection, getDocs } from 'firebase/firestore'
import type { TourismRecord, TourismTopic } from '~~/types/tourism'

const COLLECTION_BY_TOPIC: Record<TourismTopic, string> = {
  touristSpot: 'touristSpots',
  restaurant: 'restaurants',
  accommodation: 'accommodations',
  transportation: 'transportation',
  emergencyContact: 'emergencyContacts',
  faq: 'faqs'
}

export function useTopicBrowser() {
  const firestore = useFirestore()

  async function fetchTopicItems(topic: TourismTopic): Promise<TourismRecord[]> {
    const snapshot = await getDocs(collection(firestore, COLLECTION_BY_TOPIC[topic]))
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as TourismRecord)
  }

  return { fetchTopicItems }
}
