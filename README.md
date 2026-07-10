# e-Sertifikat Bimtek Pokjawas

Sistem Manajemen Sertifikat Digital untuk Kelompok Kerja Pengawas Madrasah Kabupaten Jember.

## 🎯 Fitur Utama

- ✅ **Manajemen Kegiatan** - Kelola data Bimtek, Workshop, Seminar, dll
- ✅ **Manajemen Peserta** - Import CSV, export data peserta
- ✅ **Template Sertifikat** - 5 template siap pakai dengan customizable warna
- ✅ **Generate Sertifikat PDF** - Batch generate dengan QR Code
- ✅ **Verifikasi Publik** - QR Code verification untuk keaslian sertifikat
- ✅ **Mode Lokal** - Semua data tersimpan di localStorage browser (tidak perlu server!)

## 🚀 Mode Operasi: LOCAL STORAGE

Aplikasi ini **tidak memerlukan Supabase** atau backend apapun. Semua data tersimpan di localStorage browser.

**Keuntungan:**
- ✅ Tidak perlu setup database
- ✅ Tidak perlu kredensial Supabase
- ✅ Install & langsung pakai
- ✅ Data tetap tersimpan selama browser tidak clear cache

**Keterbatasan:**
- Data hanya tersimpan di 1 browser/komputer
- Tidak ada sync antar device
- Clear cache = data hilang (backup manual via export)

## 📦 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/Subariyanto/e-sertifikat-bimtek-pokjawas.git
cd e-sertifikat-bimtek-pokjawas
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka browser: `http://localhost:5173/e-sertifikat-bimtek-pokjawas/`

### 4. Build untuk Production

```bash
npm run build
```

## 🔐 Login Default

```
Email: admin@pokjawas.com
Password: admin123
```

## 📋 Data Default yang Sudah Ada

Saat pertama kali buka aplikasi, data berikut sudah tersedia:

### 🎨 Template Sertifikat (5 template)
1. **Formal Hijau Emas** (Default) - Hijau tua + Emas
2. **Modern Navy Gold** - Navy + Emas
3. **Islami Emerald Gold** - Emerald + Emas
4. **Sertifikat Narasumber** - Ungu + Kuning
5. **Sertifikat Penghargaan** - Merah + Kuning

### ⚙️ Pengaturan Default
- Nama Lembaga: Kelompok Kerja Pengawas Madrasah Kabupaten Jember
- Ketua: Subariyanto, S.Pd., M.Pd.I.
- Format Nomor: `{nomor}/{kode_kegiatan}-POKJAWAS/JBR/{bulan_romawi}/{tahun}`

## 🎨 Cara Pakai

### 1. Buat Kegiatan Baru
1. Masuk menu **Data Kegiatan**
2. Klik **Tambah Kegiatan**
3. Isi form (Nama, Jenis, Tanggal, Tempat, JP, dll)
4. Simpan

### 2. Tambah Peserta
1. Masuk menu **Data Peserta**
2. Pilih **Tambah Peserta** (satu per satu) atau **Import CSV** (banyak sekaligus)
3. Pilih kegiatan, isi data peserta
4. Simpan

**Format CSV untuk Import:**
```csv
nama_lengkap,nip_nik,jabatan,instansi,email,no_hp,jenis_sertifikat
Ahmad Zainuri,197001011998031001,Kepala MI,MI Nurul Huda,ahmad@example.com,081234567890,Peserta
Siti Aminah,197002021998032002,Guru MTs,MTs Al-Ikhlas,siti@example.com,081234567891,Peserta
```

### 3. Generate Sertifikat
1. Masuk menu **Generate Sertifikat**
2. Pilih **Kegiatan**, **Template**, dan **Jenis Sertifikat** (opsional)
3. Klik **Preview** untuk melihat contoh
4. Klik **Generate & Download**
   - 1 peserta → download langsung PDF
   - Banyak peserta → download ZIP berisi semua PDF

### 4. Verifikasi Sertifikat
- Admin: menu **Verifikasi Sertifikat** → lihat semua sertifikat yang diterbitkan
- Publik: scan QR Code di sertifikat → buka halaman verifikasi publik

## 📂 Struktur Folder

```
e-sertifikat-bimtek-pokjawas/
├── src/
│   ├── components/       # Sidebar, ProtectedRoute
│   ├── contexts/         # AuthContext
│   ├── lib/              # localDb, supabase adapter, utils
│   ├── pages/            # 12 halaman utama
│   ├── App.jsx
│   └── main.jsx
├── public/
├── dist/                 # Build output
├── .env                  # Placeholder (tidak terpakai di local mode)
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🌐 Deploy ke GitHub Pages

### 1. Buat Repository GitHub

```bash
# Di folder project
git init
git add .
git commit -m "Initial commit - e-Sertifikat Bimtek Pokjawas"
git branch -M main
git remote add origin https://github.com/Subariyanto/e-sertifikat-bimtek-pokjawas.git
git push -u origin main
```

### 2. Deploy

```bash
npm run deploy
```

Aplikasi akan live di: `https://subariyanto.github.io/e-sertifikat-bimtek-pokjawas/`

### 3. Setting GitHub Pages

1. Buka repo di GitHub
2. **Settings** → **Pages**
3. Source: **gh-pages** branch
4. Save

## 🔧 Kustomisasi

### Ubah Warna Template

Masuk menu **Template Sertifikat** → Edit template → ubah **Warna Utama** dan **Warna Sekunder**.

### Ubah Format Nomor Sertifikat

Masuk menu **Pengaturan** → edit **Format Nomor Sertifikat**.

Placeholder:
- `{nomor}` → 001, 002, 003, ...
- `{kode_kegiatan}` → BIMTEK, WORKSHOP, SEMINAR, ...
- `{bulan_romawi}` → I, II, III, ..., XII
- `{tahun}` → 2026

Contoh: `{nomor}/{kode_kegiatan}-POKJAWAS/JBR/{bulan_romawi}/{tahun}`  
Hasil: `001/BIMTEK-POKJAWAS/JBR/VII/2026`

### Ubah Data Penandatangan

Masuk menu **Pengaturan** → edit **Nama Ketua**, **Jabatan Ketua**, dll.

## 📊 Backup & Restore Data

### Backup Manual
1. Masuk menu **Data Peserta** atau **Kegiatan**
2. Klik **Export** → simpan file CSV
3. Ulangi untuk semua menu

### Backup localStorage (Advanced)
1. Buka browser **DevTools** (F12)
2. Tab **Application** → **Local Storage**
3. Pilih `http://localhost:5173` atau `https://subariyanto.github.io`
4. Copy value dari key `e_sertifikat_bimtek_pokjawas_v1`
5. Simpan di file `.txt`

### Restore
Paste kembali value tersebut ke localStorage key yang sama.

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **Vite 5** - Build Tool
- **Tailwind CSS 3** - Styling
- **React Router 6** - Routing
- **jsPDF** - PDF Generation
- **html2canvas** - Canvas to Image
- **QRCode.js** - QR Code Generation
- **JSZip** - ZIP Archive
- **PapaParse** - CSV Parser
- **Lucide React** - Icons

## 📝 Catatan

- Data tersimpan di `localStorage` key: `e_sertifikat_bimtek_pokjawas_v1`
- Sertifikat yang digenerate berformat A4 landscape
- QR Code verification URL: `/verifikasi/{kode_unik}`
- Password default disimpan plain text (demo only - production gunakan bcrypt)

## 🐛 Troubleshooting

### Data Hilang
→ Browser clear cache. Backup manual via export CSV.

### Build Error
```bash
npm install --legacy-peer-deps
npm run build
```

### Dev Server Port Conflict
Ubah port di `vite.config.js`:
```js
server: { port: 3000 }
```

## 📄 License

MIT License - Free for personal & commercial use.

## 👨‍💻 Author

**Subariyanto, S.Pd., M.Pd.I.**  
Ketua Kelompok Kerja Pengawas Madrasah Kabupaten Jember  
NIP. 197002122005011004

---

© 2026 Pokjawas Kabupaten Jember
