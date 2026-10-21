<script setup lang="ts">
definePageMeta({ layout: false })

const auth = useAuthStore()
const username = ref('')
const password = ref('')
</script>

<template>
  <main class="sign-in">
    <img
      class="sign-in__logo"
      src="/susiair-logo.png"
      alt="Susi Air"
      width="240"
      height="60"
    >
    <h1 class="sign-in__title">
      Pilot Sign In
    </h1>
    <form
      class="sign-in__form"
      @submit.prevent="auth.login(username, password)"
    >
      <label class="field">
        <span class="field__label">Username</span>
        <input
          v-model="username"
          class="field__input"
          name="username"
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
          required
        >
      </label>
      <label class="field">
        <span class="field__label">Password</span>
        <input
          v-model="password"
          class="field__input"
          type="password"
          name="password"
          autocomplete="current-password"
          required
        >
      </label>
      <p
        v-if="auth.error"
        class="sign-in__error"
        role="alert"
      >
        {{ auth.error }}
      </p>
      <button
        class="sign-in__button"
        type="submit"
        :disabled="auth.loading"
      >
        {{ auth.loading ? 'Signing in…' : 'Sign In' }}
      </button>
    </form>
  </main>
</template>

<style lang="scss" scoped>
.sign-in {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
  padding: 32px $page-padding;
}

.sign-in__logo {
  align-self: center;
  width: 180px;
  height: auto;
}

.sign-in__title {
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}

.sign-in__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px $page-padding;
  background: $color-surface;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 14px;
  font-weight: 600;
}

.field__input {
  height: 48px;
  padding: 0 14px;
  color: $color-text-primary;
  border: 1px solid $color-border;
  border-radius: 10px;

  &:focus-visible {
    border-color: $color-chart-accent;
  }
}

.sign-in__error {
  padding: 10px 12px;
  font-size: 14px;
  color: $color-danger;
  background: rgba($color-danger, 0.08);
  border-radius: 10px;
}

.sign-in__button {
  height: 48px;
  font-weight: 700;
  color: $color-surface;
  background: $color-brand-red;
  border: none;
  border-radius: $radius-pill;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: progress;
  }
}
</style>
