import 'dotenv/config'
import { deleteVectors } from './cloudflare'
import { getAdminFirestore } from './firebaseAdmin'

const VECTORIZE_INDEX = 'samal-tourism'
const BATCH_LIMIT = 400

// Safety rail: only these 4 collections have a scraped equivalent. emergencyContacts,
// faqs, souvenirShops, and ferryTerminals must never be pruned — samalguide.com has
// no content covering them, and this list is intentionally hardcoded rather than
// discovered/configurable.
const PRUNABLE_COLLECTIONS = ['touristSpots', 'restaurants', 'accommodations', 'transportation'] as const
type PrunableCollection = (typeof PRUNABLE_COLLECTIONS)[number]

const TOPIC_BY_COLLECTION: Record<PrunableCollection, string> = {
  touristSpots: 'touristSpot',
  restaurants: 'restaurant',
  accommodations: 'accommodation',
  transportation: 'transportation'
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

function parseArgs(argv: string[]): { confirm: boolean; only?: PrunableCollection } {
  const confirm = argv.includes('--confirm')
  const collectionArg = argv.find((arg) => arg.startsWith('--collection='))
  const only = collectionArg?.split('=')[1]

  if (only && !PRUNABLE_COLLECTIONS.includes(only as PrunableCollection)) {
    throw new Error(`--collection must be one of: ${PRUNABLE_COLLECTIONS.join(', ')}`)
  }

  return { confirm, only: only as PrunableCollection | undefined }
}

async function main() {
  const { confirm, only } = parseArgs(process.argv.slice(2))
  const firestore = getAdminFirestore()
  const targets = only ? [only] : PRUNABLE_COLLECTIONS

  for (const collectionName of targets) {
    const snapshot = await firestore.collection(collectionName).get()
    const manualDocs = snapshot.docs.filter((doc) => doc.data().source !== 'scraped')

    console.log(`${collectionName}: ${manualDocs.length} manually-collected document(s) of ${snapshot.size} total.`)

    if (!confirm || manualDocs.length === 0) continue

    const topic = TOPIC_BY_COLLECTION[collectionName]
    const vectorIds = manualDocs.map((doc) => `${topic}-${doc.id}`.slice(0, 64).replace(/-+$/, ''))

    for (const batchDocs of chunk(manualDocs, BATCH_LIMIT)) {
      const batch = firestore.batch()
      for (const doc of batchDocs) {
        batch.delete(doc.ref)
      }
      await batch.commit()
    }
    await deleteVectors(VECTORIZE_INDEX, vectorIds)

    console.log(`  -> deleted ${manualDocs.length} document(s) and their vectors.`)
  }

  if (!confirm) {
    console.log('\nDry run only - no documents were deleted. Re-run with --confirm to actually delete.')
    console.log('Use --collection=<name> to prune a single collection at a time.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
