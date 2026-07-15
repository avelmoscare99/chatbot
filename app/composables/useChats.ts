import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import type { ChatMessage, ChatSession } from '~~/types/tourism'

export function useChats() {
  const firestore = useFirestore()
  const { currentUser } = useCurrentUser()

  const chats = useState<ChatSession[]>('chats.list', () => [])
  const activeChatId = useState<string | null>('chats.activeId', () => null)
  const messages = useState<ChatMessage[]>('chats.messages', () => [])

  function requireUid(): string {
    const uid = currentUser.value?.uid
    if (!uid) {
      throw new Error('Not signed in')
    }
    return uid
  }

  function chatsCollection() {
    return collection(firestore, 'users', requireUid(), 'chats')
  }

  function messagesCollection(chatId: string) {
    return collection(firestore, 'users', requireUid(), 'chats', chatId, 'messages')
  }

  function subscribeToChats(): () => void {
    return onSnapshot(query(chatsCollection(), orderBy('updatedAt', 'desc')), (snapshot) => {
      chats.value = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ChatSession)
    })
  }

  function subscribeToMessages(chatId: string): () => void {
    return onSnapshot(query(messagesCollection(chatId), orderBy('createdAt', 'asc')), (snapshot) => {
      messages.value = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ChatMessage)
    })
  }

  async function createChat(title: string): Promise<string> {
    const ref = await addDoc(chatsCollection(), {
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessagePreview: ''
    })
    return ref.id
  }

  async function appendMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    await addDoc(messagesCollection(chatId), {
      role,
      content,
      createdAt: serverTimestamp()
    })
    await updateDoc(doc(firestore, 'users', requireUid(), 'chats', chatId), {
      updatedAt: serverTimestamp(),
      lastMessagePreview: content.slice(0, 120)
    })
  }

  return {
    chats,
    activeChatId,
    messages,
    subscribeToChats,
    subscribeToMessages,
    createChat,
    appendMessage
  }
}
