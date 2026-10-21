export interface ApiErrorBody {
  statusCode: number
  error: string
  message: string | string[]
  path: string
  timestamp: string
}

export class ApiError extends Error {
  readonly body: ApiErrorBody

  constructor(body: ApiErrorBody) {
    super(Array.isArray(body.message) ? body.message.join('. ') : body.message)
    this.body = body
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST'
  body?: Record<string, unknown>
}

const SERVER_UNREACHABLE_MESSAGE = 'Cannot reach the server. Please check your connection and try again.'

export function useApi() {
  const { apiBase } = useRuntimeConfig().public
  const auth = useAuthStore()

  return async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const response = await $fetch
      .raw<T>(path, {
        ...options,
        baseURL: apiBase,
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
        ignoreResponseError: true,
      })
      .catch(() => {
        throw new ApiError(unreachableErrorBody(path, 0))
      })
    if (response.ok) return response._data as T

    const data: unknown = response._data
    const body = isApiErrorBody(data) ? data : unreachableErrorBody(path, response.status)
    if (body.statusCode === 401 && auth.token) await auth.logout()
    throw new ApiError(body)
  }
}

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return typeof data === 'object' && data !== null && 'statusCode' in data && 'message' in data
}

function unreachableErrorBody(path: string, statusCode: number): ApiErrorBody {
  return {
    statusCode,
    error: 'Network Error',
    message: SERVER_UNREACHABLE_MESSAGE,
    path,
    timestamp: new Date().toISOString(),
  }
}
