import type { ChatSource } from '../../types/tourism'

/**
 * Rewrites an upstream SSE stream (Workers AI's own `data: {...}\n\n ... data: [DONE]\n\n`
 * protocol) to inject a `data: {"sources":[...]}\n\n` event immediately before `[DONE]`,
 * without buffering the whole response first.
 */
export function appendSourcesToStream(
  upstream: ReadableStream<Uint8Array>,
  sources: ChatSource[]
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let buffer = ''
  let sourcesSent = false

  function sourcesEvent(): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`)
  }

  function emitEvent(controller: TransformStreamDefaultController<Uint8Array>, event: string) {
    if (!sourcesSent && event.trim() === 'data: [DONE]') {
      controller.enqueue(sourcesEvent())
      sourcesSent = true
    }
    controller.enqueue(encoder.encode(`${event}\n\n`))
  }

  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''
      for (const event of events) {
        emitEvent(controller, event)
      }
    },
    flush(controller) {
      const remaining = buffer.trim()
      if (remaining) {
        emitEvent(controller, remaining)
      }
      if (!sourcesSent) {
        controller.enqueue(sourcesEvent())
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      }
    }
  })

  return upstream.pipeThrough(transform)
}
