<script setup lang="ts">
import { SUMMARY_RANGES, type SummaryRange } from '~/stores/home'

defineProps<{ selected: SummaryRange }>()
defineEmits<{ select: [range: SummaryRange] }>()
</script>

<template>
  <div
    class="range-toggle"
    role="group"
    aria-label="Chart range"
  >
    <button
      v-for="range in SUMMARY_RANGES"
      :key="range"
      class="range-toggle__pill"
      :class="{ 'range-toggle__pill--active': range === selected }"
      type="button"
      :aria-pressed="range === selected"
      @click="$emit('select', range)"
    >
      {{ range }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.range-toggle {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  padding: 4px;
  background: $color-surface;
  border-radius: $radius-pill;
  box-shadow: $shadow-card;
}

.range-toggle__pill {
  height: 32px;
  font-size: 13px;
  font-weight: 600;
  color: $color-text-secondary;
  background: transparent;
  border: none;
  border-radius: $radius-pill;
  cursor: pointer;
}

.range-toggle__pill--active {
  color: $color-surface;
  background: $color-navy;
}
</style>
