import type { TourismContentItem } from '../types/tourism'

export type SeedItem = Omit<TourismContentItem, 'updatedAt'>

export const SEED_ITEMS: SeedItem[] = [
  {
    id: 'hoyohoy-highland-adventure-park',
    type: 'activity',
    name: 'Hoyohoy Highland Adventure Park',
    category: 'Adventure & Nature Park',
    barangay: 'Babak District',
    description:
      'A hilltop adventure park in Samal offering a zipline, hanging bridges, and viewing decks overlooking the Davao Gulf and mainland Davao City.',
    priceTier: 'mid',
    tips: 'Go in the late afternoon for cooler weather and good views over the gulf.'
  },
  {
    id: 'monfort-bat-cave',
    type: 'attraction',
    name: 'Monfort Bat Cave',
    category: 'Wildlife Sanctuary',
    barangay: 'Babak District',
    description:
      "Home to the world's largest known colony of Geoffroy's Rousette fruit bats, recognized by Guinness World Records. Visitors view the bats clustered on the cave ceiling from a boardwalk.",
    priceTier: 'free',
    tips: 'Keep noise low and avoid flash photography so the bats are not disturbed.'
  },
  {
    id: 'vanishing-island-aundanao-sandbar',
    type: 'attraction',
    name: 'Vanishing Island (Aundanao Sandbar)',
    category: 'Sandbar / Island Hopping Stop',
    barangay: 'Babak District',
    description:
      'A sandbar off Aundanao that appears and disappears with the tide, a popular stop on Samal island-hopping tours for swimming and photos.',
    priceTier: 'budget',
    tips: 'Best visited close to low tide, when the sandbar is fully exposed.'
  },
  {
    id: 'isla-reta',
    type: 'attraction',
    name: 'Isla Reta',
    category: 'Private Island Day Trip',
    barangay: 'Talicud Island, Kaputian District',
    description:
      'A small private island near Talicud offering white-sand beach frontage and calm, shallow water, often visited as part of an island-hopping itinerary.',
    priceTier: 'mid'
  },
  {
    id: 'kaputian-white-beach',
    type: 'attraction',
    name: 'Kaputian White Beach',
    category: 'Public Beach',
    barangay: 'Kaputian District',
    description:
      'A public white-sand beach on the Kaputian side of Samal Island, known for calm, shallow water suitable for swimming.',
    priceTier: 'free'
  },
  {
    id: 'coral-garden-beach-and-nature-resort',
    type: 'resort',
    name: 'Coral Garden Beach and Nature Resort',
    category: 'Beach Resort & Marine Sanctuary',
    barangay: 'Talicud Island, Kaputian District',
    description:
      'A beach resort on Talicud Island built around a protected marine sanctuary, popular for snorkeling over coral reefs close to shore.',
    priceTier: 'mid',
    tips: 'Bring your own snorkeling gear or rent on-site; the reef is closest to shore at high tide.'
  },
  {
    id: 'pearl-farm-beach-resort',
    type: 'resort',
    name: 'Pearl Farm Beach Resort',
    category: 'Heritage Beach Resort',
    barangay: 'Kaputian District',
    description:
      'A well-known resort built on the site of a former pearl farm, featuring cottages inspired by traditional Samal and Mandaya architecture.',
    priceTier: 'premium'
  },
  {
    id: 'paradise-island-park-and-beach-resort',
    type: 'resort',
    name: 'Paradise Island Park and Beach Resort',
    category: 'Beach Resort',
    barangay: 'Babak District',
    description:
      'A beach resort on Samal Island with pools, cottages, and direct beach access, popular for day trips and family outings.',
    priceTier: 'mid'
  },
  {
    id: 'costa-marina-beach-resort',
    type: 'resort',
    name: 'Costa Marina Beach Resort',
    category: 'Beach Resort',
    barangay: 'Babak District',
    description:
      'A beach resort on Samal Island with a pool overlooking the Davao Gulf, a short boat ride from Davao City.',
    priceTier: 'mid'
  },
  {
    id: 'samal-island-hopping-tour',
    type: 'activity',
    name: 'Samal Island Hopping Tour',
    category: 'Guided Tour',
    barangay: 'Kaputian District',
    description:
      'A boat tour combining several Samal and Talicud stops in one trip, typically including a sandbar, a snorkeling spot, and a beach stop.',
    priceTier: 'budget',
    tips: 'Book through a local tour operator or resort front desk; exact stops vary by operator.'
  }
]
