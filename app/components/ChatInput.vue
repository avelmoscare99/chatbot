<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
  menu: []
}>()

const text = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const MAX_TEXTAREA_HEIGHT_PX = 160

function resizeTextarea() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`
}

function submit() {
  const value = text.value.trim()
  if (!value || props.disabled) return
  emit('send', value)
  text.value = ''
  nextTick(resizeTextarea)
}
</script>

<template>
  <form class="flex items-end gap-2 border-t border-slate-200 bg-white p-3" @submit.prevent="submit">
    <button
      type="button"
      aria-label="Browse by category"
      class="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100"
      @click="emit('menu')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
        <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <textarea
      ref="textareaRef"
      v-model="text"
      rows="1"
      placeholder="Ask about Samal Island..."
      class="max-h-40 flex-1 resize-none overflow-y-auto rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
      @input="resizeTextarea"
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
