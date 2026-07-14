import { readFileSync } from 'node:fs'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

export function getAdminFirestore() {
  if (!getApps().length) {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    if (!credentialsPath) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set')
    }
    const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf8'))
    initializeApp({ credential: cert(serviceAccount) })
  }
  return getFirestore()
}
