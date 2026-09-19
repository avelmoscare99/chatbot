<script setup lang="ts">
import type { ChatSession } from '~~/types/tourism'

defineProps<{
  chats: ChatSession[]
  activeChatId: string | null
  userLabel: string
  open: boolean
}>()

const emit = defineEmits<{
  select: [chatId: string]
  newChat: []
  signOut: []
  close: []
}>()
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-30 bg-slate-900/40 md:hidden" @click="emit('close')" />

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <div class="flex items-center gap-2 border-b border-slate-200 p-3">
      <button
        type="button"
        class="flex-1 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
        @click="emit('newChat')"
      >
        New chat
      </button>
      <button
        type="button"
        aria-label="Close chat list"
        class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
        @click="emit('close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
          <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
    <div class="flex-1 overflow-y-auto">
      <button
        v-for="chat in chats"
        :key="chat.id"
        type="button"
        :class="[
          'block w-full truncate px-3 py-2 text-left text-sm hover:bg-slate-100',
          chat.id === activeChatId ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600'
        ]"
        @click="emit('select', chat.id)"
      >
        {{ chat.title }}
      </button>
    </div>
    <div class="border-t border-slate-200 p-3">
      <p class="truncate text-xs text-slate-500">{{ userLabel }}</p>
      <button type="button" class="mt-1 text-xs text-sky-600 hover:underline" @click="emit('signOut')">
        Sign out
      </button>
    </div>
  </aside>
</template>
