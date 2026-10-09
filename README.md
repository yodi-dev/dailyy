# Dailyy 🗓️
> Aplikasi pencatat log aktivitas harian personal yang ringan, modern, 100% offline-ready (PWA), dan zero-cost.

Dibuat khusus untuk kenyamanan mencatat rutinitas sehari-hari (misal: *nyuci baju*, *olahraga*, *baca buku*) dan memantau frekuensi kegiatan dalam seminggu maupun sebulan.

---

## ✨ Fitur Utama
- **Quick Log Entry:** Input kegiatan cepat dengan tombol sugesti otomatis (*frequent chips*) dan pencatatan waktu otomatis.
- **Activity Timeline:** Riwayat kegiatan terkelompok per hari (*Hari Ini*, *Kemarin*, dst) dengan opsi edit dan hapus.
- **Statistik & Rekap:** Visualisasi frekuensi kegiatan mingguan (7 hari) dan bulanan (30 hari).
- **Offline-First PWA:** Berjalan lancar tanpa koneksi internet di iPhone (iOS Safari) maupun Android/Desktop.
- **Data Protection:** Fitur Export & Import data backup berformat JSON untuk perlindungan data lokal.
- **Zero Cost (Rp 0):** Tanpa biaya langganan, database berbayar, atau lisensi developer.

---

## 🛠️ Tech Stack
- **Framework:** [Vue 3](https://vuejs.org/) (Composition API)
- **Bundler:** [Vite](https://vite.dev/)
- **PWA Plugin:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox Service Worker)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide Icons](https://lucide.dev/)
- **Storage:** LocalStorage & IndexedDB

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

## 📱 Panduan Pasang di iPhone 8 (iOS 16)
1. Buka URL aplikasi di browser **Safari** iPhone.
2. Tekan tombol **Share** (ikon kotak dengan panah atas di bar bawah).
3. Pilih **"Add to Home Screen"** (*Tambahkan ke Layar Utama*).
4. Aplikasi **Dailyy** akan muncul di layar utama dan dapat dibuka layaknya aplikasi native tanpa koneksi internet.
