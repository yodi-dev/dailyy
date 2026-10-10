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
  <div class="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl mb-6 transition-all">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
          <Sparkles class="w-4 h-4" />
        </div>
        <h2 class="text-base font-semibold text-white">Catat Kegiatan Baru</h2>
      </div>
      <button
        type="button"
        @click="showCustomTime = !showCustomTime; if (showCustomTime && !customDateTime) customDateTime = getLocalDateTimeString()"
        class="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 active:scale-95 transition-all"
      >
        <Clock class="w-3.5 h-3.5" />
        <span>{{ showCustomTime ? 'Waktu Custom' : 'Waktu Sekarang' }}</span>
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
          class="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm md:text-base pr-28 transition-all"
        />
        <button
          type="submit"
          :disabled="!title.trim()"
          class="absolute right-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus class="w-4 h-4" />
          <span>Simpan</span>
        </button>
      </div>

      <!-- Optional Custom Date Time Picker -->
      <div v-if="showCustomTime" class="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
        <label class="block text-xs font-medium text-slate-400">Pilih Tanggal & Waktu Kegiatan:</label>
        <input
          v-model="customDateTime"
          type="datetime-local"
          class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <input
          v-model="note"
          type="text"
          placeholder="Catatan tambahan (opsional)..."
          class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </form>

    <!-- Quick Chips / Frequent Suggestions -->
    <div v-if="frequentSuggestions && frequentSuggestions.length" class="mt-3 pt-3 border-t border-slate-800/80">
      <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
        <span>Klik cepat:</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in frequentSuggestions"
          :key="item"
          type="button"
          @click="handleQuickPick(item)"
          class="text-xs bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-700/60 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <span>{{ item }}</span>
          <Plus class="w-3 h-3 text-indigo-400" />
        </button>
      </div>
    </div>

    <!-- Success Toast Notification -->
    <div
      v-if="showSuccessBanner"
      class="mt-3 py-2 px-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in"
    >
      <Check class="w-4 h-4 text-emerald-400 shrink-0" />
      <span>Berhasil mencatat <strong>"{{ lastAddedTitle }}"</strong>!</span>
    </div>
  </div>
</template>

