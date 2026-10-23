<script setup lang="ts">
useHead({ title: 'Schedule' })

const schedule = useScheduleStore()

onMounted(schedule.fetchMonth)
</script>

<template>
  <div class="schedule">
    <MonthHeader
      v-if="schedule.current"
      :label="formatMonth(schedule.current.year, schedule.current.month)"
      :can-go-previous="schedule.canGoPrevious"
      :can-go-next="schedule.canGoNext"
      @previous="schedule.changeMonth(-1)"
      @next="schedule.changeMonth(1)"
    />

    <div
      v-if="schedule.loading"
      class="skeleton schedule__calendar-skeleton"
    />
    <ErrorState
      v-else-if="schedule.error"
      :message="schedule.error"
      @retry="schedule.fetchMonth"
    />
    <template v-else-if="schedule.current">
      <ScheduleCalendar
        :year="schedule.current.year"
        :month="schedule.current.month"
        :days="schedule.days"
      />
      <p
        v-if="!schedule.days.length"
        class="schedule__empty"
      >
        No duties scheduled this month.
      </p>
    </template>

    <section
      v-if="schedule.legend.length"
      class="schedule__section"
    >
      <h2 class="schedule__title">
        Legend
      </h2>
      <ScheduleLegend :items="schedule.legend" />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.schedule {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule__title {
  font-size: 17px;
  font-weight: 700;
}

.schedule__empty {
  padding: 20px $page-padding;
  text-align: center;
  color: $color-text-secondary;
  background: $color-surface;
  border-radius: $radius-card;
}

.schedule__calendar-skeleton {
  height: 410px;
}
</style>
