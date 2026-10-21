export const SUMMARY_RANGES = ['1w', '1m', '3m', '6m', '1y'] as const

export type SummaryRange = (typeof SUMMARY_RANGES)[number]

export type DocumentStatus = 'safe' | 'soon' | 'expired'

export interface PilotProfile {
  name: string
  totalFlightHours: number
  avatarUrl: string
  asOf: string
}

export interface SummaryPoint {
  date: string
  rollingSum: number
  isFuture: boolean
}

export interface LimitCard {
  key: string
  label: string
  current: number
  limit: number
  windowDays: number
}

export interface FlightHoursSummary {
  range: SummaryRange
  windowDays: number
  limit: number
  yMax: number
  asOf: string
  points: SummaryPoint[]
  cards: LimitCard[]
}

export interface PilotDocument {
  id: string
  name: string
  expiryDate: string
  daysRemaining: number
  status: DocumentStatus
}

interface DocumentsResponse {
  items: PilotDocument[]
}

interface RequestState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

function emptyRequest<T>(): RequestState<T> {
  return { data: null, loading: false, error: null }
}

async function load<T>(request: RequestState<T>, path: string) {
  if (request.loading || request.data) return
  request.loading = true
  request.error = null
  try {
    request.data = await useApi()<T>(path)
  }
  catch (caught) {
    if (!(caught instanceof ApiError)) throw caught
    request.error = caught.message
  }
  finally {
    request.loading = false
  }
}

export const useHomeStore = defineStore('home', () => {
  const profile = reactive(emptyRequest<PilotProfile>())
  const documents = reactive(emptyRequest<DocumentsResponse>())
  const summaries = reactive({
    '1w': emptyRequest<FlightHoursSummary>(),
    '1m': emptyRequest<FlightHoursSummary>(),
    '3m': emptyRequest<FlightHoursSummary>(),
    '6m': emptyRequest<FlightHoursSummary>(),
    '1y': emptyRequest<FlightHoursSummary>(),
  })
  const selectedRange = ref<SummaryRange>('1w')

  const summary = computed(() => summaries[selectedRange.value])
  const cards = computed(() => Object.values(summaries).find(request => request.data)?.data?.cards)

  function fetchProfile() {
    return load(profile, '/pilot/me')
  }

  function fetchDocuments() {
    return load(documents, '/documents')
  }

  function fetchSummary(range: SummaryRange) {
    return load(summaries[range], `/flight-hours/summary?range=${range}`)
  }

  function selectRange(range: SummaryRange) {
    selectedRange.value = range
    return fetchSummary(range)
  }

  function loadAll() {
    return Promise.all([fetchProfile(), fetchDocuments(), fetchSummary(selectedRange.value)])
  }

  return {
    profile,
    documents,
    summaries,
    selectedRange,
    summary,
    cards,
    fetchProfile,
    fetchDocuments,
    fetchSummary,
    selectRange,
    loadAll,
  }
})
