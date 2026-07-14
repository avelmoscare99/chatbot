const PUBLIC_PAGES = ['/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser, authReady } = useCurrentUser()

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
