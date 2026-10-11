<script setup>
import { ref, computed } from 'vue'
import { BarChart3, TrendingUp, Calendar, Trophy, Sparkles } from '@lucide/vue'

const props = defineProps({
  weeklyStats: {
    type: Object,
    required: true
  },
  monthlyStats: {
    type: Object,
    required: true
  }
})

const activeRange = ref('week') // 'week' or 'month'

const currentStats = computed(() => {
  return activeRange.value === 'week' ? props.weeklyStats : props.monthlyStats
})

const rangeLabel = computed(() => {
  return activeRange.value === 'week' ? '7 Hari Terakhir' : '30 Hari Terakhir'
})

const topActivity = computed(() => {
  if (!currentStats.value.breakdown || currentStats.value.breakdown.length === 0) return null
  return currentStats.value.breakdown[0]
})

const maxCount = computed(() => {
  if (!topActivity.value || !topActivity.value.count) return 1
  return topActivity.value.count
})

const getPercentage = (count) => {
  if (!currentStats.value.totalCount) return 0
  return Math.round((count / currentStats.value.totalCount) * 100)
}

const getBarWidthPercentage = (count) => {
  if (!maxCount.value) return 0
  return Math.round((count / maxCount.value) * 100)
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header & Range Switcher -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-bold text-app-text flex items-center gap-2">
          <BarChart3 class="w-5 h-5 text-primary" />
          <span>Statistik & Ringkasan</span>
        </h2>
        <p class="text-xs text-app-muted">Pantau rutinitas dan frekuensi kegiatanmu</p>
      </div>

      <!-- Range Pills -->
      <div class="flex items-center bg-app-card border border-app-border p-1 rounded-xl">
        <button
          type="button"
          @click="activeRange = 'week'"
          :class="[
            'text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer',
            activeRange === 'week'
              ? 'bg-primary text-white shadow-primary-glow font-semibold'
              : 'text-app-muted hover:text-app-text'
          ]"
        >
          Seminggu
        </button>
        <button
          type="button"
          @click="activeRange = 'month'"
          :class="[
            'text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer',
            activeRange === 'month'
              ? 'bg-primary text-white shadow-primary-glow font-semibold'
              : 'text-app-muted hover:text-app-text'
          ]"
        >
          Sebulan
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!currentStats.breakdown || currentStats.breakdown.length === 0"
      class="text-center py-12 px-4 bg-app-card rounded-2xl border border-dashed border-app-border"
    >
      <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-app-subtle text-app-muted flex items-center justify-center">
        <Calendar class="w-6 h-6 text-app-muted" />
      </div>
      <h3 class="text-sm font-semibold text-app-text mb-1">Belum Ada Catatan di Rentang Ini</h3>
      <p class="text-xs text-app-muted max-w-xs mx-auto">
        Catat kegiatan harianmu di tab Catat untuk melihat rekap dalam {{ rangeLabel }}.
      </p>
    </div>

    <!-- Stats Content -->
    <div v-else class="space-y-4">
      <!-- Highlight Card -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Total Log Card -->
        <div class="bg-app-card border border-app-border rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div class="flex items-center gap-1.5 text-xs text-primary font-semibold mb-1">
            <TrendingUp class="w-3.5 h-3.5" />
            <span>Total Catatan</span>
          </div>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-app-text">{{ currentStats.totalCount }}</span>
            <span class="text-xs text-app-muted">kegiatan</span>
          </div>
          <span class="text-[10px] text-app-muted mt-2">{{ rangeLabel }}</span>
        </div>

        <!-- Top Activity Card -->
        <div class="bg-app-card border border-app-border rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div class="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400 font-semibold mb-1">
            <Trophy class="w-3.5 h-3.5" />
            <span>Paling Sering</span>
          </div>
          <div v-if="topActivity" class="mt-2 min-w-0">
            <h4 class="text-sm font-bold text-app-text truncate">{{ topActivity.title }}</h4>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-2xl font-extrabold text-amber-500 dark:text-amber-300">{{ topActivity.count }}</span>
              <span class="text-xs text-app-muted">kali ({{ getPercentage(topActivity.count) }}%)</span>
            </div>
          </div>
          <span class="text-[10px] text-app-muted mt-2">Rutinitas utama</span>
        </div>
      </div>

      <!-- Frequency Breakdown List -->
      <div class="bg-app-card border border-app-border rounded-2xl p-4 shadow-xs">
        <h3 class="text-xs font-bold text-app-text uppercase tracking-wider mb-3">
          Frekuensi Kegiatan ({{ rangeLabel }})
        </h3>

        <div class="space-y-3">
          <div
            v-for="(item, idx) in currentStats.breakdown"
            :key="item.title"
            class="space-y-1.5"
          >
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-md bg-app-subtle text-app-muted text-[11px] font-bold flex items-center justify-center border border-app-border-subtle">
                  {{ idx + 1 }}
                </span>
                <span class="font-semibold text-app-text">{{ item.title }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-primary">{{ item.count }}x</span>
                <span class="text-app-muted text-[11px]">({{ getPercentage(item.count) }}%)</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-app-subtle rounded-full h-2 overflow-hidden border border-app-border-subtle">
              <div
                class="bg-primary-gradient h-2 rounded-full transition-all duration-500"
                :style="{ width: `${getBarWidthPercentage(item.count)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

