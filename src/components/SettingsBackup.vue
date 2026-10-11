<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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
  RefreshCw,
  Palette,
  Check
} from '@lucide/vue'
import { useTheme } from '../composables/useTheme'

const { themes, currentTheme, setTheme } = useTheme()

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
const pendingRestore = ref(null) // { type: 'json' | 'gdrive', content: string | null }

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
      if (props.totalLogsCount > 0) {
        pendingRestore.value = { type: 'json', content }
      } else {
        emit('import-data', { jsonStr: content, merge: false })
      }
    }
  }
  reader.onerror = () => {
    console.error('Gagal membaca file backup')
  }
  reader.readAsText(file)
  event.target.value = ''
}

const handleGDriveRestoreClick = () => {
  if (props.totalLogsCount > 0) {
    pendingRestore.value = { type: 'gdrive', content: null }
  } else {
    emit('gdrive-restore', { merge: false })
  }
}

const confirmRestore = (merge) => {
  if (!pendingRestore.value) return
  if (pendingRestore.value.type === 'json') {
    emit('import-data', { jsonStr: pendingRestore.value.content, merge })
  } else if (pendingRestore.value.type === 'gdrive') {
    emit('gdrive-restore', { merge })
  }
  pendingRestore.value = null
}

const cancelRestore = () => {
  pendingRestore.value = null
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && pendingRestore.value) {
    cancelRestore()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

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
      <h2 class="text-base font-bold text-app-text flex items-center gap-2">
        <ShieldCheck class="w-5 h-5 text-primary" />
        <span>Pengaturan & Cadangan Data</span>
      </h2>
      <p class="text-xs text-app-muted">Kelola tema tampilan, data, dan sinkronisasi cadangan</p>
    </div>

    <!-- Pilihan Tema & Tampilan -->
    <div class="bg-app-card border border-app-border rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-sm">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Palette class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <h3 class="text-xs font-bold text-app-text uppercase tracking-wider truncate">Tema & Warna</h3>
            <p class="text-[11px] text-app-muted truncate">Pilih tampilan favoritmu</p>
          </div>
        </div>
        <span class="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-primary-soft text-primary border border-primary-border shrink-0 whitespace-nowrap">
          {{ themes.find(t => t.id === currentTheme)?.name }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2 pt-0.5">
        <button
          v-for="t in themes"
          :key="t.id"
          type="button"
          @click="setTheme(t.id)"
          :class="[
            'relative p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[4.75rem] active:scale-98',
            currentTheme === t.id
              ? 'border-primary ring-2 ring-primary/40 bg-app-surface shadow-sm'
              : 'border-app-border-subtle hover:border-app-border bg-app-surface/60 hover:bg-app-surface'
          ]"
        >
          <!-- Color Preview Bubbles & Active Check -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 shrink-0">
              <span
                class="w-5 h-5 rounded-full shadow-inner border border-white/20 shrink-0"
                :style="{ backgroundColor: t.swatch }"
              ></span>
              <span
                class="w-4 h-4 rounded-full border border-black/10 shrink-0"
                :style="{ backgroundColor: t.bgPreview }"
              ></span>
            </div>
            <div
              v-if="currentTheme === t.id"
              class="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs shrink-0"
            >
              <Check class="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          <!-- Theme Name & Category Label -->
          <div class="min-w-0 mt-1">
            <div class="text-xs font-bold text-app-text truncate leading-tight">{{ t.name }}</div>
            <div class="text-[10px] text-app-muted truncate mt-0.5">{{ t.category }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Ringkasan Catatan & Pembaruan Aplikasi -->
    <div class="bg-app-card border border-app-border rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between text-xs">
        <span class="text-app-muted">Total Catatan Tersimpan:</span>
        <span class="font-mono font-bold text-app-text">{{ totalLogsCount }} kegiatan</span>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-app-border-subtle text-xs">
        <span class="text-app-muted">Keamanan Data:</span>
        <span class="text-app-text font-medium">Tersimpan aman di perangkat ini</span>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-app-border-subtle text-xs">
        <span class="text-app-muted">Pembaruan Aplikasi:</span>
        <button
          type="button"
          @click="checkForUpdates"
          :disabled="checkingUpdate"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-app-subtle hover:bg-app-surface text-primary hover:text-primary-light border border-app-border-subtle active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw :class="['w-3 h-3', checkingUpdate ? 'animate-spin' : '']" />
          <span>{{ checkingUpdate ? 'Memperbarui...' : 'Periksa Versi Baru' }}</span>
        </button>
      </div>
    </div>

    <!-- Google Drive Backup Section (Card Unggulan) -->
    <div class="bg-app-card border border-app-border rounded-2xl p-4 space-y-3.5 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
            <Cloud class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-xs font-bold text-app-text uppercase tracking-wider">Cadangan Google Drive</h3>
            <p class="text-[11px] text-app-muted">Tersimpan aman di Google Drive pribadi Anda</p>
          </div>
        </div>
      </div>

      <!-- State: Belum Terhubung -->
      <div v-if="!gdriveConnected" class="space-y-3 pt-1">
        <p class="text-xs text-app-text leading-relaxed">
          Hubungkan akun Google kamu untuk mencadangkan catatan kegiatan secara aman ke Google Drive pribadi agar data tidak hilang saat berganti perangkat.
        </p>

        <button
          type="button"
          @click="emit('gdrive-connect')"
          :disabled="gdriveLoading || !isOnline"
          class="w-full py-2.5 px-4 bg-app-surface hover:bg-app-subtle border border-app-border disabled:opacity-50 text-app-text rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 shadow-sm active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
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
        <div class="flex items-center justify-between p-2.5 bg-app-subtle border border-app-border-subtle rounded-xl">
          <div class="flex items-center gap-2.5 min-w-0">
            <img
              v-if="gdriveUser?.picture"
              :src="gdriveUser.picture"
              alt="Avatar"
              class="w-7 h-7 rounded-full border border-app-border shrink-0"
            />
            <div
              v-else
              class="w-7 h-7 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0"
            >
              {{ gdriveUser?.name?.charAt(0) || 'U' }}
            </div>
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-app-text truncate">{{ gdriveUser?.name || 'Google User' }}</h4>
              <p class="text-[10px] text-app-muted truncate">{{ gdriveUser?.email }}</p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('gdrive-disconnect')"
            title="Putuskan Sambungan"
            class="p-1.5 text-app-muted hover:text-rose-500 hover:bg-app-surface rounded-lg transition-all cursor-pointer"
          >
            <LogOut class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Last Backup Info -->
        <div class="text-[11px] text-app-muted flex items-center justify-between px-1">
          <span>Terakhir dicadangkan:</span>
          <span class="font-semibold text-app-text">{{ gdriveLastBackup }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            @click="emit('gdrive-backup')"
            :disabled="gdriveLoading || !isOnline"
            class="py-2.5 px-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-primary-glow active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <component :is="gdriveLoading ? Loader2 : CloudUpload" :class="['w-4 h-4', gdriveLoading ? 'animate-spin' : '']" />
            <span>Cadangkan</span>
          </button>

          <button
            type="button"
            @click="handleGDriveRestoreClick"
            :disabled="gdriveLoading || !isOnline"
            class="py-2.5 px-3 bg-app-subtle hover:bg-app-surface disabled:opacity-50 text-app-text rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-app-border-subtle active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <CloudDownload class="w-4 h-4 text-primary" />
            <span>Pulihkan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Cadangan File di Perangkat -->
    <div class="bg-app-card border border-app-border rounded-2xl p-4 space-y-3">
      <div>
        <h3 class="text-xs font-bold text-app-text uppercase tracking-wider">Cadangan File di Perangkat</h3>
        <p class="text-[11px] text-app-muted mt-0.5">Simpan atau pulihkan file cadangan secara langsung di perangkat</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <!-- Export Button -->
        <button
          type="button"
          @click="emit('export-data')"
          class="w-full py-2.5 px-3 bg-app-subtle hover:bg-app-surface text-app-text rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-app-border-subtle active:scale-95 transition-all cursor-pointer"
        >
          <Download class="w-4 h-4 text-primary" />
          <span>Download Cadangan</span>
        </button>

        <!-- Import Button -->
        <button
          type="button"
          @click="triggerFileInput"
          class="w-full py-2.5 px-3 bg-app-subtle hover:bg-app-surface text-app-text rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-app-border-subtle active:scale-95 transition-all cursor-pointer"
        >
          <Upload class="w-4 h-4 text-primary" />
          <span>Pulihkan dari File</span>
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

    <!-- Panduan Pasang di Layar Utama (Home Screen) -->
    <div class="bg-app-card border border-app-border rounded-2xl p-4 space-y-2.5">
      <div class="flex items-center gap-2 text-primary font-semibold text-xs">
        <Smartphone class="w-4 h-4" />
        <span>Cara Pasang ke Layar Utama (Home Screen)</span>
      </div>
      <ol class="text-xs text-app-text space-y-2 list-decimal list-inside pl-1 leading-relaxed">
        <li>
          <strong>iPhone / iPad (Safari):</strong> Tekan tombol <strong>Bagikan</strong> (ikon kotak dengan panah ke atas di bilah bawah), lalu pilih menu <strong>"Tambahkan ke Layar Utama"</strong> (*Add to Home Screen*).
        </li>
        <li>
          <strong>Android (Chrome):</strong> Tekan tombol menu <strong>titik tiga (⋮)</strong> di kanan atas, lalu pilih <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
        </li>
        <li>
          Ikon <strong>Dailyy</strong> akan muncul di layar utama dan dapat dibuka instan layaknya aplikasi biasa tanpa perlu koneksi internet!
        </li>
      </ol>
    </div>

    <!-- Danger Zone: Reset Data -->
    <div class="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-2.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-rose-500 text-xs font-bold">
          <AlertTriangle class="w-4 h-4" />
          <span>Hapus Semua Data</span>
        </div>
      </div>

      <p class="text-[11px] text-app-muted">
        Menghapus seluruh riwayat aktivitas yang tersimpan di perangkat ini. Tindakan ini tidak dapat dibatalkan.
      </p>

      <div v-if="!showClearConfirm">
        <button
          type="button"
          @click="showClearConfirm = true"
          class="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 rounded-lg text-xs font-semibold active:scale-95 transition-all cursor-pointer"
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
          class="px-3 py-1.5 bg-app-subtle text-app-text border border-app-border-subtle rounded-lg text-xs hover:bg-app-surface cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>

    <!-- Legal Links -->
    <div class="pt-2 pb-2 text-center text-[11px] text-app-muted space-x-3">
      <a href="/privacy.html" target="_blank" class="hover:text-primary underline transition-colors">Kebijakan Privasi</a>
      <span>&bull;</span>
      <a href="/terms.html" target="_blank" class="hover:text-primary underline transition-colors">Ketentuan Layanan</a>
    </div>

    <!-- Modal Konfirmasi Pemulihan Data Cadangan -->
    <div
      v-if="pendingRestore"
      @click.self="cancelRestore"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-app-surface border border-app-border rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-app-text">Konfirmasi Pemulihan Data</h3>
            <p class="text-[11px] text-app-muted">Pilih metode pemulihan catatan</p>
          </div>
        </div>

        <p class="text-xs text-app-text leading-relaxed">
          Terdapat <strong class="text-primary">{{ totalLogsCount }} catatan</strong> tersimpan di perangkat ini. Bagaimana Anda ingin memproses data cadangan ini?
        </p>

        <div class="space-y-2 pt-1">
          <button
            type="button"
            @click="confirmRestore(true)"
            class="w-full py-2.5 px-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-primary-glow active:scale-95 transition-all cursor-pointer"
          >
            <span>Gabungkan (Simpan Keduanya)</span>
          </button>

          <button
            type="button"
            @click="confirmRestore(false)"
            class="w-full py-2.5 px-3 bg-app-subtle hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span>Timpa Semua (Ganti Catatan Lama)</span>
          </button>

          <button
            type="button"
            @click="cancelRestore"
            class="w-full py-2 px-3 text-app-muted hover:text-app-text rounded-xl text-xs font-medium text-center transition-all cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
