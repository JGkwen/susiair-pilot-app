<script setup lang="ts">
const props = defineProps<{ title: string }>()

useHead({ title: props.title })
</script>

<template>
  <section class="coming-soon">
    <h1 class="coming-soon__title">
      {{ title }}
    </h1>
    <p class="coming-soon__text">
      Coming soon
    </p>
  </section>
</template>

<style lang="scss" scoped>
.coming-soon {
  padding: 32px $page-padding;
  text-align: center;
  background: $color-surface;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.coming-soon__title {
  font-size: 20px;
  font-weight: 700;
}

.coming-soon__text {
  margin-top: 8px;
  color: $color-text-secondary;
}
</style>
