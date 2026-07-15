import 'dotenv/config'
import { getAdminFirestore } from './firebaseAdmin'
import { SEED_COLLECTIONS } from './seedData'

const BATCH_LIMIT = 400

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

async function main() {
  const firestore = getAdminFirestore()
  let total = 0

  for (const { collection, items } of SEED_COLLECTIONS) {
    for (const batchItems of chunk(items, BATCH_LIMIT)) {
      const batch = firestore.batch()
      for (const item of batchItems) {
        const { id, ...data } = item
        batch.set(firestore.collection(collection).doc(id), { ...data, updatedAt: new Date() }, { merge: true })
      }
      await batch.commit()
    }
    console.log(`Seeded ${items.length} documents into "${collection}".`)
    total += items.length
  }

  console.log(`Seeded ${total} total documents across ${SEED_COLLECTIONS.length} collections.`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
