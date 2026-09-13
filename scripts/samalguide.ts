const SITE_BASE = 'https://samalguide.com'
const USER_AGENT = 'SamalTourismChatbot/1.0 (Academic thesis project; non-commercial data collection)'
const PER_PAGE = 100

export type ScrapableTopic = 'touristSpot' | 'restaurant' | 'accommodation' | 'transportation'

export interface WpPost {
  id: number
  slug: string
  link: string
  modified: string
  title: { rendered: string }
  content: { rendered: string }
  categories: number[]
  tags: number[]
}

export interface WpTerm {
  id: number
  slug: string
  name: string
}

// samalguide.com category slug -> our topic. Categories not listed here (e.g. "news")
// are intentionally unmapped so resolveTopic() skips those posts.
const CATEGORY_TOPIC_MAP: Record<string, ScrapableTopic> = {
  resort: 'accommodation',
  'beach-resort': 'accommodation',
  hotel: 'accommodation',
  'vacation-house': 'accommodation',
  'inland-resort': 'accommodation',
  restaurant: 'restaurant',
  falls: 'touristSpot',
  destination: 'touristSpot',
  'white-sand-beach': 'touristSpot',
  transpo: 'transportation'
}

// If a post's categories map to more than one topic, resolve using this priority order.
const TOPIC_PRIORITY: ScrapableTopic[] = ['accommodation', 'restaurant', 'touristSpot', 'transportation']

const LOCATION_TAG_NAMES: Record<string, string> = {
  'loc-babak': 'Babak, Island Garden City of Samal',
  'loc-samal': 'Samal, Island Garden City of Samal',
  'loc-kaputian': 'Kaputian, Island Garden City of Samal',
  'loc-talicud-island': 'Talicud Island, Island Garden City of Samal'
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchAllTerms(taxonomy: 'categories' | 'tags'): Promise<WpTerm[]> {
  const all: WpTerm[] = []
  let page = 1

  while (true) {
    const url = `${SITE_BASE}/wp-json/wp/v2/${taxonomy}?per_page=${PER_PAGE}&page=${page}&_fields=id,slug,name`
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (response.status === 400) break // WP: page number exceeds available pages
    if (!response.ok) {
      throw new Error(`Failed to fetch ${taxonomy} page ${page}: ${response.status}`)
    }
    const batch = (await response.json()) as WpTerm[]
    if (!Array.isArray(batch) || batch.length === 0) break

    all.push(...batch)
    if (batch.length < PER_PAGE) break
    page += 1
    await sleep(150)
  }

  return all
}

export async function fetchCategoryMap(): Promise<Map<number, string>> {
  const terms = await fetchAllTerms('categories')
  return new Map(terms.map((t) => [t.id, t.slug]))
}

export async function fetchTagMap(): Promise<Map<number, WpTerm>> {
  const terms = await fetchAllTerms('tags')
  return new Map(terms.map((t) => [t.id, t]))
}

export async function fetchAllPosts(): Promise<WpPost[]> {
  const all: WpPost[] = []
  let page = 1

  while (true) {
    const url = `${SITE_BASE}/wp-json/wp/v2/posts?per_page=${PER_PAGE}&page=${page}&_fields=id,slug,link,modified,title,content,categories,tags`
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (response.status === 400) break
    if (!response.ok) {
      throw new Error(`Failed to fetch posts page ${page}: ${response.status}`)
    }
    const batch = (await response.json()) as WpPost[]
    if (!Array.isArray(batch) || batch.length === 0) break

    all.push(...batch)
    if (batch.length < PER_PAGE) break
    page += 1
    await sleep(150)
  }

  return all
}

export function resolveTopic(post: WpPost, categoryIdToSlug: Map<number, string>): ScrapableTopic | null {
  const matched = new Set<ScrapableTopic>()
  for (const categoryId of post.categories) {
    const slug = categoryIdToSlug.get(categoryId)
    const topic = slug ? CATEGORY_TOPIC_MAP[slug] : undefined
    if (topic) matched.add(topic)
  }

  for (const topic of TOPIC_PRIORITY) {
    if (matched.has(topic)) return topic
  }
  return null
}

export function locationFromTags(post: WpPost, tagMap: Map<number, WpTerm>): string | undefined {
  for (const tagId of post.tags) {
    const term = tagMap.get(tagId)
    if (term && LOCATION_TAG_NAMES[term.slug]) {
      return LOCATION_TAG_NAMES[term.slug]
    }
  }
  return undefined
}

export function amenityTagsAsTips(post: WpPost, tagMap: Map<number, WpTerm>): string | undefined {
  const names = post.tags
    .map((tagId) => tagMap.get(tagId))
    .filter((term): term is WpTerm => !!term && !LOCATION_TAG_NAMES[term.slug])
    .map((term) => term.name)

  return names.length > 0 ? names.join(', ') : undefined
}
