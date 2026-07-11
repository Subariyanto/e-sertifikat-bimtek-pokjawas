import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { Save, Upload } from 'lucide-react'

export default function Pengaturan() {
  const [pengaturan, setPengaturan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nama_lembaga: '',
    alamat_lembaga: '',
    nama_ketua: '',
    jabatan_ketua: '',
    nip_ketua: '',
    nama_panitia: '',
    jabatan_panitia: '',
    format_nomor_sertifikat: '{nomor}/{kode_kegiatan}-POKJAWAS/JBR/{bulan_romawi}/{tahun}',
    tema_aplikasi: 'hijau-emas'
  })

  useEffect(() => {
    fetchPengaturan()
  }, [])

  const fetchPengaturan = async () => {
    try {
      const { data, error } = await supabase
        .from('pengaturan')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setPengaturan(data)
        setFormData({
          nama_lembaga: data.nama_lembaga || '',
          alamat_lembaga: data.alamat_lembaga || '',
          nama_ketua: data.nama_ketua || '',
          jabatan_ketua: data.jabatan_ketua || '',
          nip_ketua: data.nip_ketua || '',
          nama_panitia: data.nama_panitia || '',
          jabatan_panitia: data.jabatan_panitia || '',
          format_nomor_sertifikat: data.format_nomor_sertifikat || '{nomor}/{kode_kegiatan}-POKJAWAS/JBR/{bulan_romawi}/{tahun}',
          tema_aplikasi: data.tema_aplikasi || 'hijau-emas'
        })
      }
    } catch (error) {
      console.error('Error fetching pengaturan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (pengaturan) {
        const { error } = await supabase
          .from('pengaturan')
          .update(formData)
          .eq('id', pengaturan.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('pengaturan')
          .insert([formData])
        if (error) throw error
      }

      alert('Pengaturan berhasil disimpan')
      fetchPengaturan()
    } catch (error) {
      console.error('Error saving pengaturan:', error)
      alert('Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kemenag-green"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-kemenag-green mb-2">Pengaturan</h1>
            <p className="text-gray-600">Konfigurasi aplikasi e-Sertifikat Bimtek Pokjawas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informasi Lembaga */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Lembaga</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lembaga *</label>
                  <input
                    type="text"
                    value={formData.nama_lembaga}
                    onChange={(e) => setFormData({...formData, nama_lembaga: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lembaga</label>
                  <input
                    type="text"
                    value={formData.alamat_lembaga}
                    onChange={(e) => setFormData({...formData, alamat_lembaga: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Pejabat Penandatangan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pejabat Penandatangan</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Ketua</label>
                    <input
                      type="text"
                      value={formData.nama_ketua}
                      onChange={(e) => setFormData({...formData, nama_ketua: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan Ketua</label>
                    <input
                      type="text"
                      value={formData.jabatan_ketua}
                      onChange={(e) => setFormData({...formData, jabatan_ketua: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NIP Ketua</label>
                    <input
                      type="text"
                      value={formData.nip_ketua}
                      onChange={(e) => setFormData({...formData, nip_ketua: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Panitia</label>
                    <input
                      type="text"
                      value={formData.nama_panitia}
                      onChange={(e) => setFormData({...formData, nama_panitia: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan Panitia</label>
                    <input
                      type="text"
                      value={formData.jabatan_panitia}
                      onChange={(e) => setFormData({...formData, jabatan_panitia: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Format Nomor Sertifikat */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Format Nomor Sertifikat</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format Nomor *</label>
                  <input
                    type="text"
                    value={formData.format_nomor_sertifikat}
                    onChange={(e) => setFormData({...formData, format_nomor_sertifikat: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent font-mono"
                    required
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                  <p className="font-semibold mb-2">Placeholder yang tersedia:</p>
                  <ul className="space-y-1">
                    <li><code className="bg-white px-1 rounded">{'{nomor}'}</code> - Nomor urut 3 digit (001, 002, ...)</li>
                    <li><code className="bg-white px-1 rounded">{'{kode_kegiatan}'}</code> - Kode kegiatan (BIMTEK, WORKSHOP, ...)</li>
                    <li><code className="bg-white px-1 rounded">{'{bulan_romawi}'}</code> - Bulan dalam angka Romawi (I-XII)</li>
                    <li><code className="bg-white px-1 rounded">{'{tahun}'}</code> - Tahun 4 digit (2026)</li>
                  </ul>
                  <p className="mt-2">Contoh hasil: <strong>001/BIMTEK-POKJAWAS/JBR/VII/2026</strong></p>
                </div>
              </div>
            </div>

            {/* Upload Assets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Logo & Tanda Tangan</h2>

              <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
                <p className="font-semibold mb-1">Fitur Upload</p>
                <p>Fitur upload logo, tanda tangan, dan stempel akan tersedia setelah konfigurasi Supabase Storage selesai.</p>
                <p className="mt-2">Untuk saat ini, URL file dapat diisi manual setelah upload langsung ke Supabase Storage.</p>
              </div>
            </div>

            {/* Tema */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tema Aplikasi</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Tema</label>
                <select
                  value={formData.tema_aplikasi}
                  onChange={(e) => setFormData({...formData, tema_aplikasi: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                >
                  <option value="hijau-emas">Hijau Emas (Default)</option>
                  <option value="navy-gold">Navy Gold</option>
                  <option value="emerald-gold">Emerald Gold</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-kemenag-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
