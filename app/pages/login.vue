<script setup lang="ts">
const email = ref('')
const password = ref('')
const error = ref('')
const resetSent = ref(false)
const isSubmitting = ref(false)

const { signInWithEmail, signInWithGoogle, resetPassword } = useAuth()

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'Incorrect email or password.'
  }
  if (code.includes('too-many-requests')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  return 'Something went wrong. Please try again.'
}

async function onSubmit() {
  error.value = ''
  isSubmitting.value = true
  try {
    await signInWithEmail(email.value, password.value)
    await navigateTo('/')
  } catch (err) {
    error.value = friendlyError(err)
  } finally {
    isSubmitting.value = false
  }
}

async function onGoogleSignIn() {
  error.value = ''
  isSubmitting.value = true
  try {
    await signInWithGoogle()
    await navigateTo('/')
  } catch (err) {
    error.value = friendlyError(err)
  } finally {
    isSubmitting.value = false
  }
}

async function onForgotPassword() {
  error.value = ''
  resetSent.value = false
  if (!email.value) {
    error.value = 'Enter your email above first, then tap "Forgot password?"'
    return
  }
  try {
    await resetPassword(email.value)
    resetSent.value = true
  } catch (err) {
    error.value = friendlyError(err)
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-sky-50 px-4">
    <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">Samal Tourism Chatbot</h1>
      <p class="mt-1 text-sm text-slate-500">Sign in to start planning your trip.</p>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="resetSent" class="text-sm text-emerald-600">Password reset email sent.</p>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-60"
        >
          {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
        </button>

        <button type="button" class="text-xs text-sky-600 hover:underline" @click="onForgotPassword">
          Forgot password?
        </button>
      </form>

      <div class="my-6 flex items-center gap-3 text-xs text-slate-400">
        <div class="h-px flex-1 bg-slate-200" />
        or
        <div class="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        :disabled="isSubmitting"
        class="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        @click="onGoogleSignIn"
      >
        Continue with Google
      </button>

      <p class="mt-6 text-center text-sm text-slate-500">
        No account?
        <NuxtLink to="/register" class="font-medium text-sky-600 hover:underline">Sign up</NuxtLink>
      </p>
    </div>
  </div>
</template>
