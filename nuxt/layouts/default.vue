<template>
  <div>
    <main class="page-content">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style lang="scss" scoped>
.page-content {
  padding: $page-padding;
  padding-bottom: $bottom-nav-height + $page-padding;
}
</style>
