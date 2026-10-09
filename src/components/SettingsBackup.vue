<script setup>
import { ref } from 'vue'
import {
  Download,
  Upload,
  Trash2,
  Smartphone,
  ShieldCheck,
  Wifi,
  WifiOff,
  AlertTriangle,
  Cloud,
  CloudUpload,
  CloudDownload,
  Loader2,
  LogOut,
  CheckCircle2,
  RefreshCw
} from '@lucide/vue'

const props = defineProps({
  totalLogsCount: {
    type: Number,
    default: 0
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  gdriveConnected: {
    type: Boolean,
    default: false
  },
  gdriveUser: {
    type: Object,
    default: null
  },
  gdriveLastBackup: {
    type: String,
    default: ''
  },
  gdriveLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'export-data',
  'import-data',
  'clear-data',
  'gdrive-connect',
  'gdrive-disconnect',
  'gdrive-backup',
  'gdrive-restore'
])

const fileInput = ref(null)
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

const checkingUpdate = ref(false)
const checkForUpdates = async () => {
  checkingUpdate.value = true
  if (window.__dailyyUpdateSW) {
    try {
      await window.__dailyyUpdateSW(true)
    } catch (e) {
      console.warn('Update error:', e)
    }
  }
  setTimeout(() => {
    checkingUpdate.value = false
    window.location.reload()
  }, 700)
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div>
      <h2 class="text-base font-bold text-white flex items-center gap-2">
        <ShieldCheck class="w-5 h-5 text-indigo-400" />
        <span>Pengaturan & Cadangan Data</span>
      </h2>
      <p class="text-xs text-slate-400">Kelola data offline dan sinkronisasi cadangan</p>
    </div>

    <!-- Status Jaringan & Storage Info Card -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-300">Status Jaringan:</span>
        <div
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          :class="isOnline ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'"
        >
          <component :is="isOnline ? Wifi : WifiOff" class="w-3.5 h-3.5" />
          <span>{{ isOnline ? 'Tersambung (Online)' : 'Mode Pesawat (Offline Siap)' }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span class="text-slate-400">Total Catatan di HP:</span>
        <span class="font-mono font-bold text-white">{{ totalLogsCount }} log</span>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span class="text-slate-400">Penyimpanan Utama:</span>
        <span class="text-slate-300 font-medium">Lokal HP (Aman & Pribadi)</span>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span class="text-slate-400">Versi Aplikasi:</span>
        <button
          type="button"
          @click="checkForUpdates"
          :disabled="checkingUpdate"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-indigo-300 hover:text-white border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw :class="['w-3 h-3', checkingUpdate ? 'animate-spin' : '']" />
          <span>{{ checkingUpdate ? 'Memperbarui...' : 'Periksa Update' }}</span>
        </button>
      </div>
    </div>

    <!-- Google Drive Backup Section (Card Unggulan) -->
    <div class="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-2xl p-4 space-y-3.5 shadow-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Cloud class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">Cadangan Google Drive</h3>
            <p class="text-[11px] text-slate-400">Simpan ke akun Google pribadimu (Rp 0)</p>
          </div>
        </div>
      </div>

      <!-- State: Belum Terhubung -->
      <div v-if="!gdriveConnected" class="space-y-3 pt-1">
        <p class="text-xs text-slate-300 leading-relaxed">
          Hubungkan akun Google kamu untuk mencadangkan data kegiatan secara aman ke Google Drive pribadimu tanpa server pihak ketiga.
        </p>

        <button
          type="button"
          @click="emit('gdrive-connect')"
          :disabled="gdriveLoading || !isOnline"
          class="w-full py-2.5 px-4 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span v-if="gdriveLoading">Menghubungkan...</span>
          <span v-else>Hubungkan Akun Google</span>
        </button>
      </div>

      <!-- State: Sudah Terhubung -->
      <div v-else class="space-y-3 pt-1">
        <!-- User Badge -->
        <div class="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div class="flex items-center gap-2.5 min-w-0">
            <img
              v-if="gdriveUser?.picture"
              :src="gdriveUser.picture"
              alt="Avatar"
              class="w-7 h-7 rounded-full border border-slate-700 shrink-0"
            />
            <div
              v-else
              class="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0"
            >
              {{ gdriveUser?.name?.charAt(0) || 'U' }}
            </div>
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-white truncate">{{ gdriveUser?.name || 'Google User' }}</h4>
              <p class="text-[10px] text-slate-400 truncate">{{ gdriveUser?.email }}</p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('gdrive-disconnect')"
            title="Putuskan Sambungan"
            class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          >
            <LogOut class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Last Backup Info -->
        <div class="text-[11px] text-slate-400 flex items-center justify-between px-1">
          <span>Terakhir dicadangkan:</span>
          <span class="font-semibold text-slate-200">{{ gdriveLastBackup }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            @click="emit('gdrive-backup')"
            :disabled="gdriveLoading || !isOnline"
            class="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <component :is="gdriveLoading ? Loader2 : CloudUpload" :class="['w-4 h-4', gdriveLoading ? 'animate-spin' : '']" />
            <span>Cadangkan</span>
          </button>

          <button
            type="button"
            @click="emit('gdrive-restore')"
            :disabled="gdriveLoading || !isOnline"
            class="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <CloudDownload class="w-4 h-4 text-indigo-400" />
            <span>Pulihkan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Backup Manual (JSON File Fallback) -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
      <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Cadangan Manual (File JSON)</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <!-- Export Button -->
        <button
          type="button"
          @click="emit('export-data')"
          class="w-full py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <Download class="w-4 h-4 text-indigo-400" />
          <span>Export JSON File</span>
        </button>

        <!-- Import Button -->
        <button
          type="button"
          @click="triggerFileInput"
          class="w-full py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <Upload class="w-4 h-4 text-indigo-400" />
          <span>Import JSON File</span>
        </button>

        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          class="hidden"
          @change="handleFileChange"
        />
      </div>
    </div>

    <!-- Panduan Pasang di iPhone 8 -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
      <div class="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
        <Smartphone class="w-4 h-4" />
        <span>Cara Pasang di iPhone 8 (iOS 16)</span>
      </div>
      <ol class="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
        <li>Buka link aplikasi ini di browser <strong>Safari</strong> iPhone.</li>
        <li>Tekan tombol <strong>Share</strong> (ikon kotak dengan panah ke atas di bagian bawah Safari).</li>
        <li>Scroll ke bawah lalu pilih menu <strong>"Add to Home Screen"</strong> (*Tambahkan ke Layar Utama*).</li>
        <li>Ikon <strong>Dailyy</strong> akan muncul di homescreen dan bisa dibuka tanpa internet!</li>
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
