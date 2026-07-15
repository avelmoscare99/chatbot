export interface ChatHistoryTurn {
  role: 'user' | 'assistant'
  content: string
}

export function useWorkerApi() {
  const config = useRuntimeConfig()
  const auth = useFirebaseAuth()

  async function streamChat(message: string, history: ChatHistoryTurn[]): Promise<ReadableStream<Uint8Array>> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('Not signed in')
    }

    const idToken = await user.getIdToken()
    const response = await fetch(`${config.public.workerBaseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ message, history })
    })

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => '')
      throw new Error(errorText || `Worker request failed with status ${response.status}`)
    }

    return response.body
  }

  return { streamChat }
}
