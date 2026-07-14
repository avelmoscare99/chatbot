export interface Env {
  AI: Ai
  VECTORIZE: VectorizeIndex
  FIREBASE_JWK_CACHE: KVNamespace
  MEDIA?: R2Bucket
  FIREBASE_PROJECT_ID: string
  ALLOWED_ORIGINS: string
}
