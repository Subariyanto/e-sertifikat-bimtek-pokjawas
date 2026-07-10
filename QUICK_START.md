# 🚀 Quick Start Guide - e-Sertifikat Bimtek Pokjawas

Pak Yanto, berikut langkah cepat untuk menjalankan aplikasi e-Sertifikat Bimtek Pokjawas.

## ⚡ Setup Cepat (10 Menit)

### 1. Install Dependencies

```bash
cd C:\Users\subar\.openclaw\workspace\e-sertifikat-bimtek-pokjawas
npm install
```

### 2. Setup Supabase

**A. Buat Project Supabase:**
1. Buka https://supabase.com
2. Login/Sign Up
3. New Project → Isi nama & password → Tunggu 2 menit

**B. Jalankan SQL Schema:**
1. Buka SQL Editor di Supabase
2. Copy paste semua isi file `supabase-schema.sql`
3. Run → Tungai "Success"

**C. Buat Storage Bucket:**
1. Storage → Create bucket
2. Name: `sertifikat-files`
3. Public: ON
4. Create

**D. Dapatkan API Keys:**
1. Settings → API
2. Copy **Project URL** dan **anon public key**

### 3. Setup Environment Variables

Buat file `.env` di root folder:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Ganti `xxxxx` dan `your-anon-key-here` dengan nilai dari Supabase.

### 4. Buat Admin User

Di Supabase Dashboard:
1. Authentication → Users
2. Add user
3. Email: `admin@pokjawas.com` (atau email Pak Yanto)
4. Password: `admin123` (ganti dengan password kuat)
5. Auto Confirm User: **ON**
6. Create

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka browser: `http://localhost:5173`

### 6. Login & Test

1. Klik **Login Admin**
2. Email: `admin@pokjawas.com`
3. Password: `admin123`
4. Login → Masuk ke Dashboard ✅

## 📋 Langkah Selanjutnya

### Test Aplikasi (5 Menit)

**1. Buat Kegiatan:**
- Menu: Data Kegiatan
- Tambah Kegiatan
- Nama: "Bimtek Test"
- Jenis: Bimtek
- Tanggal: Hari ini
- Tempat: Jember
- JP: 32
- Simpan

**2. Tambah Peserta:**
- Menu: Data Peserta
- Tambah Peserta
- Pilih kegiatan yang baru dibuat
- Nama: "Nama Anda"
- Instansi: "Pokjawas Jember"
- Jenis Sertifikat: Peserta
- Simpan

**3. Generate Sertifikat:**
- Menu: Generate Sertifikat
- Pilih kegiatan
- Pilih template (pilih salah satu dari 5 bawaan)
- Klik **Preview** → Lihat preview sertifikat
- Klik **Generate & Download** → PDF terdownload ✅

**4. Test Verifikasi:**
- Buka PDF yang baru didownload
- Scan QR Code dengan HP
- Atau: Copy kode unik dari sertifikat
- Buka landing page: `http://localhost:5173`
- Masukkan kode → Cek
- Tampil status **Valid** ✅

## 🎯 Fitur Utama yang Bisa Ditest

✅ **Dashboard** - Statistik otomatis
✅ **CRUD Kegiatan** - Tambah/edit/hapus kegiatan
✅ **CRUD Peserta** - Tambah/edit/hapus peserta
✅ **Import CSV** - Upload data peserta massal
✅ **Export CSV** - Download data peserta
✅ **Template** - 5 template bawaan, bisa tambah custom
✅ **Generate PDF** - Single atau batch (ZIP)
✅ **QR Code** - Auto-generate untuk verifikasi
✅ **Verifikasi Publik** - Cek keaslian sertifikat
✅ **Pengaturan** - Kustomisasi format nomor

## 📖 Dokumentasi Lengkap

Jika butuh detail lebih lanjut:

1. **Setup Database:** `SUPABASE_SETUP.md`
2. **Testing Checklist:** `TESTING.md`
3. **Deploy Production:** `DEPLOYMENT.md`
4. **Ringkasan Proyek:** `PROJECT_SUMMARY.md`

## 🐛 Troubleshooting

**Problem: npm install error**
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

**Problem: Login gagal**
- Cek `.env` sudah benar
- Cek user sudah dibuat di Supabase Auth
- Cek email/password sesuai

**Problem: Sertifikat tidak generate**
- Cek peserta sudah ada di kegiatan
- Cek console browser (F12) untuk error
- Cek koneksi Supabase

**Problem: QR Code tidak muncul**
```bash
# Install ulang qrcode library
npm install qrcode
```

**Problem: PDF blank**
```bash
# Install ulang html2canvas
npm install html2canvas
```

## 🚀 Deploy ke Production

Ketika aplikasi sudah OK di lokal, deploy ke GitHub Pages:

```bash
# 1. Push ke GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Subariyanto/e-sertifikat-pokjawas.git
git push -u origin main

# 2. Install gh-pages
npm install -D gh-pages

# 3. Deploy
npm run deploy
```

Buka `DEPLOYMENT.md` untuk panduan lengkap deploy.

## 💡 Tips

1. **Backup Database:** Export CSV peserta & kegiatan secara rutin
2. **Backup Supabase:** Aktifkan auto-backup di Supabase Dashboard
3. **Testing:** Test di laptop dulu sebelum kasih ke user
4. **Custom Domain:** Beli domain jika mau URL profesional (opsional)
5. **Password:** Ganti password admin default setelah setup

## 📞 Butuh Bantuan?

Jika ada error atau pertanyaan:
1. Cek file `TESTING.md` untuk troubleshooting
2. Cek console browser (F12) untuk error detail
3. Screenshot error dan tanyakan di Discord

## ✅ Checklist Setup

- [ ] npm install berhasil
- [ ] Supabase project dibuat
- [ ] SQL schema dijalankan
- [ ] Storage bucket dibuat
- [ ] .env file dibuat dengan API keys yang benar
- [ ] Admin user dibuat
- [ ] npm run dev berhasil
- [ ] Login berhasil
- [ ] Generate sertifikat berhasil
- [ ] PDF terdownload
- [ ] QR Code bisa di-scan
- [ ] Verifikasi publik berhasil

Kalau semua ✅ → **Aplikasi siap digunakan!** 🎉

---

Selamat mencoba, Pak Yanto! 🚀

Jika ada pertanyaan, silakan tanya di Discord #setifikat-bimtek.
