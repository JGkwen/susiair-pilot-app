<script setup lang="ts">
defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="error-state"
    role="alert"
  >
    <p class="error-state__message">
      {{ message }}
    </p>
    <button
      class="error-state__button"
      type="button"
      @click="$emit('retry')"
    >
      Retry
    </button>
  </div>
</template>

<style lang="scss" scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px $page-padding;
  text-align: center;
  background: $color-surface;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.error-state__message {
  font-size: 14px;
  color: $color-danger;
}

.error-state__button {
  height: 36px;
  padding: 0 20px;
  font-weight: 700;
  color: $color-brand-red;
  background: transparent;
  border: 1px solid $color-brand-red;
  border-radius: $radius-pill;
  cursor: pointer;
}
</style>
