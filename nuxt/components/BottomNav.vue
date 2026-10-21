<script setup lang="ts">
import { BookOpen, CalendarDays, House, Menu } from 'lucide-vue-next'

const route = useRoute()

const items = [
  { label: 'Home', to: '/', icon: House },
  { label: 'Schedule', to: '/schedule', icon: CalendarDays },
  { label: 'Logbook', to: '/logbook', icon: BookOpen },
  { label: 'More', to: '/more', icon: Menu },
]

function isActive(to: string): boolean {
  return route.path === to || (to !== '/' && route.path.startsWith(`${to}/`))
}
</script>

<template>
  <nav
    class="bottom-nav"
    aria-label="Main"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': isActive(item.to) }"
      :aria-current="isActive(item.to) ? 'page' : undefined"
    >
      <component
        :is="item.icon"
        :size="22"
        aria-hidden="true"
      />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style lang="scss" scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: $app-max-width;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  height: $bottom-nav-height;
  background: $color-surface;
  border-top: 1px solid $color-border;
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: $color-text-secondary;
  text-decoration: none;
}

.bottom-nav__item--active {
  color: $color-brand-red;
  font-weight: 700;
}
</style>
