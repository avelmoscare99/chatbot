<script setup lang="ts">
const props = defineProps<{
  role: 'user' | 'assistant'
  content: string
}>()
</script>

<template>
  <div :class="['flex', props.role === 'user' ? 'justify-end' : 'justify-start']">
    <div
      :class="[
        'max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm',
        props.role === 'user' ? 'bg-sky-600 text-white' : 'border border-slate-200 bg-white text-slate-800'
      ]"
      v-html="renderMarkdownLite(props.content)"
    />
  </div>
</template>
