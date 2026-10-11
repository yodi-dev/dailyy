<script setup>
import { ref } from 'vue'
import { Plus, Clock, Sparkles, Check, ChevronDown, ChevronUp } from '@lucide/vue'

const props = defineProps({
  frequentSuggestions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-log'])

const title = ref('')
const note = ref('')
const showCustomTime = ref(false)
const customDateTime = ref('')
const showSuccessBanner = ref(false)
const lastAddedTitle = ref('')

// Initialize customDateTime with local ISO string (YYYY-MM-DDTHH:mm)
const getLocalDateTimeString = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16)
  return localISOTime
}

const handleQuickPick = (suggestion) => {
  title.value = suggestion
  handleSubmit()
}

const handleSubmit = () => {
  if (!title.value.trim()) return

  const timestampToSave = showCustomTime.value && customDateTime.value ? customDateTime.value : null

  emit('add-log', {
    title: title.value,
    timestamp: timestampToSave,
    note: note.value
  })

  lastAddedTitle.value = title.value.trim()
  title.value = ''
  note.value = ''
  showCustomTime.value = false
  customDateTime.value = ''

  // Flash success indicator
  showSuccessBanner.value = true
  setTimeout(() => {
    showSuccessBanner.value = false
  }, 2200)
}
</script>

<template>
  <div class="bg-app-card backdrop-blur-md border border-app-border rounded-2xl p-4 shadow-xl mb-6 transition-all">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold">
          <Sparkles class="w-4 h-4" />
        </div>
        <h2 class="text-base font-semibold text-app-text">Catat Kegiatan Baru</h2>
      </div>
      <button
        type="button"
        @click="showCustomTime = !showCustomTime; if (showCustomTime && !customDateTime) customDateTime = getLocalDateTimeString()"
        class="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-app-border-subtle text-app-muted hover:text-primary hover:border-primary-border active:scale-95 transition-all cursor-pointer"
      >
        <Clock class="w-3.5 h-3.5" />
        <span>{{ showCustomTime ? 'Atur Waktu' : 'Waktu Sekarang' }}</span>
        <component :is="showCustomTime ? ChevronUp : ChevronDown" class="w-3 h-3 ml-0.5" />
      </button>
    </div>

    <!-- Main Input Form -->
    <form @submit.prevent="handleSubmit" class="space-y-3">
      <div class="relative flex items-center">
        <input
          v-model="title"
          type="text"
          placeholder="Misal: Nyuci baju, Jogging, Baca buku..."
          aria-label="Nama aktivitas atau kegiatan"
          class="w-full bg-app-surface border border-app-border-subtle rounded-xl px-4 py-3 text-app-text placeholder:text-app-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base pr-24 sm:pr-28 transition-all"
        />
        <button
          type="submit"
          :disabled="!title.trim()"
          class="absolute right-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:hover:bg-primary text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-primary-glow active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus class="w-4 h-4" />
          <span>Simpan</span>
        </button>
      </div>

      <!-- Optional Custom Date Time Picker -->
      <div v-if="showCustomTime" class="p-3 bg-app-subtle/70 rounded-xl border border-app-border space-y-2">
        <label class="block text-xs font-medium text-app-muted">Pilih Tanggal & Waktu Kegiatan:</label>
        <input
          v-model="customDateTime"
          type="datetime-local"
          class="w-full bg-app-surface border border-app-border-subtle rounded-lg px-3 py-2 text-base sm:text-sm text-app-text focus:outline-none focus:border-primary"
        />
        <input
          v-model="note"
          type="text"
          placeholder="Catatan tambahan (opsional)..."
          class="w-full bg-app-surface border border-app-border-subtle rounded-lg px-3 py-2 text-base sm:text-sm text-app-text placeholder:text-app-muted/60 focus:outline-none focus:border-primary"
        />
      </div>
    </form>

    <!-- Quick Chips / Frequent Suggestions -->
    <div v-if="frequentSuggestions && frequentSuggestions.length" class="mt-3 pt-3 border-t border-app-border-subtle">
      <div class="flex items-center gap-1.5 text-xs text-app-muted mb-2">
        <span>Pilihan cepat:</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in frequentSuggestions"
          :key="item"
          type="button"
          @click="handleQuickPick(item)"
          class="text-xs bg-app-subtle hover:bg-app-surface text-app-text px-3 py-1.5 rounded-full border border-app-border-subtle flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <span>{{ item }}</span>
          <Plus class="w-3 h-3 text-primary" />
        </button>
      </div>
    </div>

    <!-- Success Toast Notification -->
    <div
      v-if="showSuccessBanner"
      class="mt-3 py-2 px-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-fade-in"
    >
      <Check class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>Berhasil mencatat <strong>"{{ lastAddedTitle }}"</strong>!</span>
    </div>
  </div>
</template>

