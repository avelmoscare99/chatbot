<script setup lang="ts">
import type { ChatSession } from '~~/types/tourism'

defineProps<{
  chats: ChatSession[]
  activeChatId: string | null
  userLabel: string
}>()

const emit = defineEmits<{
  select: [chatId: string]
  newChat: []
  signOut: []
}>()
</script>

<template>
  <aside class="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
    <div class="border-b border-slate-200 p-3">
      <button
        type="button"
        class="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
        @click="emit('newChat')"
      >
        New chat
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
