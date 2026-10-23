<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { ScheduleDay } from '~/stores/schedule'

const props = defineProps<{
  year: number
  month: number
  days: ScheduleDay[]
}>()

interface DayCell {
  date: string
  dayNumber: number
  entry?: ScheduleDay
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const cells = computed(() => {
  const entriesByDate = new Map(props.days.map(entry => [entry.date, entry]))
  const leadingBlanks = mondayFirstWeekday(props.year, props.month)
  const dayCount = daysInMonth(props.year, props.month)
  const trailingBlanks = (7 - ((leadingBlanks + dayCount) % 7)) % 7
  const dayCells = Array.from({ length: dayCount }, (_, index): DayCell => {
    const date = toIsoDate(props.year, props.month, index + 1)
    return { date, dayNumber: index + 1, entry: entriesByDate.get(date) }
  })
  return [...Array<null>(leadingBlanks).fill(null), ...dayCells, ...Array<null>(trailingBlanks).fill(null)]
})

function isFullyLogged(entry: ScheduleDay): boolean {
  return entry.countLogbooks === entry.countSchedules
}

function dayLabel({ date, entry }: DayCell): string {
  if (!entry) return formatDate(date)
  const logStatus = isFullyLogged(entry) ? 'all duties logged' : `${entry.remaining} remaining`
  return `${formatDate(date)}, ${entry.dutyType} ${entry.baseName}, ${logStatus}`
}
</script>

<template>
  <div class="calendar">
    <div
      v-for="weekday in WEEKDAYS"
      :key="weekday"
      class="calendar__weekday"
      aria-hidden="true"
    >
      {{ weekday }}
    </div>
    <template
      v-for="(cell, index) in cells"
      :key="cell?.date ?? `blank-${index}`"
    >
      <NuxtLink
        v-if="cell"
        :to="`/schedule/${cell.date}`"
        class="calendar__day"
        :class="{ 'calendar__day--light-text': cell.entry && needsLightText(cell.entry.baseColor) }"
        :style="cell.entry ? { background: cell.entry.baseColor } : undefined"
        :aria-label="dayLabel(cell)"
      >
        <span
          v-if="cell.entry"
          class="calendar__indicator"
        >
          <Check
            v-if="isFullyLogged(cell.entry)"
            :size="11"
            :stroke-width="3"
            aria-hidden="true"
          />
          <template v-else>{{ cell.entry.remaining }}</template>
        </span>
        <span class="calendar__number">{{ cell.dayNumber }}</span>
        <span class="calendar__base">{{ cell.entry?.baseName }}</span>
      </NuxtLink>
      <div
        v-else
        aria-hidden="true"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.calendar {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  padding: 12px 8px;
  background: $color-surface;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.calendar__weekday {
  padding-bottom: 4px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  color: $color-text-secondary;
}

.calendar__day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  height: 56px;
  padding-bottom: 7px;
  color: $color-text-primary;
  text-decoration: none;
  background: $color-background;
  border-radius: 10px;
}

.calendar__day--light-text {
  color: $color-surface;
}

.calendar__number {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.calendar__indicator {
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  font-size: 10px;
  font-weight: 700;
  color: $color-navy;
  background: $color-surface;
  border-radius: $radius-pill;
}

.calendar__base {
  min-height: 10px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.02em;
}
</style>
