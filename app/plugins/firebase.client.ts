import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// .client.ts suffix: this must never run during Nuxt's build/prerender pass.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const app = initializeApp({
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId
  })

  const auth = getAuth(app)
  const firestore = getFirestore(app)

  // Single shared listener for the whole app. useCurrentUser() reads this state
  // rather than each caller registering its own onAuthStateChanged.
  const currentUser = useState<User | null>('firebase.currentUser', () => null)
  const authReady = useState<boolean>('firebase.authReady', () => false)

  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    authReady.value = true
  })

  return {
    provide: {
      firebaseApp: app,
      firebaseAuth: auth,
      firestore
    }
  }
})
