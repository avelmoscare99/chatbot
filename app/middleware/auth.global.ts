const PUBLIC_PAGES = ['/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser, authReady } = useCurrentUser()

  // Wait for Firebase's first onAuthStateChanged callback before deciding anything -
  // otherwise a page refresh briefly reads currentUser as null and bounces a
  // logged-in user to /login before the session restores from IndexedDB.
  if (!authReady.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(authReady, (ready) => {
        if (ready) {
          unwatch()
          resolve()
        }
      })
    })
  }

  const isPublicPage = PUBLIC_PAGES.includes(to.path)

  if (!currentUser.value && !isPublicPage) {
    return navigateTo('/login')
  }

  if (currentUser.value && isPublicPage) {
    return navigateTo('/')
  }
})
