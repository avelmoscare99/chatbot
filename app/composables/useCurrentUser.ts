import type { User } from 'firebase/auth'

/**
 * Reads the shared auth state populated by app/plugins/firebase.client.ts.
 * `authReady` flips true after Firebase's first onAuthStateChanged callback -
 * middleware must wait on it, otherwise a page refresh bounces logged-in users
 * to /login before the session restores from IndexedDB.
 */
export function useCurrentUser() {
  const currentUser = useState<User | null>('firebase.currentUser', () => null)
  const authReady = useState<boolean>('firebase.authReady', () => false)

  return { currentUser, authReady }
}
