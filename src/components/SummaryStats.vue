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
        <h2 class="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 class="w-5 h-5 text-indigo-400" />
          <span>Statistik & Ringkasan</span>
        </h2>
        <p class="text-xs text-slate-400">Pantau rutinitas dan frekuensi kegiatanmu</p>
      </div>

      <!-- Range Pills -->
      <div class="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
        <button
          type="button"
          @click="activeRange = 'week'"
          :class="[
            'text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer',
            activeRange === 'week'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
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
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          ]"
        >
          Sebulan
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!currentStats.breakdown || currentStats.breakdown.length === 0"
      class="text-center py-12 px-4 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800"
    >
      <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-800/60 text-slate-400 flex items-center justify-center">
        <Calendar class="w-6 h-6 text-slate-400" />
      </div>
      <h3 class="text-sm font-semibold text-slate-200 mb-1">Belum Ada Catatan di Rentang Ini</h3>
      <p class="text-xs text-slate-400 max-w-xs mx-auto">
        Catat kegiatan harianmu di tab Catat untuk melihat rekap dalam {{ rangeLabel }}.
      </p>
    </div>

    <!-- Stats Content -->
    <div v-else class="space-y-4">
      <!-- Highlight Card -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Total Log Card -->
        <div class="bg-gradient-to-br from-indigo-950/60 to-slate-900/90 border border-indigo-900/50 rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center gap-1.5 text-xs text-indigo-300 font-medium mb-1">
            <TrendingUp class="w-3.5 h-3.5" />
            <span>Total Catatan</span>
          </div>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-white">{{ currentStats.totalCount }}</span>
            <span class="text-xs text-slate-400">kegiatan</span>
          </div>
          <span class="text-[10px] text-slate-400 mt-2">{{ rangeLabel }}</span>
        </div>

        <!-- Top Activity Card -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-1">
            <Trophy class="w-3.5 h-3.5" />
            <span>Paling Sering</span>
          </div>
          <div v-if="topActivity" class="mt-2 min-w-0">
            <h4 class="text-sm font-bold text-white truncate">{{ topActivity.title }}</h4>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-2xl font-extrabold text-amber-300">{{ topActivity.count }}</span>
              <span class="text-xs text-slate-400">kali ({{ getPercentage(topActivity.count) }}%)</span>
            </div>
          </div>
          <span class="text-[10px] text-slate-400 mt-2">Rutinitas utama</span>
        </div>
      </div>

      <!-- Frequency Breakdown List -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
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
                <span class="w-5 h-5 rounded-md bg-slate-800 text-slate-400 text-[11px] font-bold flex items-center justify-center">
                  {{ idx + 1 }}
                </span>
                <span class="font-semibold text-slate-100">{{ item.title }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-indigo-400">{{ item.count }}x</span>
                <span class="text-slate-500 text-[11px]">({{ getPercentage(item.count) }}%)</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
              <div
                class="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${getBarWidthPercentage(item.count)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

