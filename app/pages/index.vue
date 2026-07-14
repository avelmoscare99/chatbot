<script setup lang="ts">
const { currentUser } = useCurrentUser()
const { signOutUser } = useAuth()

async function onSignOut() {
  await signOutUser()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-sky-50 px-4">
    <p class="text-lg text-slate-700">
      Signed in as <span class="font-medium">{{ currentUser?.displayName || currentUser?.email }}</span>
    </p>
    <button
      type="button"
      class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      @click="onSignOut"
    >
      Sign out
    </button>
  </div>
</template>
