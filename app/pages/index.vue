<script setup lang="ts">
const { currentUser } = useCurrentUser()
const { signOutUser } = useAuth()
const { chats, activeChatId, messages, subscribeToChats, subscribeToMessages, createChat, appendMessage } =
  useChats()
const { streamAnswer } = useChatStream()

const isSending = ref(false)
const streamingText = ref('')
const mode = ref<'chat' | 'menu'>('chat')

let unsubscribeChats: (() => void) | null = null
let unsubscribeMessages: (() => void) | null = null

onMounted(() => {
  unsubscribeChats = subscribeToChats()
})

onBeforeUnmount(() => {
  unsubscribeChats?.()
  unsubscribeMessages?.()
})

function selectChat(chatId: string) {
  activeChatId.value = chatId
  unsubscribeMessages?.()
  unsubscribeMessages = subscribeToMessages(chatId)
}

function startNewChat() {
  unsubscribeMessages?.()
  unsubscribeMessages = null
  messages.value = []
  activeChatId.value = null
}

async function onSend(text: string) {
  if (isSending.value) return
  isSending.value = true
  streamingText.value = ''

  try {
    let chatId = activeChatId.value
    if (!chatId) {
      chatId = await createChat(text.slice(0, 60))
      activeChatId.value = chatId
      unsubscribeMessages?.()
      unsubscribeMessages = subscribeToMessages(chatId)
    }

    const history = messages.value.map((message) => ({ role: message.role, content: message.content }))

    await appendMessage(chatId, 'user', text)

    let finalText = ''
    await streamAnswer(text, history, (chunk) => {
      finalText += chunk
      streamingText.value = finalText
    })

    streamingText.value = ''
    await appendMessage(chatId, 'assistant', finalText)
  } catch (err) {
    streamingText.value = `Something went wrong: ${(err as Error).message}`
  } finally {
    isSending.value = false
  }
}

async function onSignOut() {
  await signOutUser()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex h-screen flex-col">
    <div class="flex items-center justify-center gap-2 border-b border-slate-200 bg-white p-2">
      <button
        type="button"
        :class="[
          'rounded-md px-3 py-1 text-sm font-medium',
          mode === 'chat' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
        ]"
        @click="mode = 'chat'"
      >
        Chat
      </button>
      <button
        type="button"
        :class="[
          'rounded-md px-3 py-1 text-sm font-medium',
          mode === 'menu' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
        ]"
        @click="mode = 'menu'"
      >
        Browse by Category
      </button>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <template v-if="mode === 'chat'">
        <ChatSidebar
          :chats="chats"
          :active-chat-id="activeChatId"
          :user-label="currentUser?.displayName || currentUser?.email || ''"
          @select="selectChat"
          @new-chat="startNewChat"
          @sign-out="onSignOut"
        />
        <ChatWindow :messages="messages" :streaming-text="streamingText" :is-sending="isSending" @send="onSend" />
      </template>
      <MenuBrowser v-else @switch-to-chat="mode = 'chat'" />
    </div>
  </div>
</template>
