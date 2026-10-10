# Dailyy 🗓️
> Aplikasi pencatat aktivitas harian personal yang ringan, modern, 100% offline-ready (PWA), dan bebas biaya (zero-cost).

**Dailyy** dibuat khusus untuk kenyamanan mencatat rutinitas sehari-hari (misal: *nyuci baju*, *olahraga*, *baca buku*, *belajar koding*) dan memantau frekuensi kegiatan dalam seminggu maupun sebulan tanpa ribet.

---

## ✨ Fitur Utama
- ⚡ **Pencatatan Cepat (Quick Logging):** Input kegiatan instan dengan tombol pilihan cepat (*frequent chips*), pencatatan waktu otomatis, dan opsi atur waktu lampau.
- 📅 **Riwayat Terkelompok (Activity Timeline):** Tampilan riwayat kegiatan per hari (*Hari Ini*, *Kemarin*, dst), dilengkapi inline edit (`Enter`/`Esc`) dan konfirmasi hapus 2-langkah.
- 📊 **Statistik & Rekap:** Visualisasi frekuensi kegiatan mingguan (7 hari) dan bulanan (30 hari) lengkap dengan kegiatan paling sering (*Trophy*) dan bilah progres.
- ☁️ **Cadangan Google Drive Pribadi:** Sinkronisasi cadangan langsung ke Google Drive pribadi pengguna via Google Identity Services OAuth2 tanpa perantara server.
- 💾 **Cadangan File di Perangkat:** Download file cadangan dan pulihkan kapan saja dengan dialog konfirmasi penggabungan (**Gabungkan** / **Timpa**) untuk mencegah kehilangan data.
- 📴 **Offline-First PWA:** Berjalan lancar tanpa koneksi internet di iPhone (iOS Safari), Android (Chrome), maupun Desktop.
- 🔄 **Pembaruan Otomatis:** Deteksi versi baru secara otomatis dengan tombol periksa update manual.
- 🛡️ **Privasi 100%:** Data tersimpan lokal di perangkat dan akun Google pribadi Anda. Dilengkapi halaman Kebijakan Privasi dan Ketentuan Layanan resmi.

---

## 🛠️ Tech Stack
- **Framework:** [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Build Tool:** [Vite](https://vite.dev/)
- **PWA Plugin:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox Service Worker)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide Icons (@lucide/vue)](https://lucide.dev/)
- **Cloud Auth:** Google Identity Services (GIS OAuth2 Client)
- **Storage:** LocalStorage & Google Drive REST API v3

---

## 🚀 Panduan Menjalankan Secara Lokal

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev

# Build untuk produksi
npm run build

# Preview build produksi
npm run preview
```

---

## 📱 Panduan Pasang ke Layar Utama (PWA Install)

### Di iPhone / iPad (Safari):
1. Buka URL aplikasi di browser **Safari**.
2. Tekan tombol **Bagikan / Share** (ikon kotak dengan panah ke atas di bilah bawah).
3. Gulir ke bawah lalu pilih menu **"Tambahkan ke Layar Utama"** (*Add to Home Screen*).
4. Tekan **Tambah**. Ikon **Dailyy** akan muncul di layar utama dan bisa dibuka instan tanpa koneksi internet.

### Di Android (Google Chrome):
1. Buka URL aplikasi di browser **Chrome**.
2. Tekan menu **titik tiga (⋮)** di pojok kanan atas.
3. Pilih **"Instal aplikasi"** atau **"Tambahkan ke Layar Utama"**.
4. Aplikasi akan terpasang di beranda HP Anda.

---

## 📄 Lisensi & Legalitas
- [Kebijakan Privasi](/privacy.html)
- [Ketentuan Layanan](/terms.html)
- Dikembangkan oleh Yodi &bull; 2026 Dailyy
