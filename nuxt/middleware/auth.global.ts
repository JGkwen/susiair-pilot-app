export default defineNuxtRouteMiddleware((to) => {
  const isSignedIn = Boolean(useAuthStore().token)
  if (!isSignedIn && to.path !== '/login') return navigateTo('/login')
  if (isSignedIn && to.path === '/login') return navigateTo('/')
})
