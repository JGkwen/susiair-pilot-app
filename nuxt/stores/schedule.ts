import type { PilotProfile } from '~/stores/home'

export interface ScheduleDay {
  date: string
  dutyType: string
  baseName: string
  baseColor: string
  countSchedules: number
  countLogbooks: number
  remaining: number
}

export interface LegendItem {
  code: string
  label: string
  color: string
}

interface SchedulesResponse {
  year: number
  month: number
  days: ScheduleDay[]
  legend: LegendItem[]
}

interface YearMonth {
  year: number
  month: number
}

const FIRST_MONTH_INDEX = 2000 * 12
const LAST_MONTH_INDEX = 2100 * 12 + 11

function toMonthIndex({ year, month }: YearMonth): number {
  return year * 12 + month - 1
}

function fromMonthIndex(index: number): YearMonth {
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

export const useScheduleStore = defineStore('schedule', () => {
  const current = ref<YearMonth | null>(null)
  const days = ref<ScheduleDay[]>([])
  const legend = ref<LegendItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let latestRequestId = 0

  const canGoPrevious = computed(() => current.value !== null && toMonthIndex(current.value) > FIRST_MONTH_INDEX)
  const canGoNext = computed(() => current.value !== null && toMonthIndex(current.value) < LAST_MONTH_INDEX)

  async function fetchMonth() {
    const requestId = ++latestRequestId
    const api = useApi()
    loading.value = true
    error.value = null
    try {
      if (!current.value) {
        const { asOf } = await api<PilotProfile>('/pilot/me')
        current.value = { year: Number(asOf.slice(0, 4)), month: Number(asOf.slice(5, 7)) }
      }
      const { year, month } = current.value
      const response = await api<SchedulesResponse>(`/schedules?year=${year}&month=${month}`)
      if (requestId !== latestRequestId) return
      days.value = response.days
      legend.value = response.legend
    }
    catch (caught) {
      if (!(caught instanceof ApiError)) throw caught
      if (requestId === latestRequestId) error.value = caught.message
    }
    finally {
      if (requestId === latestRequestId) loading.value = false
    }
  }

  function changeMonth(step: 1 | -1) {
    const isAllowed = step === 1 ? canGoNext.value : canGoPrevious.value
    if (!current.value || !isAllowed) return
    current.value = fromMonthIndex(toMonthIndex(current.value) + step)
    return fetchMonth()
  }

  return { current, days, legend, loading, error, canGoPrevious, canGoNext, fetchMonth, changeMonth }
})
