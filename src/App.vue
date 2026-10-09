<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useActivityLogs } from './composables/useActivityLogs'
import QuickLogInput from './components/QuickLogInput.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'
import SummaryStats from './components/SummaryStats.vue'
import SettingsBackup from './components/SettingsBackup.vue'
import { CalendarCheck2, BarChart2, Settings, WifiOff, CheckCircle2, AlertCircle } from '@lucide/vue'

const {
  logs,
  groupedLogs,
  frequentSuggestions,
  weeklyStats,
  monthlyStats,
  addLog,
  updateLog,
  deleteLog,
  clearLogs,
  exportBackup,
  importBackup
} = useActivityLogs()

const activeTab = ref('timeline') // 'timeline' | 'stats' | 'settings'
const isOnline = ref(navigator.onLine)
const alertNotification = ref(null)

const setNotification = (message, type = 'success') => {
  alertNotification.value = { message, type }
  setTimeout(() => {
    alertNotification.value = null
  }, 3500)
}

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})

const handleAddLog = ({ title, timestamp, note }) => {
  addLog(title, timestamp, note)
}

const handleUpdateLog = ({ id, title, note }) => {
  updateLog(id, { title, note })
  setNotification('Catatan berhasil diperbarui!', 'success')
}

const handleDeleteLog = (id) => {
  deleteLog(id)
  setNotification('Catatan telah dihapus.', 'info')
}

const handleClearData = () => {
  clearLogs()
  setNotification('Semua catatan berhasil direset.', 'info')
}

const handleImportData = (jsonStr) => {
  const res = importBackup(jsonStr)
  if (res.success) {
    setNotification(`Berhasil memulihkan ${res.count} catatan aktivitas!`, 'success')
    activeTab.value = 'timeline'
  } else {
    setNotification(`Gagal import: ${res.error}`, 'error')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 sm:pb-8 selection:bg-indigo-500 selection:text-white">
    <!-- Top Header -->
    <header class="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div class="max-w-md mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <CalendarCheck2 class="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 class="text-sm font-bold text-white tracking-tight leading-tight">Dailyy</h1>
            <p class="text-[10px] text-slate-400">Log Harian Personal</p>
          </div>
        </div>

        <!-- Offline Status Pill -->
        <div v-if="!isOnline" class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-semibold">
          <WifiOff class="w-3 h-3" />
          <span>Offline</span>
        </div>
      </div>
    </header>

    <!-- Global Notification Banner -->
    <div
      v-if="alertNotification"
      class="max-w-md mx-auto w-full px-4 pt-3 transition-all animate-bounce-short"
    >
      <div
        :class="[
          'px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg border',
          alertNotification.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
            : alertNotification.type === 'error'
            ? 'bg-rose-950/90 border-rose-800 text-rose-200'
            : 'bg-slate-900 border-slate-700 text-slate-200'
        ]"
      >
        <component
          :is="alertNotification.type === 'success' ? CheckCircle2 : AlertCircle"
          class="w-4 h-4 shrink-0"
        />
        <span class="flex-1">{{ alertNotification.message }}</span>
      </div>
    </div>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-md mx-auto w-full px-4 pt-4">
      <!-- Tab 1: Timeline & Log Input -->
      <section v-if="activeTab === 'timeline'" class="space-y-4">
        <QuickLogInput
          :frequent-suggestions="frequentSuggestions"
          @add-log="handleAddLog"
        />
        <ActivityTimeline
          :grouped-logs="groupedLogs"
          @delete-log="handleDeleteLog"
          @update-log="handleUpdateLog"
        />
      </section>

      <!-- Tab 2: Weekly & Monthly Summary Stats -->
      <section v-else-if="activeTab === 'stats'">
        <SummaryStats
          :weekly-stats="weeklyStats"
          :monthly-stats="monthlyStats"
        />
      </section>

      <!-- Tab 3: Settings & Backup -->
      <section v-else-if="activeTab === 'settings'">
        <SettingsBackup
          :total-logs-count="logs.length"
          :is-online="isOnline"
          @export-data="exportBackup"
          @import-data="handleImportData"
          @clear-data="handleClearData"
        />
      </section>
    </main>

    <!-- Bottom Navigation Bar (Mobile Thumb-Zone Optimized for iOS) -->
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 pb-[env(safe-area-inset-bottom,0px)]">
      <div class="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        <!-- Tab 1: Catat -->
        <button
          type="button"
          @click="activeTab = 'timeline'"
          :class="[
            'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer',
            activeTab === 'timeline'
              ? 'text-indigo-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          ]"
        >
          <CalendarCheck2 class="w-5 h-5" />
          <span class="text-[11px]">Catat</span>
        </button>

        <!-- Tab 2: Ringkasan -->
        <button
          type="button"
          @click="activeTab = 'stats'"
          :class="[
            'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer',
            activeTab === 'stats'
              ? 'text-indigo-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          ]"
        >
          <BarChart2 class="w-5 h-5" />
          <span class="text-[11px]">Ringkasan</span>
        </button>

        <!-- Tab 3: Setelan -->
        <button
          type="button"
          @click="activeTab = 'settings'"
          :class="[
            'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer',
            activeTab === 'settings'
              ? 'text-indigo-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          ]"
        >
          <Settings class="w-5 h-5" />
          <span class="text-[11px]">Pengaturan</span>
        </button>
      </div>
    </nav>
  </div>
</template>
