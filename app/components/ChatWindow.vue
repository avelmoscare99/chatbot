<script setup lang="ts">
import type { ChatMessage as ChatMessageType } from '~~/types/tourism'

const props = defineProps<{
  messages: ChatMessageType[]
  streamingText: string
  isSending: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
  openSidebar: []
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const menuOpen = ref(false)

function onAskFromMenu(query: string) {
  menuOpen.value = false
  emit('send', query)
}

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
  <div class="flex h-full min-w-0 flex-1 flex-col bg-slate-50">
    <div class="flex items-center gap-2 border-b border-slate-200 bg-white p-3 md:hidden">
      <button
        type="button"
        aria-label="Open chat list"
        class="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100"
        @click="emit('openSidebar')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
          <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span class="truncate text-sm font-semibold text-slate-900">Samal Tourism Chatbot</span>
    </div>
    <div class="relative flex-1 overflow-hidden">
      <div ref="scrollContainer" class="h-full space-y-3 overflow-y-auto p-4">
        <p v-if="messages.length === 0 && !streamingText" class="text-center text-sm text-slate-400">
          Ask me about Samal Island attractions, resorts, activities, or request an itinerary.
        </p>
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :id="message.id"
          :role="message.role"
          :content="message.content"
          :sources="message.sources"
          :rating="message.rating"
        />
        <ChatMessage v-if="streamingText" role="assistant" :content="streamingText" />
        <TypingIndicator v-else-if="isSending" />
      </div>
      <CategoryMenuSheet v-if="menuOpen" @close="menuOpen = false" @ask="onAskFromMenu" />
    </div>
    <ChatInput :disabled="isSending" @send="(text) => emit('send', text)" @menu="menuOpen = true" />
  </div>
</template>
