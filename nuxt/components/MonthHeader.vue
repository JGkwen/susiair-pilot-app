<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  label: string
  canGoPrevious: boolean
  canGoNext: boolean
}>()
defineEmits<{ previous: [], next: [] }>()
</script>

<template>
  <div class="month-header">
    <button
      class="month-header__button"
      type="button"
      aria-label="Previous month"
      :disabled="!canGoPrevious"
      @click="$emit('previous')"
    >
      <ChevronLeft
        :size="20"
        aria-hidden="true"
      />
    </button>
    <h1
      class="month-header__label"
      aria-live="polite"
    >
      {{ label }}
    </h1>
    <button
      class="month-header__button"
      type="button"
      aria-label="Next month"
      :disabled="!canGoNext"
      @click="$emit('next')"
    >
      <ChevronRight
        :size="20"
        aria-hidden="true"
      />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.month-header__label {
  font-size: 18px;
  font-weight: 700;
}

.month-header__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: $color-navy;
  background: $color-surface;
  border: none;
  border-radius: $radius-pill;
  box-shadow: $shadow-card;
  cursor: pointer;

  &:disabled {
    color: $color-text-secondary;
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>
