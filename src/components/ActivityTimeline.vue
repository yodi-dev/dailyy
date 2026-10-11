<script setup>
import { ref, nextTick } from 'vue'
import { Clock, Trash2, Edit2, Check, X, Calendar, Activity, AlertCircle } from '@lucide/vue'

const props = defineProps({
  groupedLogs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete-log', 'update-log'])

const editingId = ref(null)
const editTitle = ref('')
const editNote = ref('')
const confirmDeleteId = ref(null)
const editTitleInputRef = ref(null)

const startEdit = async (log) => {
  editingId.value = log.id
  editTitle.value = log.title
  editNote.value = log.note || ''
  confirmDeleteId.value = null
  await nextTick()
  editTitleInputRef.value?.focus()
}

const cancelEdit = () => {
  editingId.value = null
  editTitle.value = ''
  editNote.value = ''
}

const saveEdit = (id) => {
  if (!editTitle.value.trim()) return
  emit('update-log', {
    id,
    title: editTitle.value,
    note: editNote.value
  })
  editingId.value = null
}

const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(timestamp))
}
</script>

<template>
  <div class="space-y-6">
    <!-- Empty State -->
    <div
      v-if="!groupedLogs || groupedLogs.length === 0"
      class="text-center py-12 px-4 bg-app-card rounded-2xl border border-dashed border-app-border"
    >
      <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-app-subtle text-app-muted flex items-center justify-center">
        <Activity class="w-7 h-7 text-primary" />
      </div>
      <h3 class="text-base font-semibold text-app-text mb-1">Belum Ada Aktivitas Tercatat</h3>
      <p class="text-xs text-app-muted max-w-xs mx-auto">
        Ketik kegiatan di atas (misal: "Nyuci baju") lalu tekan Simpan untuk mulai memantau kebiasaanmu!
      </p>
    </div>

    <!-- Timeline Groups -->
    <div
      v-for="group in groupedLogs"
      :key="group.dateKey"
      class="space-y-2.5"
    >
      <!-- Date Group Header -->
      <div class="sticky top-14 z-10 py-1.5 px-3 bg-app-surface/95 backdrop-blur-md rounded-xl border border-app-border-subtle flex items-center justify-between shadow-xs">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-primary" />
          <span class="text-xs font-bold text-app-text uppercase tracking-wider">{{ group.label }}</span>
          <span class="text-[11px] text-app-muted hidden sm:inline">({{ group.fullDate }})</span>
        </div>
        <span class="text-[11px] font-medium bg-app-subtle text-app-text px-2 py-0.5 rounded-full border border-app-border-subtle">
          {{ group.items.length }} kegiatan
        </span>
      </div>

      <!-- Activity Items in Day Group -->
      <div class="space-y-2 pl-1 sm:pl-2">
        <div
          v-for="log in group.items"
          :key="log.id"
          class="group bg-app-card hover:bg-app-card-hover border border-app-border rounded-xl p-3 flex flex-col gap-2 transition-all shadow-xs"
        >
          <!-- Normal View -->
          <div v-if="editingId !== log.id" class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-2.5 min-w-0 flex-1">
              <div class="mt-0.5 shrink-0 px-2 py-0.5 bg-primary-soft border border-primary-border text-primary rounded-md text-[11px] font-mono flex items-center gap-1 font-semibold">
                <Clock class="w-3 h-3 text-primary" />
                <span>{{ formatTime(log.timestamp) }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-sm font-semibold text-app-text break-words leading-snug">
                  {{ log.title }}
                </h4>
                <p v-if="log.note" class="text-xs text-app-muted mt-0.5 break-words">
                  {{ log.note }}
                </p>
              </div>
            </div>

            <!-- Actions (Edit & Delete) -->
            <div class="flex items-center gap-1 shrink-0">
              <!-- Delete Confirmation Mode -->
              <template v-if="confirmDeleteId === log.id">
                <button
                  type="button"
                  @click="emit('delete-log', log.id); confirmDeleteId = null"
                  class="px-2.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-500 active:scale-95 transition-all cursor-pointer"
                >
                  Hapus
                </button>
                <button
                  type="button"
                  @click="confirmDeleteId = null"
                  class="p-1.5 text-app-muted hover:text-app-text rounded-lg hover:bg-app-subtle transition-all cursor-pointer"
                >
                  <X class="w-4 h-4" />
                </button>
              </template>

              <!-- Standard Action Buttons -->
              <template v-else>
                <button
                  type="button"
                  @click="startEdit(log)"
                  title="Edit Catatan"
                  class="p-2 sm:p-1.5 text-app-muted hover:text-primary hover:bg-app-subtle rounded-lg transition-all cursor-pointer"
                >
                  <Edit2 class="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                  type="button"
                  @click="confirmDeleteId = log.id"
                  title="Hapus Catatan"
                  class="p-2 sm:p-1.5 text-app-muted hover:text-rose-500 hover:bg-rose-500/15 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 class="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              </template>
            </div>
          </div>

          <!-- Inline Edit Form -->
          <div v-else class="space-y-2 pt-1">
            <input
              ref="editTitleInputRef"
              v-model="editTitle"
              type="text"
              class="w-full bg-app-surface border border-primary rounded-lg px-3 py-2 text-base sm:text-xs text-app-text focus:outline-none"
              placeholder="Nama aktivitas..."
              @keyup.enter="saveEdit(log.id)"
              @keyup.esc="cancelEdit"
            />
            <input
              v-model="editNote"
              type="text"
              class="w-full bg-app-surface border border-app-border-subtle rounded-lg px-3 py-2 text-base sm:text-xs text-app-muted focus:outline-none"
              placeholder="Catatan tambahan..."
              @keyup.enter="saveEdit(log.id)"
              @keyup.esc="cancelEdit"
            />
            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                @click="cancelEdit"
                class="px-2.5 py-1 text-xs text-app-muted hover:text-app-text rounded-lg hover:bg-app-subtle cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                @click="saveEdit(log.id)"
                class="px-3 py-1 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-primary-glow cursor-pointer"
              >
                <Check class="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

