<template>
  <div>
    <header class="app-header">
      <img
        class="app-header__logo"
        src="/susiair-logo.png"
        alt="Susi Air"
        width="240"
        height="60"
      >
    </header>
    <main class="page-content">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style lang="scss" scoped>
.app-header {
  padding: 12px $page-padding 0;
}

.app-header__logo {
  display: block;
  width: 112px;
  height: auto;
}

.page-content {
  padding: $page-padding;
  padding-bottom: $bottom-nav-height + $page-padding;
}
</style>
