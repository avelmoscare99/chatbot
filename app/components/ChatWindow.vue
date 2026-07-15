<script setup lang="ts">
import type { ChatMessage as ChatMessageType } from '~~/types/tourism'

const props = defineProps<{
  messages: ChatMessageType[]
  streamingText: string
  isSending: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
}>()

const scrollContainer = ref<HTMLElement | null>(null)

watch(
  () => [props.messages.length, props.streamingText, props.isSending],
  async () => {
    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  }
)
</script>

<template>
  <div class="flex h-full flex-1 flex-col bg-slate-50">
    <div ref="scrollContainer" class="flex-1 space-y-3 overflow-y-auto p-4">
      <p v-if="messages.length === 0 && !streamingText" class="text-center text-sm text-slate-400">
        Ask me about Samal Island attractions, resorts, activities, or request an itinerary.
      </p>
      <ChatMessage v-for="message in messages" :key="message.id" :role="message.role" :content="message.content" />
      <ChatMessage v-if="streamingText" role="assistant" :content="streamingText" />
      <TypingIndicator v-else-if="isSending" />
    </div>
    <ChatInput :disabled="isSending" @send="(text) => emit('send', text)" />
  </div>
</template>
