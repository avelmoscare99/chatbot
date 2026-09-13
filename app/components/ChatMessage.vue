<script setup lang="ts">
import type { ChatSource } from '~~/types/tourism'

const props = defineProps<{
  id?: string
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
  rating?: 'helpful' | 'not_helpful'
}>()

const { activeChatId, rateMessage } = useChats()

async function onRate(rating: 'helpful' | 'not_helpful') {
  if (!props.id || !activeChatId.value) return
  const next = props.rating === rating ? null : rating
  await rateMessage(activeChatId.value, props.id, next)
}
</script>

<template>
  <div :class="['flex', props.role === 'user' ? 'justify-end' : 'justify-start']">
    <div class="max-w-[80%]">
      <div
        :class="[
          'whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm',
          props.role === 'user' ? 'bg-sky-600 text-white' : 'border border-slate-200 bg-white text-slate-800'
        ]"
        v-html="renderMarkdownLite(props.content)"
      />
      <div
        v-if="props.role === 'assistant' && props.sources?.length"
        class="mt-1 flex flex-wrap gap-x-2 gap-y-1 px-1 text-xs text-slate-400"
      >
        <span>Sources:</span>
        <a
          v-for="source in props.sources"
          :key="source.url"
          :href="source.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sky-600 underline hover:text-sky-700"
        >{{ source.name }}</a>
      </div>
      <div v-if="props.role === 'assistant' && props.id" class="mt-1 flex items-center gap-1 px-1">
        <button
          type="button"
          :class="['rounded p-1 hover:bg-slate-100', props.rating === 'helpful' ? 'text-emerald-600' : 'text-slate-400']"
          aria-label="Mark as helpful"
          @click="onRate('helpful')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
            <path
              d="M2 21h2a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H2v11zM22 10.5a2.5 2.5 0 0 0-2.5-2.5H15l.71-3.55A1.94 1.94 0 0 0 13.8 2a1.9 1.9 0 0 0-1.7 1.06L9 8H7v11h11.06a2.5 2.5 0 0 0 2.44-1.94l1.38-6a2.5 2.5 0 0 0 .12-.76V10.5z"
            />
          </svg>
        </button>
        <button
          type="button"
          :class="['rounded p-1 hover:bg-slate-100', props.rating === 'not_helpful' ? 'text-rose-600' : 'text-slate-400']"
          aria-label="Mark as not helpful"
          @click="onRate('not_helpful')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 rotate-180">
            <path
              d="M2 21h2a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H2v11zM22 10.5a2.5 2.5 0 0 0-2.5-2.5H15l.71-3.55A1.94 1.94 0 0 0 13.8 2a1.9 1.9 0 0 0-1.7 1.06L9 8H7v11h11.06a2.5 2.5 0 0 0 2.44-1.94l1.38-6a2.5 2.5 0 0 0 .12-.76V10.5z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
