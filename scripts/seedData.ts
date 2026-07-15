import type {
  Accommodation,
  EmergencyContact,
  Faq,
  Restaurant,
  Transportation,
  TouristSpot
} from '../types/tourism'

type SeedItem<T> = Omit<T, 'updatedAt'>

export const TOURIST_SPOTS: SeedItem<TouristSpot>[] = [
  {
    id: 'hoyohoy-highland-adventure-park',
    topic: 'touristSpot',
    name: 'Hoyohoy Highland Adventure Park',
    category: 'Adventure & Nature Park',
    location: 'Babak District',
    description:
      'A hilltop adventure park in Samal offering a zipline, hanging bridges, and viewing decks overlooking the Davao Gulf and mainland Davao City.',
    priceTier: 'mid',
    tips: 'Go in the late afternoon for cooler weather and good views over the gulf.'
  },
  {
    id: 'monfort-bat-cave',
    topic: 'touristSpot',
    name: 'Monfort Bat Cave',
    category: 'Wildlife Sanctuary',
    location: 'Babak District',
    description:
      "Home to the world's largest known colony of Geoffroy's Rousette fruit bats, recognized by Guinness World Records. Visitors view the bats clustered on the cave ceiling from a boardwalk.",
    priceTier: 'free',
    tips: 'Keep noise low and avoid flash photography so the bats are not disturbed.'
  },
  {
    id: 'vanishing-island-aundanao-sandbar',
    topic: 'touristSpot',
    name: 'Vanishing Island (Aundanao Sandbar)',
    category: 'Sandbar / Island Hopping Stop',
    location: 'Babak District',
    description:
      'A sandbar off Aundanao that appears and disappears with the tide, a popular stop on Samal island-hopping tours for swimming and photos.',
    priceTier: 'budget',
    tips: 'Best visited close to low tide, when the sandbar is fully exposed.'
  },
  {
    id: 'isla-reta',
    topic: 'touristSpot',
    name: 'Isla Reta',
    category: 'Private Island Day Trip',
    location: 'Talicud Island, Kaputian District',
    description:
      'A small private island near Talicud offering white-sand beach frontage and calm, shallow water, often visited as part of an island-hopping itinerary.',
    priceTier: 'mid'
  },
  {
    id: 'kaputian-white-beach',
    topic: 'touristSpot',
    name: 'Kaputian White Beach',
    category: 'Public Beach',
    location: 'Kaputian District',
    description:
      'A public white-sand beach on the Kaputian side of Samal Island, known for calm, shallow water suitable for swimming.',
    priceTier: 'free'
  },
  {
    id: 'samal-island-hopping-tour',
    topic: 'touristSpot',
    name: 'Samal Island Hopping Tour',
    category: 'Guided Tour',
    location: 'Kaputian District',
    description:
      'A boat tour combining several Samal and Talicud stops in one trip, typically including a sandbar, a snorkeling spot, and a beach stop.',
    priceTier: 'budget',
    tips: 'Book through a local tour operator or resort front desk; exact stops vary by operator.'
  }
]

export const RESTAURANTS: SeedItem<Restaurant>[] = []

export const ACCOMMODATIONS: SeedItem<Accommodation>[] = [
  {
    id: 'coral-garden-beach-and-nature-resort',
    topic: 'accommodation',
    name: 'Coral Garden Beach and Nature Resort',
    type: 'Beach Resort & Marine Sanctuary',
    location: 'Talicud Island, Kaputian District',
    description:
      'A beach resort on Talicud Island built around a protected marine sanctuary, popular for snorkeling over coral reefs close to shore.',
    priceTier: 'mid',
    tips: 'Bring your own snorkeling gear or rent on-site; the reef is closest to shore at high tide.'
  },
  {
    id: 'pearl-farm-beach-resort',
    topic: 'accommodation',
    name: 'Pearl Farm Beach Resort',
    type: 'Heritage Beach Resort',
    location: 'Kaputian District',
    description:
      'A well-known resort built on the site of a former pearl farm, featuring cottages inspired by traditional Samal and Mandaya architecture.',
    priceTier: 'premium'
  },
  {
    id: 'paradise-island-park-and-beach-resort',
    topic: 'accommodation',
    name: 'Paradise Island Park and Beach Resort',
    type: 'Beach Resort',
    location: 'Babak District',
    description:
      'A beach resort on Samal Island with pools, cottages, and direct beach access, popular for day trips and family outings.',
    priceTier: 'mid'
  },
  {
    id: 'costa-marina-beach-resort',
    topic: 'accommodation',
    name: 'Costa Marina Beach Resort',
    type: 'Beach Resort',
    location: 'Babak District',
    description:
      'A beach resort on Samal Island with a pool overlooking the Davao Gulf, a short boat ride from Davao City.',
    priceTier: 'mid'
  }
]

export const TRANSPORTATION: SeedItem<Transportation>[] = [
  {
    id: 'davao-to-samal-babak-ferry',
    topic: 'transportation',
    origin: 'Davao City',
    destination: 'Samal Island (Babak District)',
    transportType: 'RORO ferry/barge',
    description:
      'A roll-on/roll-off (RORO) ferry crossing connects Davao City to the Babak side of Samal Island, carrying both vehicles and foot passengers.',
    tips: 'Confirm the current departure wharf and schedule locally, as ferry operations can change.'
  },
  {
    id: 'davao-to-samal-kaputian-ferry',
    topic: 'transportation',
    origin: 'Davao City',
    destination: 'Samal Island (Kaputian District)',
    transportType: 'RORO ferry/barge',
    description:
      'A separate ferry crossing serves the Kaputian side of Samal Island, commonly used by travelers heading to resorts and beaches in that area.',
    tips: 'Confirm the current departure wharf and schedule locally, as ferry operations can change.'
  }
]

export const EMERGENCY_CONTACTS: SeedItem<EmergencyContact>[] = [
  {
    id: 'national-emergency-hotline',
    topic: 'emergencyContact',
    officeName: 'National Emergency Hotline',
    contactNumber: '911',
    description: "The Philippines' nationwide emergency hotline for police, fire, and medical emergencies."
  },
  {
    id: 'pnp-hotline',
    topic: 'emergencyContact',
    officeName: 'Philippine National Police (PNP) Hotline',
    contactNumber: '117',
    description: 'A nationwide police hotline for reporting crimes and emergencies, in addition to 911.'
  }
]

export const FAQS: SeedItem<Faq>[] = [
  {
    id: 'faq-getting-to-samal',
    topic: 'faq',
    category: 'Getting There',
    question: 'How do I get to Samal Island from Davao City?',
    answer:
      'Samal Island is reached from Davao City by a short ferry/barge crossing that carries both vehicles and foot passengers. Ask your resort or a local tour operator for the current departure point and schedule.',
    keywords: ['ferry', 'transportation', 'how to get there', 'Davao']
  },
  {
    id: 'faq-passport-required',
    topic: 'faq',
    category: 'Travel Basics',
    question: 'Do I need a passport or visa to visit Samal Island?',
    answer:
      "No. Samal Island (Island Garden City of Samal) is part of the Philippines, in Davao del Norte province, so domestic travel documents are all that's needed for Filipino citizens; foreign visitors just need whatever is required for entry into the Philippines generally.",
    keywords: ['passport', 'visa', 'documents']
  },
  {
    id: 'faq-best-time-to-visit',
    topic: 'faq',
    category: 'Planning',
    question: 'What is the best time of year to visit Samal Island?',
    answer:
      'Like most of the Philippines, Samal has a dry season (roughly November to May) that tends to have less rain and is generally considered the more popular time to visit, though it can be visited year-round.',
    keywords: ['weather', 'best time', 'season']
  },
  {
    id: 'faq-currency',
    topic: 'faq',
    category: 'Travel Basics',
    question: 'What currency is used in Samal Island?',
    answer: 'The Philippine Peso (₱) is used throughout Samal Island, as it is nationwide.',
    keywords: ['currency', 'money', 'peso']
  }
]

export const SEED_COLLECTIONS: Array<{ collection: string; items: Array<{ id: string }> }> = [
  { collection: 'touristSpots', items: TOURIST_SPOTS },
  { collection: 'restaurants', items: RESTAURANTS },
  { collection: 'accommodations', items: ACCOMMODATIONS },
  { collection: 'transportation', items: TRANSPORTATION },
  { collection: 'emergencyContacts', items: EMERGENCY_CONTACTS },
  { collection: 'faqs', items: FAQS }
]
