<script setup lang="ts">
import type { TourismRecord, TourismTopic } from '~~/types/tourism'

const emit = defineEmits<{
  switchToChat: []
}>()

const { fetchTopicItems } = useTopicBrowser()

const view = ref<'topics' | 'list' | 'detail'>('topics')
const items = ref<TourismRecord[]>([])
const selectedItem = ref<TourismRecord | null>(null)
const isLoading = ref(false)

async function selectTopic(topic: TourismTopic) {
  isLoading.value = true
  try {
    items.value = await fetchTopicItems(topic)
    view.value = 'list'
  } finally {
    isLoading.value = false
  }
}

function selectItem(item: TourismRecord) {
  selectedItem.value = item
  view.value = 'detail'
}

function backToList() {
  selectedItem.value = null
  view.value = 'list'
}

function backToTopics() {
  items.value = []
  view.value = 'topics'
}
</script>

<template>
  <div class="flex h-full flex-1 flex-col bg-slate-50">
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

      <div v-else-if="view === 'detail' && selectedItem">
        <button type="button" class="mb-3 text-xs text-sky-600 hover:underline" @click="backToList">
          ← Back to list
        </button>
        <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 class="mb-2 text-base font-semibold text-slate-900">{{ getItemLabel(selectedItem) }}</h2>
          <p
            v-for="(line, index) in getItemDetailLines(selectedItem)"
            :key="index"
            class="mb-1 text-sm text-slate-700"
          >
            {{ line }}
          </p>
        </div>
      </div>
    </div>

    <div class="border-t border-slate-200 bg-white p-3 text-center">
      <button type="button" class="text-sm font-medium text-sky-600 hover:underline" @click="emit('switchToChat')">
        Switch to chat
      </button>
    </div>
  </div>
</template>
