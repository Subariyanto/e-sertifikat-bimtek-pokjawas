-- Supabase SQL Schema untuk e-Sertifikat Bimtek Pokjawas
-- Jalankan script ini di Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: kegiatan
CREATE TABLE IF NOT EXISTS kegiatan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_kegiatan TEXT NOT NULL,
  jenis_kegiatan TEXT NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  tempat TEXT NOT NULL,
  jumlah_jp INTEGER NOT NULL,
  penyelenggara TEXT DEFAULT 'Kelompok Kerja Pengawas Madrasah Kabupaten Jember',
  deskripsi TEXT,
  template_default_id UUID,
  status TEXT DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: peserta
CREATE TABLE IF NOT EXISTS peserta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kegiatan_id UUID REFERENCES kegiatan(id) ON DELETE CASCADE,
  nama_lengkap TEXT NOT NULL,
  nip_nik TEXT,
  jabatan TEXT,
  instansi TEXT,
  email TEXT,
  no_hp TEXT,
  jenis_sertifikat TEXT DEFAULT 'Peserta',
  status_kehadiran TEXT DEFAULT 'hadir',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_template TEXT NOT NULL,
  kategori_template TEXT NOT NULL,
  desain_template JSONB,
  warna_utama TEXT DEFAULT '#064E3B',
  warna_sekunder TEXT DEFAULT '#D4AF37',
  background_url TEXT,
  logo_kiri_url TEXT,
  logo_kanan_url TEXT,
  tanda_tangan_1_url TEXT,
  tanda_tangan_2_url TEXT,
  stempel_url TEXT,
  posisi_qr TEXT DEFAULT 'kanan-bawah',
  posisi_logo TEXT DEFAULT 'atas',
  posisi_ttd TEXT DEFAULT 'bawah',
  orientasi TEXT DEFAULT 'landscape',
  status TEXT DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: sertifikat
CREATE TABLE IF NOT EXISTS sertifikat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kegiatan_id UUID REFERENCES kegiatan(id) ON DELETE CASCADE,
  peserta_id UUID REFERENCES peserta(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  nomor_sertifikat TEXT UNIQUE NOT NULL,
  kode_unik TEXT UNIQUE NOT NULL,
  qr_url TEXT,
  file_pdf_url TEXT,
  status_validasi TEXT DEFAULT 'valid',
  tanggal_terbit DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: verifikasi_logs
CREATE TABLE IF NOT EXISTS verifikasi_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sertifikat_id UUID REFERENCES sertifikat(id) ON DELETE SET NULL,
  kode_unik TEXT NOT NULL,
  waktu_scan TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  status_hasil TEXT
);

-- Table: pengaturan
CREATE TABLE IF NOT EXISTS pengaturan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_lembaga TEXT DEFAULT 'Kelompok Kerja Pengawas Madrasah Kabupaten Jember',
  alamat_lembaga TEXT DEFAULT 'Jember, Jawa Timur',
  nama_ketua TEXT DEFAULT 'Subariyanto, S.Pd., M.Pd.I.',
  jabatan_ketua TEXT DEFAULT 'Ketua Pokjawas Kab. Jember',
  nama_panitia TEXT,
  jabatan_panitia TEXT,
  logo_utama_url TEXT,
  logo_kedua_url TEXT,
  tanda_tangan_ketua_url TEXT,
  tanda_tangan_panitia_url TEXT,
  stempel_url TEXT,
  format_nomor_sertifikat TEXT DEFAULT '{nomor}/{kode_kegiatan}-POKJAWAS/JBR/{bulan_romawi}/{tahun}',
  tema_aplikasi TEXT DEFAULT 'hijau-emas',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes untuk performa
CREATE INDEX idx_kegiatan_status ON kegiatan(status);
CREATE INDEX idx_peserta_kegiatan ON peserta(kegiatan_id);
CREATE INDEX idx_sertifikat_kegiatan ON sertifikat(kegiatan_id);
CREATE INDEX idx_sertifikat_kode_unik ON sertifikat(kode_unik);
CREATE INDEX idx_sertifikat_nomor ON sertifikat(nomor_sertifikat);
CREATE INDEX idx_verifikasi_logs_kode ON verifikasi_logs(kode_unik);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sertifikat ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifikasi_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan ENABLE ROW LEVEL SECURITY;

-- RLS Policies untuk profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies untuk kegiatan
CREATE POLICY "Kegiatan are viewable by authenticated users" ON kegiatan
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Kegiatan are editable by authenticated users" ON kegiatan
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies untuk peserta
CREATE POLICY "Peserta are viewable by authenticated users" ON peserta
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Peserta are editable by authenticated users" ON peserta
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies untuk templates
CREATE POLICY "Templates are viewable by all" ON templates
  FOR SELECT USING (true);
CREATE POLICY "Templates are editable by authenticated users" ON templates
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies untuk sertifikat (publik bisa lihat untuk verifikasi)
CREATE POLICY "Sertifikat are viewable by all" ON sertifikat
  FOR SELECT USING (true);
CREATE POLICY "Sertifikat are editable by authenticated users" ON sertifikat
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies untuk verifikasi_logs (publik bisa insert)
CREATE POLICY "Verifikasi logs are insertable by all" ON verifikasi_logs
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Verifikasi logs are viewable by authenticated users" ON verifikasi_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies untuk pengaturan
CREATE POLICY "Pengaturan are viewable by all" ON pengaturan
  FOR SELECT USING (true);
CREATE POLICY "Pengaturan are editable by authenticated users" ON pengaturan
  FOR ALL USING (auth.role() = 'authenticated');

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers untuk auto-update updated_at
CREATE TRIGGER update_kegiatan_updated_at BEFORE UPDATE ON kegiatan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_peserta_updated_at BEFORE UPDATE ON peserta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sertifikat_updated_at BEFORE UPDATE ON sertifikat
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pengaturan_updated_at BEFORE UPDATE ON pengaturan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert data default pengaturan
INSERT INTO pengaturan (id, nama_lembaga, alamat_lembaga, nama_ketua, jabatan_ketua, format_nomor_sertifikat, tema_aplikasi)
VALUES (
  uuid_generate_v4(),
  'Kelompok Kerja Pengawas Madrasah Kabupaten Jember',
  'Jember, Jawa Timur',
  'Subariyanto, S.Pd., M.Pd.I.',
  'Ketua Pokjawas Kab. Jember',
  '{nomor}/{kode_kegiatan}-POKJAWAS/JBR/{bulan_romawi}/{tahun}',
  'hijau-emas'
)
ON CONFLICT DO NOTHING;

-- Insert 5 template bawaan
INSERT INTO templates (nama_template, kategori_template, warna_utama, warna_sekunder, orientasi, status, desain_template) VALUES
(
  'Formal Hijau Emas',
  'Formal Hijau Emas',
  '#064E3B',
  '#D4AF37',
  'landscape',
  'aktif',
  '{"border": "elegan", "ornamen": "islami", "font_judul": "bold", "font_nama": "extra-bold"}'::jsonb
),
(
  'Modern Navy Gold',
  'Modern Navy Gold',
  '#0F172A',
  '#D4AF37',
  'landscape',
  'aktif',
  '{"border": "tipis", "ornamen": "minimalis", "font_judul": "bold", "font_nama": "extra-bold"}'::jsonb
),
(
  'Islami Emerald Gold',
  'Islami Emerald Gold',
  '#059669',
  '#D4AF37',
  'landscape',
  'aktif',
  '{"border": "geometris", "ornamen": "islami-geometris", "font_judul": "bold", "font_nama": "extra-bold"}'::jsonb
),
(
  'Minimalis Premium',
  'Minimalis Premium',
  '#F3F4F6',
  '#D4AF37',
  'landscape',
  'aktif',
  '{"border": "none", "ornamen": "minimal", "font_judul": "semibold", "font_nama": "bold"}'::jsonb
),
(
  'Sertifikat Narasumber',
  'Sertifikat Narasumber',
  '#064E3B',
  '#D4AF37',
  'landscape',
  'aktif',
  '{"border": "eksklusif", "ornamen": "premium", "font_judul": "extra-bold", "font_nama": "extra-bold"}'::jsonb
);

-- Insert contoh kegiatan
INSERT INTO kegiatan (nama_kegiatan, jenis_kegiatan, tanggal_mulai, tanggal_selesai, tempat, jumlah_jp, penyelenggara, deskripsi, status)
VALUES (
  'Bimbingan Teknis Transformasi Digital Madrasah',
  'Bimtek',
  '2026-07-15',
  '2026-07-15',
  'Jember',
  32,
  'Kelompok Kerja Pengawas Madrasah Kabupaten Jember',
  'Bimbingan teknis untuk meningkatkan kompetensi digital pengawas dan kepala madrasah di era transformasi digital',
  'aktif'
);

-- Insert contoh peserta (akan digunakan setelah kegiatan ada)
-- Catatan: Ganti <KEGIATAN_ID> dengan UUID kegiatan yang sudah dibuat
-- INSERT INTO peserta (kegiatan_id, nama_lengkap, instansi, jenis_sertifikat) VALUES
-- ('<KEGIATAN_ID>', 'Ahmad Fauzi', 'MI Darussalam Jember', 'Peserta'),
-- ('<KEGIATAN_ID>', 'Siti Aminah', 'MTs Negeri Jember', 'Peserta'),
-- ('<KEGIATAN_ID>', 'Nur Hasan', 'MA Al-Hikmah Jember', 'Peserta');

-- Function untuk handle new user (auto create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, nama, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email),
    NEW.email,
    'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk auto-create profile saat user baru register
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
