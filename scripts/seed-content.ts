import 'dotenv/config'
import { getAdminFirestore } from './firebaseAdmin'
import { SEED_ITEMS } from './seedData'

async function main() {
  const firestore = getAdminFirestore()
  const batch = firestore.batch()

  for (const item of SEED_ITEMS) {
    const { id, ...data } = item
    const ref = firestore.collection('tourismContent').doc(id)
    batch.set(ref, { ...data, updatedAt: new Date() }, { merge: true })
  }

  await batch.commit()
  console.log(`Seeded ${SEED_ITEMS.length} tourismContent documents.`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
