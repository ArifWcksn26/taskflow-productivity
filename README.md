# TaskFlow Pro

Aplikasi manajemen tugas dan produktivitas modern berbasis web. Dibangun dengan React dan TypeScript, TaskFlow Pro berjalan sepenuhnya di browser dengan penyimpanan lokal otomatis dan opsi sinkronisasi cloud real-time via Firebase.

---

## Fitur Utama

### Manajemen Tugas
- Buat, edit, dan hapus tugas dengan form lengkap: judul, deskripsi, kategori, prioritas (low / medium / high / urgent), tanggal tenggat, jam, dan estimasi durasi
- Quick add untuk menambah tugas instan tanpa membuka modal
- Subtasks / checklist bertingkat dengan progress bar; seluruh subtask selesai otomatis menandai tugas induk sebagai selesai
- Tag / label kustom per tugas, dapat dicari dari search bar
- Duplikat tugas beserta semua propertinya
- Tugas berulang (harian, mingguan, bulanan) yang otomatis membuat salinan baru saat diselesaikan
- Komentar dan diskusi per tugas dengan avatar anggota dan timestamp

### Tampilan
- **List View** — Grid kartu responsif (1, 2, atau 3 kolom)
- **Board View** — Kolom berdasarkan prioritas
- **Kanban View** — Papan tiga kolom (Belum Dimulai, Sedang Dikerjakan, Selesai) dengan drag & drop
- **Calendar View** — Kalender bulanan interaktif; klik tanggal untuk melihat agenda atau tambah tugas langsung
- **Analytics View** — Dashboard produktivitas dengan grafik tren 7 hari, distribusi kategori, distribusi prioritas, dan skor produktivitas

### Notifikasi dan Pengingat
- Pemeriksaan otomatis setiap 30 detik untuk tugas yang akan lewat tenggat dan tugas terlambat
- Browser push notification via Web Notification API
- Suara pengingat dan suara konfirmasi selesai menggunakan Web Audio API (tanpa file audio eksternal)
- Pusat notifikasi dengan badge unread, tandai semua sudah dibaca, dan hapus semua

### Sinkronisasi Cloud
- **Cloud Sync (Simulasi)** — Backup dan restore data menggunakan Cloud Key unik; cocok untuk berbagi antar perangkat secara manual
- **Firebase Auth + Firestore** — Login dengan akun Google (OAuth popup) atau email dan kata sandi; data tersimpan ke Firestore dengan sinkronisasi real-time. Berjalan dalam mode demo jika Firebase belum dikonfigurasi

### Ekspor Data
- **CSV** — Format spreadsheet, UTF-8, 15 kolom lengkap termasuk progress subtask dan penanggung jawab
- **PDF** — Laporan formal berbranding dengan kartu metrik, tabel tugas berwarna, dihasilkan via jsPDF
- **ICS / iCal** — File kalender standar yang kompatibel dengan Apple Calendar, Outlook, dan Google Calendar
- **JSON** — Backup dan restore penuh (tugas, kategori, anggota)
- **Tautan Google Calendar** — Generate URL langsung untuk menambahkan tugas ke Google Calendar

### Analitik Produktivitas
Skor produktivitas dihitung dengan formula berbobot:
`(completion rate × 0.4) + (on-time rate × 0.3) + (subtask rate × 0.2) + (streak bonus max 10)`

Metrik yang tersedia: completion rate, on-time rate, streak hari berturut-turut, total estimasi jam kerja, statistik per kategori, distribusi prioritas, dan tren 7 hari.

### Lain-lain
- Dark mode dengan deteksi otomatis preferensi sistem
- Toggle suara notifikasi
- Responsive dan mobile-friendly
- Code splitting dengan `React.lazy` dan `Suspense` untuk performa muat pertama yang cepat
- Log aktivitas lengkap untuk setiap perubahan tugas

---

## Instalasi dan Menjalankan Proyek

### Prasyarat
- Node.js versi 18 atau lebih baru
- npm

### Langkah Instalasi

```bash
# 1. Clone repositori
git clone <url-repositori>
cd taskflow-pro

# 2. Install dependensi
npm install

# 3. (Opsional) Konfigurasi Firebase
# Salin .env.example ke .env lalu isi variabel Firebase
cp .env.example .env
```

Jika variabel Firebase tidak diisi, aplikasi tetap berjalan penuh dalam mode simulasi lokal.

### Menjalankan Aplikasi

```bash
# Development server (port 3000, dapat diakses dari LAN/mobile)
npm run dev
```

Buka `http://localhost:3000` di browser.

### Build Produksi

```bash
# Compile dan bundle untuk produksi
npm run build

# Preview hasil build secara lokal
npm run preview
```

### Perintah Lain

```bash
# Pemeriksaan tipe TypeScript
npm run lint

# Hapus direktori dist
npm run clean
```

---

## Struktur Folder

```
taskflow-pro/
├── src/
│   ├── App.tsx                         # Root component dan global state management
│   ├── main.tsx                        # Entry point React
│   ├── index.css                       # Global CSS
│   ├── types.ts                        # Semua TypeScript interfaces dan types
│   ├── components/
│   │   ├── Header.tsx                  # Header sticky: search, navigasi, toggle
│   │   ├── Sidebar.tsx                 # Navigasi kiri, kategori, skor produktivitas
│   │   ├── TaskList.tsx                # Daftar tugas, quick add, filter bar
│   │   ├── TaskCard.tsx                # Kartu tugas individual
│   │   ├── TaskModal.tsx               # Form buat dan edit tugas
│   │   ├── TaskDetailDrawer.tsx        # Drawer detail tugas dan komentar
│   │   ├── KanbanView.tsx              # Papan Kanban dengan drag & drop
│   │   ├── CalendarView.tsx            # Kalender bulanan interaktif
│   │   ├── AnalyticsView.tsx           # Dashboard analitik produktivitas
│   │   ├── CategoryModal.tsx           # Buat dan kelola kategori
│   │   ├── CloudSyncModal.tsx          # Cloud sync simulasi
│   │   ├── ExportModal.tsx             # Ekspor CSV, PDF, ICS, JSON
│   │   ├── FirebaseAuthModal.tsx       # Login Firebase dan sinkronisasi cloud
│   │   └── NotificationCenterModal.tsx # Pusat notifikasi
│   ├── services/
│   │   ├── storage.ts                  # Persistence localStorage dan cloud sync simulasi
│   │   ├── firebase.ts                 # Inisialisasi Firebase, wrappers auth dan Firestore
│   │   ├── firebaseSyncService.ts      # Save, fetch, dan subscribe data Firestore
│   │   ├── analyticsService.ts         # Kalkulasi statistik dan skor produktivitas
│   │   ├── exportService.ts            # Generator CSV, PDF, ICS, dan tautan Google Calendar
│   │   ├── notifications.ts            # Deadline checker dan browser push notification
│   │   └── sound.ts                    # Suara pengingat dan konfirmasi via Web Audio API
│   └── data/
│       └── initialData.ts              # Seed data default: kategori, tugas, anggota, habits
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
└── .env.example                        # Template variabel environment Firebase
```

---

## Teknologi yang Digunakan

| Teknologi | Versi | Keterangan |
|---|---|---|
| React | ^19.0.1 | UI framework |
| TypeScript | ~5.8.2 | Type safety |
| Vite | ^6.2.3 | Build tool dan development server |
| Tailwind CSS | ^4.1.14 | Utility-first CSS (integrasi native via plugin Vite) |
| Firebase | ^12.17.1 | Autentikasi Google/Email dan Firestore real-time database |
| Motion (Framer Motion) | ^12.23.24 | Animasi komponen |
| Lucide React | ^0.546.0 | Ikon SVG |
| canvas-confetti | ^1.9.4 | Efek konfeti saat tugas selesai |
| date-fns | ^4.4.0 | Utilitas manipulasi tanggal |
| jsPDF + jspdf-autotable | ^4.2.1 / ^5.0.8 | Generate laporan PDF |
| Express | ^4.21.2 | Web server opsional untuk hosting |
