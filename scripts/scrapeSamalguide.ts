import 'dotenv/config'
import {
  amenityTagsAsTips,
  fetchAllPosts,
  fetchCategoryMap,
  fetchTagMap,
  locationFromTags,
  resolveTopic,
  type ScrapableTopic,
  type WpPost,
  type WpTerm
} from './samalguide'
import { stripToPlainText } from './htmlToText'
import { extractFields } from './extractTourismFields'
import { getAdminFirestore } from './firebaseAdmin'

const BATCH_LIMIT = 400
const EXTRACTION_CONCURRENCY = 4
const RETRY_ATTEMPTS = 2
const RETRY_BASE_DELAY_MS = 1000

const TOPIC_COLLECTION: Record<ScrapableTopic, string> = {
  touristSpot: 'touristSpots',
  restaurant: 'restaurants',
  accommodation: 'accommodations',
  transportation: 'transportation'
}

interface PendingWrite {
  collection: string
  id: string
  data: Record<string, unknown>
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

async function withRetry<T>(fn: () => Promise<T>, retries = RETRY_ATTEMPTS, delayMs = RETRY_BASE_DELAY_MS): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (retries <= 0) throw err
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    return withRetry(fn, retries - 1, delayMs * 2)
  }
}

async function mapWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor++]
      await fn(item)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
}

async function processPost(
  post: WpPost,
  categoryMap: Map<number, string>,
  tagMap: Map<number, WpTerm>,
  firestore: ReturnType<typeof getAdminFirestore>,
  onResult: (
    result: 'written' | 'skipped-unchanged' | 'skipped-uncategorized' | 'skipped-empty',
    topic?: ScrapableTopic
  ) => void,
  onWrite: (write: PendingWrite) => void
): Promise<void> {
  const topic = resolveTopic(post, categoryMap)
  if (!topic) {
    onResult('skipped-uncategorized')
    return
  }

  const collection = TOPIC_COLLECTION[topic]
  const docId = `sg-${post.slug}`.slice(0, 200)

  const existing = await firestore.collection(collection).doc(docId).get()
  if (existing.exists && existing.data()?.wpModified === post.modified) {
    onResult('skipped-unchanged', topic)
    return
  }

  const plainText = stripToPlainText(post.content.rendered)
  if (plainText.trim().length === 0) {
    onResult('skipped-empty', topic)
    return
  }

  const tagNames = post.tags
    .map((tagId) => tagMap.get(tagId)?.name)
    .filter((name): name is string => !!name)

  const extracted = await withRetry(() => extractFields(topic, post.title.rendered, plainText, tagNames))

  const data: Record<string, unknown> = {
    ...extracted,
    id: docId,
    topic,
    location: (extracted.location as string | undefined) || locationFromTags(post, tagMap) || '',
    tips: (extracted.tips as string | undefined) || amenityTagsAsTips(post, tagMap) || '',
    source: 'scraped',
    sourceUrl: post.link,
    lastScrapedAt: new Date(),
    wpModified: post.modified
  }

  onWrite({ collection, id: docId, data })
  onResult('written', topic)
}

async function main() {
  const firestore = getAdminFirestore()

  console.log('Fetching categories and tags from samalguide.com...')
  const [categoryMap, tagMap] = await Promise.all([fetchCategoryMap(), fetchTagMap()])

  console.log('Fetching posts from samalguide.com...')
  const posts = await fetchAllPosts()
  console.log(`Fetched ${posts.length} posts.`)

  const pendingWrites: PendingWrite[] = []
  const counts = { written: 0, unchanged: 0, uncategorized: 0, empty: 0 }
  const perTopicWritten: Partial<Record<ScrapableTopic, number>> = {}

  await mapWithConcurrency(posts, EXTRACTION_CONCURRENCY, (post) =>
    processPost(
      post,
      categoryMap,
      tagMap,
      firestore,
      (result, topic) => {
        if (result === 'written') {
          counts.written += 1
          if (topic) perTopicWritten[topic] = (perTopicWritten[topic] ?? 0) + 1
        } else if (result === 'skipped-unchanged') {
          counts.unchanged += 1
        } else if (result === 'skipped-empty') {
          counts.empty += 1
        } else {
          counts.uncategorized += 1
        }
      },
      (write) => pendingWrites.push(write)
    )
  )

  for (const batchDocs of chunk(pendingWrites, BATCH_LIMIT)) {
    const batch = firestore.batch()
    for (const { collection, id, data } of batchDocs) {
      batch.set(firestore.collection(collection).doc(id), data, { merge: true })
    }
    await batch.commit()
  }

  console.log(`\nWrote/updated ${counts.written} document(s).`)
  console.log('Per topic:', perTopicWritten)
  console.log(
    `Skipped ${counts.unchanged} unchanged post(s), ${counts.uncategorized} uncategorized/unsupported post(s) (e.g. "news"), ${counts.empty} post(s) with no extractable text (e.g. dead redirect stubs).`
  )
  console.log('\nNext: run `pnpm ingest` to embed these into Vectorize.')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
