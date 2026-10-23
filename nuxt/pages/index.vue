<script setup lang="ts">
useHead({ title: 'Home' })

const home = useHomeStore()

onMounted(home.loadAll)
</script>

<template>
  <div class="home">
    <PilotHeader
      v-if="home.profile.data"
      :profile="home.profile.data"
    />
    <ErrorState
      v-else-if="home.profile.error"
      :message="home.profile.error"
      @retry="home.fetchProfile"
    />
    <div
      v-else
      class="skeleton home__header-skeleton"
    />

    <section class="home__section">
      <h2 class="home__title">
        Hours to Limit
      </h2>
      <div
        v-if="home.cards"
        class="home__cards"
      >
        <LimitProgressCard
          v-for="card in home.cards"
          :key="card.key"
          :card="card"
        />
      </div>
      <div
        v-else-if="!home.summary.error"
        class="home__cards"
      >
        <div
          v-for="index in 4"
          :key="index"
          class="skeleton home__card-skeleton"
        />
      </div>
      <RangeToggle
        :selected="home.selectedRange"
        @select="home.selectRange"
      />
      <div
        v-if="home.summary.data"
        class="home__chart"
      >
        <FlightHoursChart :summary="home.summary.data" />
      </div>
      <ErrorState
        v-else-if="home.summary.error"
        :message="home.summary.error"
        @retry="home.fetchSummary(home.selectedRange)"
      />
      <div
        v-else
        class="skeleton home__chart-skeleton"
      />
    </section>

    <section class="home__section">
      <h2 class="home__title">
        My Documents
      </h2>
      <template v-if="home.documents.data">
        <DocumentList
          v-if="home.documents.data.items.length"
          :documents="home.documents.data.items"
        />
        <p
          v-else
          class="home__empty"
        >
          No documents found.
        </p>
      </template>
      <ErrorState
        v-else-if="home.documents.error"
        :message="home.documents.error"
        @retry="home.fetchDocuments"
      />
      <div
        v-else
        class="skeleton home__documents-skeleton"
      />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.home__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home__title {
  font-size: 17px;
  font-weight: 700;
}

.home__cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.home__chart {
  padding: 12px 8px 8px;
  background: $color-surface;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.home__empty {
  padding: 20px $page-padding;
  text-align: center;
  color: $color-text-secondary;
  background: $color-surface;
  border-radius: $radius-card;
}

.home__header-skeleton {
  height: 96px;
}

.home__card-skeleton {
  height: 84px;
}

.home__chart-skeleton {
  height: 220px;
}

.home__documents-skeleton {
  height: 240px;
}
</style>
