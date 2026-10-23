<script setup lang="ts">
import type { LegendItem } from '~/stores/schedule'

defineProps<{ items: LegendItem[] }>()
</script>

<template>
  <ul class="legend">
    <li
      v-for="item in items"
      :key="item.code"
      class="legend__item"
    >
      <span
        class="legend__swatch"
        :style="{ background: item.color }"
        aria-hidden="true"
      />
      <span class="legend__label"><span class="legend__code">{{ item.code }}</span> {{ item.label }}</span>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.legend {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
  margin: 0;
  padding: 14px $page-padding;
  list-style: none;
  background: $color-surface;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.legend__item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  line-height: 18px;
}

.legend__swatch {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-top: 2px;
  border-radius: 4px;
}

.legend__code {
  font-weight: 700;
  color: $color-text-primary;
}

.legend__label {
  color: $color-text-secondary;
}
</style>
