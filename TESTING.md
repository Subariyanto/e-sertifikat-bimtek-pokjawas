# Panduan Testing Aplikasi e-Sertifikat Bimtek Pokjawas

## Persiapan Testing

### 1. Setup Environment

```bash
cd e-sertifikat-bimtek-pokjawas
npm install
```

Pastikan file `.env` sudah dibuat dengan konfigurasi Supabase yang benar:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## Checklist Testing

### A. Landing Page & Auth

- [ ] Buka `http://localhost:5173`
- [ ] Landing page tampil dengan benar
- [ ] Klik tombol "Login Admin" → redirect ke `/login`
- [ ] Form login tampil
- [ ] Login dengan credentials admin (dari Supabase Auth)
- [ ] Berhasil redirect ke `/dashboard` setelah login

### B. Dashboard

- [ ] Dashboard menampilkan 4 stat cards (Kegiatan, Peserta, Sertifikat, Template)
- [ ] Tabel "Kegiatan Terbaru" tampil (atau kosong jika belum ada data)
- [ ] Sidebar menu dapat diklik
- [ ] Responsive di mobile (toggle sidebar)

### C. Data Kegiatan

- [ ] Klik menu "Data Kegiatan"
- [ ] Tampil tabel kosong atau data kegiatan contoh
- [ ] Klik "Tambah Kegiatan"
- [ ] Isi form kegiatan:
  - Nama: "Testing Bimtek Digital"
  - Jenis: Bimtek
  - Tanggal Mulai: 2026-07-10
  - Tanggal Selesai: 2026-07-10
  - Tempat: Jember
  - Jumlah JP: 32
  - Penyelenggara: (default)
- [ ] Klik "Simpan" → kegiatan berhasil tersimpan
- [ ] Edit kegiatan → perubahan tersimpan
- [ ] Hapus kegiatan → konfirmasi muncul dan data terhapus

### D. Data Peserta

- [ ] Klik menu "Data Peserta"
- [ ] Klik "Tambah Peserta"
- [ ] Pilih kegiatan dari dropdown
- [ ] Isi form peserta:
  - Nama: "Ahmad Fauzi"
  - NIP/NIK: "123456789"
  - Jabatan: "Pengawas Madrasah"
  - Instansi: "MI Darussalam Jember"
  - Jenis Sertifikat: Peserta
- [ ] Klik "Simpan" → peserta tersimpan
- [ ] Filter kegiatan berfungsi
- [ ] Search nama/instansi berfungsi
- [ ] Edit peserta berfungsi
- [ ] Hapus peserta berfungsi

### E. Import CSV Peserta

- [ ] Buat file CSV dengan format:

```csv
nama_lengkap,nip_nik,jabatan,instansi,email,no_hp,jenis_sertifikat
Siti Aminah,987654321,Kepala Madrasah,MTs Negeri Jember,siti@example.com,081234567890,Peserta
Nur Hasan,111222333,Guru,MA Al-Hikmah Jember,nur@example.com,081234567891,Peserta
```

- [ ] Klik "Import CSV"
- [ ] Pilih kegiatan
- [ ] Upload file CSV
- [ ] Data berhasil diimport
- [ ] Peserta muncul di tabel

### F. Export CSV Peserta

- [ ] Klik "Export"
- [ ] File CSV terdownload
- [ ] Buka file CSV → data sesuai

### G. Template Sertifikat

- [ ] Klik menu "Template Sertifikat"
- [ ] Tampil 5 template bawaan dari SQL seed
- [ ] Klik "Tambah Template"
- [ ] Isi form:
  - Nama: "Template Custom"
  - Kategori: Formal Hijau Emas
  - Warna Utama: #064E3B
  - Warna Sekunder: #D4AF37
- [ ] Klik "Simpan" → template tersimpan
- [ ] Klik "Edit" pada template → modal muncul dan edit berhasil
- [ ] Klik "Duplikat" → template baru terbuat dengan suffix "(Copy)"
- [ ] Klik "Hapus" → konfirmasi dan template terhapus

### H. Generate Sertifikat

- [ ] Klik menu "Generate Sertifikat"
- [ ] Pilih kegiatan yang sudah memiliki peserta
- [ ] Pilih template
- [ ] Filter jenis sertifikat (opsional)
- [ ] Jumlah peserta tampil benar
- [ ] Klik "Preview" → preview sertifikat muncul dengan:
  - Border emas
  - Nama peserta besar
  - Narasi kegiatan
  - QR Code di kiri bawah
  - Tanda tangan di kanan bawah
- [ ] Klik "Generate & Download" → PDF terdownload (single)
- [ ] Generate untuk multiple peserta → ZIP terdownload
- [ ] Buka PDF → tampilan sesuai, QR Code jelas

### I. Verifikasi Sertifikat (Admin)

- [ ] Klik menu "Verifikasi Sertifikat"
- [ ] Tampil tabel sertifikat yang sudah digenerate
- [ ] Stats card menampilkan jumlah yang benar
- [ ] Search nomor/nama berfungsi
- [ ] Filter status berfungsi
- [ ] Klik status badge → toggle valid/tidak_valid
- [ ] Klik icon mata → buka verifikasi publik di tab baru
- [ ] Hapus sertifikat berfungsi

### J. Verifikasi Publik

- [ ] Buka landing page
- [ ] Masukkan kode sertifikat di form "Verifikasi Cepat"
- [ ] Klik "Cek" → redirect ke halaman verifikasi
- [ ] Tampil status "Sertifikat Valid" dengan icon hijau
- [ ] Detail peserta, kegiatan, tanggal tampil lengkap
- [ ] Kode sertifikat salah → tampil "Sertifikat Tidak Valid"

**Test via QR Code:**

- [ ] Scan QR Code di PDF sertifikat dengan HP
- [ ] Redirect ke halaman verifikasi
- [ ] Data tampil benar di mobile

### K. Pengaturan

- [ ] Klik menu "Pengaturan"
- [ ] Tampil form pengaturan dengan data default atau kosong
- [ ] Edit:
  - Nama Lembaga
  - Alamat Lembaga
  - Nama Ketua
  - Jabatan Ketua
  - Format Nomor Sertifikat
- [ ] Klik "Simpan Pengaturan" → data tersimpan
- [ ] Generate sertifikat baru menggunakan pengaturan yang baru

### L. Logout

- [ ] Klik tombol "Keluar" di sidebar
- [ ] Redirect ke `/login`
- [ ] Coba akses `/dashboard` tanpa login → redirect ke `/login`

## Test Cases Khusus

### 1. Format Nomor Sertifikat

Generate sertifikat di bulan Juli 2026 → nomor harus: `001/BIMTEK-POKJAWAS/JBR/VII/2026`

### 2. Multi Jenis Sertifikat

- [ ] Generate untuk jenis Peserta
- [ ] Generate untuk jenis Narasumber → narasi berbeda
- [ ] Generate untuk jenis Panitia → narasi berbeda

### 3. Download Massal

- [ ] Generate 5+ sertifikat sekaligus
- [ ] File ZIP berisi semua PDF dengan nama yang benar

### 4. Responsive Design

- [ ] Buka di mobile (Chrome DevTools)
- [ ] Sidebar toggle berfungsi
- [ ] Form tetap usable
- [ ] Tabel scroll horizontal

### 5. Browser Compatibility

- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Edge ✅
- [ ] Safari (jika ada Mac) ✅

## Bug / Issue yang Harus Dicek

- [ ] QR Code tidak muncul → cek library qrcode installed
- [ ] PDF blank → cek html2canvas rendering
- [ ] Upload CSV gagal → cek format CSV (header match)
- [ ] Nomor sertifikat duplikat → cek logic getNextNomorUrut
- [ ] Verifikasi publik 404 → cek routing `/verifikasi/:kode`

## Performance Check

- [ ] Dashboard load < 2 detik
- [ ] Generate 1 sertifikat < 5 detik
- [ ] Generate 10 sertifikat < 30 detik
- [ ] Import 50 peserta < 5 detik

## Security Check

- [ ] Tanpa login tidak bisa akses dashboard
- [ ] RLS Supabase aktif (test via SQL query)
- [ ] .env tidak di-commit ke Git
- [ ] Password hash di Supabase Auth

## Hasil Testing

**Tanggal Testing:** _____________

**Tester:** _____________

**Browser:** _____________

**OS:** _____________

**Status:** 
- [ ] ✅ PASSED - Siap production
- [ ] ⚠️ PASSED WITH MINOR ISSUES - Perlu perbaikan kecil
- [ ] ❌ FAILED - Perlu perbaikan serius

**Catatan:**

_____________________________________________
_____________________________________________
_____________________________________________
