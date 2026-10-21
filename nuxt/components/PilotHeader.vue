<script setup lang="ts">
import type { PilotProfile } from '~/stores/home'

const props = defineProps<{ profile: PilotProfile }>()

const avatarFailed = ref(false)
const initials = computed(() =>
  props.profile.name
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
</script>

<template>
  <header class="pilot-header">
    <img
      v-if="!avatarFailed"
      class="pilot-header__avatar"
      :src="profile.avatarUrl"
      alt=""
      width="56"
      height="56"
      @error="avatarFailed = true"
    >
    <span
      v-else
      class="pilot-header__avatar pilot-header__initials"
      aria-hidden="true"
    >
      {{ initials }}
    </span>
    <div>
      <h1 class="pilot-header__greeting">
        Welcome back, {{ profile.name }}
      </h1>
      <p class="pilot-header__total">
        Total flight hours
        <strong class="pilot-header__hours">{{ formatHours(profile.totalFlightHours) }} h</strong>
      </p>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.pilot-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px $page-padding;
  color: $color-surface;
  background: $color-navy;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.pilot-header__avatar {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border: 2px solid $color-surface;
  border-radius: 50%;
}

.pilot-header__initials {
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 700;
  background: $color-brand-red;
}

.pilot-header__greeting {
  font-size: 18px;
  font-weight: 700;
}

.pilot-header__total {
  display: flex;
  flex-direction: column;
  margin-top: 4px;
  font-size: 13px;
  color: rgba($color-surface, 0.75);
}

.pilot-header__hours {
  font-size: 22px;
  color: $color-surface;
}
</style>
