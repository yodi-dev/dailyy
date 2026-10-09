<script setup>
import { ref } from 'vue'
import { Download, Upload, Trash2, Smartphone, ShieldCheck, Wifi, WifiOff, AlertTriangle, CheckCircle, Info } from '@lucide/vue'

const props = defineProps({
  totalLogsCount: {
    type: Number,
    default: 0
  },
  isOnline: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['export-data', 'import-data', 'clear-data'])

const fileInput = ref(null)
const importMessage = ref(null)
const showClearConfirm = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result
    if (typeof content === 'string') {
      emit('import-data', content)
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div>
      <h2 class="text-base font-bold text-white flex items-center gap-2">
        <ShieldCheck class="w-5 h-5 text-indigo-400" />
        <span>Pengaturan & Proteksi Data</span>
      </h2>
      <p class="text-xs text-slate-400">Kelola data offline dan backup berkala</p>
    </div>

    <!-- PWA Status & Info Card -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-300">Status Jaringan:</span>
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
             :class="isOnline ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'">
          <component :is="isOnline ? Wifi : WifiOff" class="w-3.5 h-3.5" />
          <span>{{ isOnline ? 'Tersambung (Online)' : 'Mode Pesawat (Offline Siap)' }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span class="text-slate-400">Total Catatan di HP:</span>
        <span class="font-mono font-bold text-white">{{ totalLogsCount }} log</span>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span class="text-slate-400">Penyimpanan:</span>
        <span class="text-slate-300 font-medium">Lokal HP (IndexedDB / LocalStorage)</span>
      </div>
    </div>

    <!-- Backup & Restore Actions -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
      <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Backup & Pulihkan</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <!-- Export Button -->
        <button
          type="button"
          @click="emit('export-data')"
          class="w-full py-2.5 px-3 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Download class="w-4 h-4" />
          <span>Export Backup (JSON)</span>
        </button>

        <!-- Import Button -->
        <button
          type="button"
          @click="triggerFileInput"
          class="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700/80 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <Upload class="w-4 h-4 text-indigo-400" />
          <span>Import Data Backup</span>
        </button>

        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          class="hidden"
          @change="handleFileChange"
        />
      </div>

      <p class="text-[11px] text-slate-400 leading-relaxed pt-1">
        💡 <strong>Tips:</strong> Lakukan Export Backup secara berkala jika kamu berencana membersihkan cache browser di iPhone.
      </p>
    </div>

    <!-- iPhone 8 PWA Installation Guide -->
    <div class="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-4 space-y-2.5">
      <div class="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
        <Smartphone class="w-4 h-4" />
        <span>Cara Pasang di iPhone 8 (iOS 16)</span>
      </div>
      <ol class="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
        <li>Buka link aplikasi ini di browser <strong>Safari</strong> iPhone.</li>
        <li>Tekan tombol <strong>Share</strong> (ikon kotak dengan panah ke atas di bagian bawah Safari).</li>
        <li>Scroll ke bawah lalu pilih menu <strong>"Add to Home Screen"</strong> (*Tambahkan ke Layar Utama*).</li>
        <li>Ikon <strong>AktivitasKu</strong> akan muncul di homescreen dan bisa dibuka tanpa internet!</li>
      </ol>
    </div>

    <!-- Danger Zone: Reset Data -->
    <div class="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-4 space-y-2.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-rose-400 text-xs font-bold">
          <AlertTriangle class="w-4 h-4" />
          <span>Hapus Semua Data</span>
        </div>
      </div>

      <p class="text-[11px] text-slate-400">
        Menghapus seluruh riwayat aktivitas yang tersimpan di perangkat ini. Tindakan ini tidak dapat dibatalkan.
      </p>

      <div v-if="!showClearConfirm">
        <button
          type="button"
          @click="showClearConfirm = true"
          class="px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold active:scale-95 transition-all cursor-pointer"
        >
          Reset Seluruh Catatan
        </button>
      </div>

      <div v-else class="flex items-center gap-2 pt-1">
        <button
          type="button"
          @click="emit('clear-data'); showClearConfirm = false"
          class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold active:scale-95 transition-all cursor-pointer"
        >
          Yakin, Hapus Semua
        </button>
        <button
          type="button"
          @click="showClearConfirm = false"
          class="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  </div>
</template>

