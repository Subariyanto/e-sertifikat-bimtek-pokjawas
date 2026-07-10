# Panduan Setup Supabase untuk e-Sertifikat Bimtek Pokjawas

## Langkah 1: Buat Project Supabase

1. Kunjungi [supabase.com](https://supabase.com)
2. Sign in atau buat akun baru
3. Klik **New Project**
4. Isi:
   - Name: `e-sertifikat-pokjawas` (atau nama lain)
   - Database Password: (simpan password ini, akan dibutuhkan)
   - Region: Pilih terdekat (Singapore untuk Indonesia)
5. Klik **Create new project**
6. Tunggu ~2 menit sampai project siap

## Langkah 2: Dapatkan API Keys

1. Di dashboard project, buka **Settings** (ikon gear) → **API**
2. Salin:
   - **Project URL** (format: `https://xxxxx.supabase.co`)
   - **anon public** key

## Langkah 3: Jalankan SQL Schema

1. Di sidebar, klik **SQL Editor**
2. Klik **New query**
3. Copy seluruh isi file `supabase-schema.sql` dari project
4. Paste ke editor
5. Klik **Run** (atau tekan Ctrl+Enter)
6. Pastikan muncul "Success. No rows returned"

Schema ini akan membuat:
- 7 tabel (profiles, kegiatan, peserta, templates, sertifikat, verifikasi_logs, pengaturan)
- Indexes untuk performa
- Row Level Security (RLS) policies
- Triggers untuk auto-update timestamp
- 5 template sertifikat bawaan
- 1 contoh kegiatan

## Langkah 4: Setup Storage Bucket

1. Di sidebar, klik **Storage**
2. Klik **Create a new bucket**
3. Isi:
   - Name: `sertifikat-files`
   - Public bucket: **ON** (centang)
4. Klik **Create bucket**

### Konfigurasi Bucket Policies

1. Klik bucket `sertifikat-files`
2. Klik tab **Policies**
3. Klik **New Policy** → **For full customization**
4. Tambahkan 2 policy:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public can read sertifikat files"
ON storage.objects FOR SELECT
USING (bucket_id = 'sertifikat-files');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sertifikat-files' 
  AND auth.role() = 'authenticated'
);
```

## Langkah 5: Setup Environment Variables

1. Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Ganti `xxxxx` dan `your-anon-public-key` dengan nilai dari Langkah 2.

## Langkah 6: Daftar Admin Pertama

### Cara 1: Via Aplikasi (Recommended)

1. Jalankan aplikasi: `npm run dev`
2. Buka `http://localhost:5173`
3. Belum ada fitur register di UI, jadi gunakan Cara 2

### Cara 2: Via Supabase Dashboard

1. Di Supabase dashboard, klik **Authentication** → **Users**
2. Klik **Add user** → **Create new user**
3. Isi:
   - Email: `admin@pokjawas.com` (atau email Anda)
   - Password: `admin123` (atau password kuat)
   - Auto Confirm User: **ON** (centang)
4. Klik **Create user**

Trigger `handle_new_user()` akan otomatis membuat profile dengan role admin.

## Langkah 7: Verifikasi Setup

1. Buka aplikasi: `http://localhost:5173`
2. Klik **Login Admin**
3. Login dengan email/password dari Langkah 6
4. Jika berhasil masuk dashboard → Setup berhasil! ✅

## Langkah 8: Tambahkan Data Contoh Peserta (Opsional)

Jika ingin menambahkan peserta untuk kegiatan contoh:

1. Buka **SQL Editor**
2. Jalankan query:

```sql
-- Dapatkan ID kegiatan pertama
SELECT id, nama_kegiatan FROM kegiatan LIMIT 1;

-- Ganti <KEGIATAN_ID> dengan UUID dari query di atas
INSERT INTO peserta (kegiatan_id, nama_lengkap, instansi, jenis_sertifikat) VALUES
('<KEGIATAN_ID>', 'Ahmad Fauzi', 'MI Darussalam Jember', 'Peserta'),
('<KEGIATAN_ID>', 'Siti Aminah', 'MTs Negeri Jember', 'Peserta'),
('<KEGIATAN_ID>', 'Nur Hasan', 'MA Al-Hikmah Jember', 'Peserta');
```

## Troubleshooting

### Error: "Invalid API key"
- Cek ulang `.env`, pastikan URL dan key benar
- Restart dev server setelah edit `.env`

### Error: "relation does not exist"
- Schema belum dijalankan, ulangi Langkah 3
- Pastikan tidak ada error saat run SQL

### Error: "new row violates row-level security policy"
- RLS policy belum benar, cek Langkah 3
- Pastikan user sudah authenticated

### Login gagal terus
- Cek email/password benar
- Cek di Supabase Auth → Users, pastikan user ada
- Cek browser console untuk error detail

### Storage upload gagal
- Pastikan bucket sudah dibuat (Langkah 4)
- Pastikan bucket public dan policies sudah ditambahkan

## Tips Keamanan

1. **Jangan commit `.env`** ke Git (sudah ada di `.gitignore`)
2. **Ganti password default** admin setelah login pertama
3. **Gunakan password kuat** untuk database Supabase
4. **Batasi akses** Supabase dashboard hanya untuk admin

## Update Schema di Production

Jika perlu update schema setelah deploy:

1. Backup data: Table Editor → Export sebagai CSV
2. Jalankan SQL perubahan di SQL Editor
3. Test di dev environment dulu sebelum production

---

Setup selesai! Anda siap menggunakan aplikasi e-Sertifikat Bimtek Pokjawas.
