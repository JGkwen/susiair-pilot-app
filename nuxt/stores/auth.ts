interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>('auth_token')
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function login(username: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const { accessToken } = await useApi()<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { username, password },
      })
      token.value = accessToken
      await navigateTo('/')
    }
    catch (caught) {
      if (!(caught instanceof ApiError)) throw caught
      error.value = caught.message
    }
    finally {
      loading.value = false
    }
  }

  async function logout() {
    token.value = null
    await navigateTo('/login')
  }

  return { token, loading, error, login, logout }
})
