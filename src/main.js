import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

// Otomatis deteksi dan reload saat versi baru dirilis
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Versi baru Dailyy tersedia. Memperbarui cache...')
    updateSW(true)
  },
  onOfflineReady() {
    console.log('Dailyy siap digunakan dalam mode offline.')
  }
})

// Simpan updateSW ke window agar bisa dipanggil manual jika dibutuhkan
window.__dailyyUpdateSW = updateSW

createApp(App).mount('#app')
