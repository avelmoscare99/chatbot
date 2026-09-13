<script setup lang="ts">
import type { TourismRecord, TourismTopic } from '~~/types/tourism'

const emit = defineEmits<{
  close: []
  ask: [query: string]
}>()

const { fetchTopicItems } = useTopicBrowser()

const view = ref<'topics' | 'list'>('topics')
const activeTopic = ref<TourismTopic | null>(null)
const items = ref<TourismRecord[]>([])
const isLoading = ref(false)

const title = computed(() => {
  if (view.value === 'list' && activeTopic.value) return TOPIC_LABELS[activeTopic.value]
  return 'Browse by Category'
})

async function selectTopic(topic: TourismTopic) {
  activeTopic.value = topic
  isLoading.value = true
  try {
    items.value = await fetchTopicItems(topic)
    view.value = 'list'
  } finally {
    isLoading.value = false
  }
}

function selectItem(item: TourismRecord) {
  emit('ask', getAskQuery(item))
}

function backToTopics() {
  items.value = []
  activeTopic.value = null
  view.value = 'topics'
}
</script>

<template>
  <div class="absolute inset-0 z-10">
    <div class="absolute inset-0 bg-slate-900/30" @click="emit('close')" />

    <div class="absolute inset-x-0 bottom-0 z-20 flex max-h-[75%] flex-col rounded-t-2xl border-t border-slate-200 bg-slate-50 shadow-lg">
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 class="text-sm font-semibold text-slate-900">{{ title }}</h2>
        <button
          type="button"
          aria-label="Close menu"
          class="rounded p-1 text-slate-500 hover:bg-slate-100"
          @click="emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
            <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="view === 'topics'" class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="topic in TOPIC_ORDER"
            :key="topic"
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100"
            @click="selectTopic(topic)"
          >
            {{ TOPIC_LABELS[topic] }}
          </button>
        </div>

        <div v-else-if="view === 'list'">
          <button type="button" class="mb-3 text-xs text-sky-600 hover:underline" @click="backToTopics">
            ← Back to categories
          </button>
          <p v-if="isLoading" class="text-sm text-slate-400">Loading…</p>
          <p v-else-if="items.length === 0" class="text-sm text-slate-400">Nothing here yet.</p>
          <div v-else class="space-y-2">
            <button
              v-for="item in items"
              :key="item.id"
              type="button"
              class="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-800 shadow-sm transition hover:bg-slate-100"
              @click="selectItem(item)"
            >
              {{ getItemLabel(item) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
