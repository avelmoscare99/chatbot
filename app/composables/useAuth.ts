import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'

async function upsertUserProfile(uid: string, data: Record<string, unknown>) {
  const firestore = useFirestore()
  await setDoc(
    doc(firestore, 'users', uid),
    { ...data, lastLoginAt: serverTimestamp() },
    { merge: true }
  )
}

export function useAuth() {
  const auth = useFirebaseAuth()

  async function signUpWithEmail(email: string, password: string, displayName: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await updateProfile(credential.user, { displayName })
    }
    await upsertUserProfile(credential.user.uid, {
      displayName,
      email: credential.user.email,
      photoURL: credential.user.photoURL,
      createdAt: serverTimestamp()
    })
    return credential.user
  }

  async function signInWithEmail(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    await upsertUserProfile(credential.user.uid, {})
    return credential.user
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    const credential = await signInWithPopup(auth, provider)
    await upsertUserProfile(credential.user.uid, {
      displayName: credential.user.displayName,
      email: credential.user.email,
      photoURL: credential.user.photoURL,
      createdAt: serverTimestamp()
    })
    return credential.user
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email)
  }

  async function signOutUser() {
    await signOut(auth)
  }

  return { signUpWithEmail, signInWithEmail, signInWithGoogle, resetPassword, signOutUser }
}
