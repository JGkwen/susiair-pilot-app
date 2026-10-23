<script setup lang="ts">
import type { FlightHoursSummary } from '~/stores/home'

const props = defineProps<{ summary: FlightHoursSummary }>()

const WIDTH = 300
const HEIGHT = 196
const TOP = 36
const RIGHT = 12
const BOTTOM = 24
const LEFT = 36
const Y_STEPS = 5
const PLOT_WIDTH = WIDTH - LEFT - RIGHT
const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM

function yFor(hours: number): number {
  return TOP + PLOT_HEIGHT * (1 - Math.min(hours, props.summary.yMax) / props.summary.yMax)
}

function toPolyline(linePoints: { x: number, y: number }[]): string {
  return linePoints.map(point => `${point.x},${point.y}`).join(' ')
}

const step = computed(() => PLOT_WIDTH / (props.summary.points.length - 1))

const points = computed(() =>
  props.summary.points.map((point, index) => ({
    ...point,
    x: LEFT + index * step.value,
    y: yFor(point.rollingSum),
    day: Number(point.date.slice(8)),
    isToday: point.date === props.summary.asOf,
    isClamped: point.rollingSum > props.summary.yMax,
    clampLabelY: index % 2 === 0 ? TOP - 5 : TOP - 14,
  })),
)

const todayIndex = computed(() => points.value.findIndex(point => point.isToday))
const today = computed(() => points.value.find(point => point.isToday))
const pastLine = computed(() => toPolyline(points.value.slice(0, todayIndex.value + 1)))
const futureLine = computed(() => toPolyline(points.value.slice(todayIndex.value)))
const limitY = computed(() => yFor(props.summary.limit))

const yTicks = computed(() =>
  Array.from({ length: Y_STEPS + 1 }, (_, index) => {
    const hours = (props.summary.yMax * index) / Y_STEPS
    return { hours, y: yFor(hours) }
  }),
)

const description = computed(() => {
  const values = props.summary.points
    .map(point => `${formatDate(point.date)} ${formatHours(point.rollingSum)} h`)
    .join(', ')
  return `Rolling ${props.summary.windowDays}-day flight hours, limit ${formatHours(props.summary.limit)} h, today ${formatDate(props.summary.asOf)}: ${values}.`
})
</script>

<template>
  <svg
    class="chart"
    :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
    role="img"
    :aria-label="description"
  >
    <rect
      v-if="today"
      class="chart__today-band"
      :x="today.x - step / 2"
      :y="TOP"
      :width="step"
      :height="PLOT_HEIGHT"
    />
    <text
      v-if="today"
      class="chart__today-label"
      :x="today.x"
      y="10"
      text-anchor="middle"
    >
      Today
    </text>
    <g
      v-for="tick in yTicks"
      :key="tick.hours"
    >
      <line
        class="chart__grid"
        :x1="LEFT"
        :x2="WIDTH - RIGHT"
        :y1="tick.y"
        :y2="tick.y"
      />
      <text
        class="chart__y-label"
        :x="LEFT - 6"
        :y="tick.y"
        text-anchor="end"
        dominant-baseline="middle"
      >
        {{ formatHours(tick.hours) }}
      </text>
    </g>
    <line
      class="chart__limit"
      :x1="LEFT"
      :x2="WIDTH - RIGHT"
      :y1="limitY"
      :y2="limitY"
    />
    <text
      class="chart__limit-label"
      :x="WIDTH - RIGHT"
      :y="limitY - 4"
      text-anchor="end"
    >
      Limit {{ formatHours(summary.limit) }}
    </text>
    <polyline
      class="chart__line"
      :points="pastLine"
    />
    <polyline
      class="chart__line chart__line--future"
      :points="futureLine"
    />
    <g
      v-for="point in points"
      :key="point.date"
      :class="{ 'chart__day--future': point.isFuture }"
    >
      <title>{{ formatDate(point.date) }}: {{ formatHours(point.rollingSum) }} h</title>
      <template v-if="point.isClamped">
        <path
          class="chart__clamp-marker"
          :d="`M${point.x - 4} ${TOP + 6} L${point.x} ${TOP} L${point.x + 4} ${TOP + 6} Z`"
        />
        <text
          class="chart__clamp-label"
          :x="point.x"
          :y="point.clampLabelY"
          text-anchor="middle"
        >
          {{ formatHours(point.rollingSum) }}
        </text>
      </template>
      <circle
        v-else
        class="chart__point"
        :class="{ 'chart__point--today': point.isToday }"
        :cx="point.x"
        :cy="point.y"
        :r="point.isToday ? 5 : 3"
      />
      <text
        class="chart__x-label"
        :class="{ 'chart__x-label--today': point.isToday }"
        :x="point.x"
        :y="HEIGHT - 8"
        text-anchor="middle"
      >
        {{ point.day }}
      </text>
    </g>
  </svg>
</template>

<style lang="scss" scoped>
.chart {
  display: block;
  width: 100%;
  height: auto;
  font-size: 9px;
}

.chart__today-band {
  fill: rgba($color-chart-accent, 0.12);
}

.chart__today-label {
  font-weight: 700;
  fill: $color-navy;
}

.chart__grid {
  stroke: $color-border;
  stroke-width: 1;
}

.chart__y-label,
.chart__x-label {
  fill: $color-text-secondary;
}

.chart__x-label--today {
  font-weight: 700;
  fill: $color-navy;
}

.chart__limit {
  stroke: $color-danger;
  stroke-width: 1.5;
}

.chart__limit-label,
.chart__clamp-label {
  font-weight: 700;
  fill: $color-danger;
  paint-order: stroke;
  stroke: $color-surface;
  stroke-width: 3px;
}

.chart__line {
  fill: none;
  stroke: $color-chart-accent;
  stroke-width: 2;
  stroke-linejoin: round;
}

.chart__line--future {
  stroke-dasharray: 4 4;
  opacity: 0.6;
}

.chart__day--future :is(.chart__point, .chart__clamp-marker) {
  opacity: 0.5;
}

.chart__point {
  fill: $color-chart-accent;
}

.chart__point--today {
  fill: $color-navy;
  stroke: $color-surface;
  stroke-width: 2;
}

.chart__clamp-marker {
  fill: $color-danger;
}
</style>
