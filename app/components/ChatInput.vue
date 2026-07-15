<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
}>()

const text = ref('')

function submit() {
  const value = text.value.trim()
  if (!value || props.disabled) return
  emit('send', value)
  text.value = ''
}
</script>

<template>
  <form class="flex items-end gap-2 border-t border-slate-200 bg-white p-3" @submit.prevent="submit">
    <textarea
      v-model="text"
      rows="1"
      placeholder="Ask about attractions, resorts, activities, or an itinerary..."
      class="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
      @keydown.enter.exact.prevent="submit"
    />
    <button
      type="submit"
      :disabled="disabled || !text.trim()"
      class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
    >
      Send
    </button>
  </form>
</template>
