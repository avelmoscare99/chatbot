import type { User } from 'firebase/auth'

export function useCurrentUser() {
  const currentUser = useState<User | null>('firebase.currentUser', () => null)
  const authReady = useState<boolean>('firebase.authReady', () => false)

  return { currentUser, authReady }
}
