<script setup lang="ts">
import type { DocumentStatus, PilotDocument } from '~/stores/home'

defineProps<{ documents: PilotDocument[] }>()

const STATUS_LABELS: Record<DocumentStatus, string> = {
  safe: 'Valid',
  soon: 'Expiring soon',
  expired: 'Expired',
}
</script>

<template>
  <ul class="document-list">
    <li
      v-for="item in documents"
      :key="item.id"
      class="document-list__item"
    >
      <div>
        <p class="document-list__name">
          {{ item.name }}
        </p>
        <p class="document-list__expiry">
          Expiry {{ formatDate(item.expiryDate) }}
        </p>
      </div>
      <span
        class="document-list__badge"
        :class="`document-list__badge--${item.status}`"
      >
        {{ STATUS_LABELS[item.status] }}
      </span>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.document-list {
  margin: 0;
  padding: 0;
  list-style: none;
  background: $color-surface;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.document-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px $page-padding;

  & + & {
    border-top: 1px solid $color-border;
  }
}

.document-list__name {
  font-size: 15px;
  font-weight: 600;
}

.document-list__expiry {
  margin-top: 2px;
  font-size: 13px;
  color: $color-text-secondary;
}

.document-list__badge {
  flex-shrink: 0;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  border-radius: $radius-pill;
}

.document-list__badge--safe {
  background: rgba($color-success, 0.18);
}

.document-list__badge--soon {
  background: rgba($color-warning, 0.22);
}

.document-list__badge--expired {
  background: rgba($color-danger, 0.16);
}
</style>
