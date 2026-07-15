import type { ChatHistoryTurn } from './useWorkerApi'

async function consumeEventStream(stream: ReadableStream<Uint8Array>, onToken: (text: string) => void): Promise<void> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      const line = event.trim()
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (payload === '[DONE]') continue

      try {
        const parsed = JSON.parse(payload) as { response?: string }
        if (parsed.response) {
          onToken(parsed.response)
        }
      } catch {
        continue
      }
    }
  }
}

export function useChatStream() {
  const { streamChat } = useWorkerApi()

  async function streamAnswer(
    message: string,
    history: ChatHistoryTurn[],
    onToken: (text: string) => void
  ): Promise<void> {
    const stream = await streamChat(message, history)
    await consumeEventStream(stream, onToken)
  }

  return { streamAnswer }
}
