import { Auth, WorkersKVStoreSingle } from 'firebase-auth-cloudflare-workers'
import type { Env } from './types'

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

export interface AuthenticatedUser {
  uid: string
  email?: string
}

export async function verifyFirebaseToken(request: Request, env: Env): Promise<AuthenticatedUser> {
  const header = request.headers.get('Authorization') ?? ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    throw new AuthError('Missing bearer token')
  }

  const keyStore = WorkersKVStoreSingle.getOrInitialize('firebase-public-jwks', env.FIREBASE_JWK_CACHE)
  const auth = Auth.getOrInitialize(env.FIREBASE_PROJECT_ID, keyStore)

  try {
    const decoded = await auth.verifyIdToken(token)
    return { uid: decoded.sub, email: decoded.email }
  } catch {
    throw new AuthError('Invalid or expired token')
  }
}
