// Utility functions untuk aplikasi e-Sertifikat

// Format tanggal Indonesia
export const formatTanggalIndonesia = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
};

// Konversi bulan ke Romawi
export const bulanKeRomawi = (bulan) => {
  const romawi = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
    7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
  };
  return romawi[bulan] || '';
};

// Generate nomor sertifikat otomatis
export const generateNomorSertifikat = (format, nomorUrut, kodeKegiatan, tanggalTerbit) => {
  const date = new Date(tanggalTerbit || new Date());
  const bulan = date.getMonth() + 1;
  const tahun = date.getFullYear();
  const bulanRomawi = bulanKeRomawi(bulan);
  const nomorPadded = String(nomorUrut).padStart(3, '0');
  
  return format
    .replace('{nomor}', nomorPadded)
    .replace('{kode_kegiatan}', kodeKegiatan || 'BIMTEK')
    .replace('{bulan_romawi}', bulanRomawi)
    .replace('{tahun}', tahun);
};

// Generate kode unik untuk QR
export const generateKodeUnik = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`.toUpperCase();
};

// Parse template placeholder
export const parseTemplatePlaceholder = (text, data) => {
  if (!text) return '';
  let result = text;
  
  Object.keys(data).forEach(key => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), data[key] || '');
  });
  
  return result;
};

// Get narasi default berdasarkan jenis sertifikat
export const getNarasiDefault = (jenisSertifikat) => {
  const narasi = {
    'Peserta': 'Diberikan kepada {{nama_peserta}} dari {{instansi}} sebagai peserta pada kegiatan {{nama_kegiatan}} yang diselenggarakan oleh {{nama_lembaga}} pada tanggal {{tanggal_mulai}} sampai dengan {{tanggal_selesai}} bertempat di {{tempat}} dengan beban {{jumlah_jp}} Jam Pelajaran.',
    'Narasumber': 'Sebagai Narasumber pada kegiatan {{nama_kegiatan}} yang diselenggarakan oleh {{nama_lembaga}} pada tanggal {{tanggal_mulai}} s.d {{tanggal_selesai}} bertempat di {{tempat}}.',
    'Panitia': 'Diberikan kepada {{nama_peserta}} sebagai Panitia Pelaksana pada kegiatan {{nama_kegiatan}} yang diselenggarakan oleh {{nama_lembaga}} pada tanggal {{tanggal_mulai}} sampai dengan {{tanggal_selesai}}.',
    'Moderator': 'Diberikan kepada {{nama_peserta}} sebagai Moderator pada kegiatan {{nama_kegiatan}} yang diselenggarakan oleh {{nama_lembaga}} pada tanggal {{tanggal_mulai}} s.d {{tanggal_selesai}} bertempat di {{tempat}}.',
    'Penghargaan': 'Diberikan kepada {{nama_peserta}} atas kontribusi dan dedikasi dalam mensukseskan kegiatan {{nama_kegiatan}} yang diselenggarakan oleh {{nama_lembaga}}.'
  };
  
  return narasi[jenisSertifikat] || narasi['Peserta'];
};

// Validasi NIP/NIK
export const validateNIPNIK = (value) => {
  if (!value) return true; // optional
  const cleaned = value.replace(/[^0-9]/g, '');
  return cleaned.length === 16 || cleaned.length === 18;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    'valid': 'bg-green-100 text-green-800',
    'tidak_valid': 'bg-red-100 text-red-800',
    'draft': 'bg-gray-100 text-gray-800',
    'aktif': 'bg-blue-100 text-blue-800',
    'nonaktif': 'bg-gray-100 text-gray-800',
    'hadir': 'bg-green-100 text-green-800',
    'tidak_hadir': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Export to CSV (semicolon delimiter for Indonesian Excel compatibility)
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(';'),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(';'))
  ].join('\n');
  
  // BOM for Excel UTF-8 compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Download CSV template for import
export const downloadCSVTemplate = (filename) => {
  const headers = ['nama_lengkap', 'nip_nik', 'jabatan', 'instansi', 'email', 'no_hp', 'jenis_sertifikat'];
  const sampleRow = ['Ahmad Zainuri', '197001011998031001', 'Kepala MI', 'MI Nurul Huda', 'ahmad@email.com', '081234567890', 'Peserta'];
  const csvContent = [
    headers.join(';'),
    sampleRow.map(v => `"${v}"`).join(';')
  ].join('\n');
  
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
