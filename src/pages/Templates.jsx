import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { Plus, Edit, Trash2, Copy, Eye, Layout } from 'lucide-react'

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nama_template: '',
    kategori_template: 'Formal Hijau Emas',
    warna_utama: '#064E3B',
    warna_sekunder: '#D4AF37',
    orientasi: 'landscape',
    status: 'aktif'
  })

  const kategoriOptions = [
    'Formal Hijau Emas',
    'Modern Navy Gold',
    'Islami Emerald Gold',
    'Minimalis Premium',
    'Sertifikat Narasumber',
    'Sertifikat Panitia',
    'Sertifikat Penghargaan'
  ]

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { error } = await supabase
          .from('templates')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('templates')
          .insert([formData])
        if (error) throw error
      }
      
      setShowModal(false)
      resetForm()
      fetchTemplates()
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Gagal menyimpan template')
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData({
      nama_template: item.nama_template,
      kategori_template: item.kategori_template,
      warna_utama: item.warna_utama || '#064E3B',
      warna_sekunder: item.warna_sekunder || '#D4AF37',
      orientasi: item.orientasi || 'landscape',
      status: item.status
    })
    setShowModal(true)
  }

  const handleDuplicate = async (item) => {
    try {
      const newTemplate = {
        nama_template: `${item.nama_template} (Copy)`,
        kategori_template: item.kategori_template,
        warna_utama: item.warna_utama,
        warna_sekunder: item.warna_sekunder,
        desain_template: item.desain_template,
        background_url: item.background_url,
        logo_kiri_url: item.logo_kiri_url,
        logo_kanan_url: item.logo_kanan_url,
        tanda_tangan_1_url: item.tanda_tangan_1_url,
        tanda_tangan_2_url: item.tanda_tangan_2_url,
        stempel_url: item.stempel_url,
        posisi_qr: item.posisi_qr,
        posisi_logo: item.posisi_logo,
        posisi_ttd: item.posisi_ttd,
        orientasi: item.orientasi,
        status: 'aktif'
      }

      const { error } = await supabase
        .from('templates')
        .insert([newTemplate])

      if (error) throw error
      fetchTemplates()
      alert('Template berhasil diduplikasi')
    } catch (error) {
      console.error('Error duplicating template:', error)
      alert('Gagal menduplikasi template')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus template ini?')) return
    
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Gagal menghapus template')
    }
  }

  const resetForm = () => {
    setFormData({
      nama_template: '',
      kategori_template: 'Formal Hijau Emas',
      warna_utama: '#064E3B',
      warna_sekunder: '#D4AF37',
      orientasi: 'landscape',
      status: 'aktif'
    })
    setEditingId(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-kemenag-green mb-2">Template Sertifikat</h1>
              <p className="text-gray-600">Kelola desain template sertifikat</p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="flex items-center gap-2 bg-kemenag-green text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <Plus size={20} />
              Tambah Template
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kemenag-green mx-auto"></div>
              </div>
            ) : templates.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Layout size={48} className="mx-auto mb-3 text-gray-300" />
                <p>Belum ada template</p>
              </div>
            ) : (
              templates.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Preview Area */}
                  <div 
                    className="h-40 flex items-center justify-center text-white font-bold text-xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${item.warna_utama} 0%, ${item.warna_sekunder} 100%)` 
                    }}
                  >
                    {item.nama_template}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2">{item.nama_template}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.kategori_template}</p>

                    <div className="flex gap-2 mb-3">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <div 
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: item.warna_utama }}
                        />
                        Utama
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <div 
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: item.warna_sekunder }}
                        />
                        Aksen
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1 p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicate(item)}
                        className="flex-1 flex items-center justify-center gap-1 p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors text-sm"
                      >
                        <Copy size={16} />
                        Duplikat
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-kemenag-green">
                {editingId ? 'Edit Template' : 'Tambah Template'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Template *</label>
                <input
                  type="text"
                  value={formData.nama_template}
                  onChange={(e) => setFormData({...formData, nama_template: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Template *</label>
                <select
                  value={formData.kategori_template}
                  onChange={(e) => setFormData({...formData, kategori_template: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  required
                >
                  {kategoriOptions.map(kat => (
                    <option key={kat} value={kat}>{kat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warna Utama *</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.warna_utama}
                      onChange={(e) => setFormData({...formData, warna_utama: e.target.value})}
                      className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.warna_utama}
                      onChange={(e) => setFormData({...formData, warna_utama: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                      placeholder="#064E3B"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warna Sekunder *</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.warna_sekunder}
                      onChange={(e) => setFormData({...formData, warna_sekunder: e.target.value})}
                      className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.warna_sekunder}
                      onChange={(e) => setFormData({...formData, warna_sekunder: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                      placeholder="#D4AF37"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Orientasi</label>
                  <select
                    value={formData.orientasi}
                    onChange={(e) => setFormData({...formData, orientasi: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  >
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-1">Catatan:</p>
                <p>Upload logo, tanda tangan, dan stempel dapat dilakukan setelah template disimpan melalui halaman Pengaturan.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-kemenag-green text-white py-2 rounded-lg font-semibold hover:bg-emerald-800 transition-colors"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
