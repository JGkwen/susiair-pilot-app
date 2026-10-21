<script setup lang="ts">
import type { LimitCard } from '~/stores/home'

const props = defineProps<{ card: LimitCard }>()

const usage = computed(() => props.card.current / props.card.limit)
const level = computed(() => {
  if (usage.value > 1) return 'danger'
  if (usage.value >= 0.8) return 'warning'
  return 'success'
})
const barWidth = computed(() => `${Math.min(usage.value, 1) * 100}%`)
</script>

<template>
  <article class="limit-card">
    <h3 class="limit-card__label">
      {{ card.label }}
    </h3>
    <p class="limit-card__value">
      <strong class="limit-card__current">{{ formatHours(card.current) }}</strong>
      / {{ formatHours(card.limit) }} h
    </p>
    <div
      class="limit-card__track"
      aria-hidden="true"
    >
      <div
        class="limit-card__bar"
        :class="`limit-card__bar--${level}`"
        :style="{ width: barWidth }"
      />
    </div>
  </article>
</template>

<style lang="scss" scoped>
.limit-card {
  padding: 14px;
  background: $color-surface;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.limit-card__label {
  font-size: 13px;
  font-weight: 600;
  color: $color-text-secondary;
}

.limit-card__value {
  margin-top: 4px;
  font-size: 13px;
  color: $color-text-secondary;
}

.limit-card__current {
  font-size: 20px;
  color: $color-text-primary;
}

.limit-card__track {
  height: 6px;
  margin-top: 10px;
  overflow: hidden;
  background: $color-background;
  border-radius: $radius-pill;
}

.limit-card__bar {
  height: 100%;
  border-radius: $radius-pill;
}

.limit-card__bar--success {
  background: $color-success;
}

.limit-card__bar--warning {
  background: $color-warning;
}

.limit-card__bar--danger {
  background: $color-danger;
}
</style>
