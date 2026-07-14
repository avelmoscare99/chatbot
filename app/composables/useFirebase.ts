import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

export function useFirebaseAuth(): Auth {
  const { $firebaseAuth } = useNuxtApp()
  return $firebaseAuth as Auth
}

export function useFirestore(): Firestore {
  const { $firestore } = useNuxtApp()
  return $firestore as Firestore
}
