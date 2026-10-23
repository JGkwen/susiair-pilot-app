<script setup lang="ts">
useHead({ titleTemplate: title => (title ? `${title} · Susi Air Pilot` : 'Susi Air Pilot') })
</script>

<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  max-width: $app-max-width;
  min-height: 100vh;
  margin: 0 auto;

  @media (min-width: $app-max-width) {
    box-shadow: 0 0 0 1px $color-border;
  }
}
</style>
