import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { Plus, Edit, Trash2, Copy, Layout, Upload, ImageIcon, X } from 'lucide-react'

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nama_template: '',
    kategori_template: 'Formal Hijau Emas',
    warna_utama: '#064E3B',
    warna_sekunder: '#D4AF37',
    orientasi: 'landscape',
    status: 'aktif'
  })

  // Upload template state
  const [uploadData, setUploadData] = useState({
    nama_template: '',
    background_image: '',
    orientasi: 'landscape',
    // Text positions (percentage of width/height)
    pos_nama_y: 35,
    pos_nomor_y: 18,
    pos_narasi_y: 52,
    pos_qr_x: 5,
    pos_qr_y: 82,
    pos_ttd_x: 70,
    pos_ttd_y: 82,
    // Font settings
    font_nama_size: 28,
    font_nama_color: '#064E3B',
    font_narasi_size: 11,
    font_narasi_color: '#333333',
    font_nomor_size: 9,
    font_nomor_color: '#064E3B',
    // TTD info
    nama_ttd: '',
    jabatan_ttd: 'Ketua Pokjawas Kab. Jember',
    // QR size
    qr_size: 70,
    status: 'aktif'
  })
  const fileInputRef = useRef(null)

  const kategoriOptions = [
    'Formal Hijau Emas',
    'Modern Navy Gold',
    'Islami Emerald Gold',
    'Minimalis Premium',
    'Sertifikat Narasumber',
    'Sertifikat Panitia',
    'Sertifikat Penghargaan',
    'Custom Upload'
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
    if (item.background_image) {
      // Edit uploaded template
      setEditingId(item.id)
      setUploadData({
        nama_template: item.nama_template,
        background_image: item.background_image,
        orientasi: item.orientasi || 'landscape',
        pos_nama_y: item.pos_nama_y || 35,
        pos_nomor_y: item.pos_nomor_y || 18,
        pos_narasi_y: item.pos_narasi_y || 52,
        pos_qr_x: item.pos_qr_x || 5,
        pos_qr_y: item.pos_qr_y || 82,
        pos_ttd_x: item.pos_ttd_x || 70,
        pos_ttd_y: item.pos_ttd_y || 82,
        font_nama_size: item.font_nama_size || 28,
        font_nama_color: item.font_nama_color || '#064E3B',
        font_narasi_size: item.font_narasi_size || 11,
        font_narasi_color: item.font_narasi_color || '#333333',
        font_nomor_size: item.font_nomor_size || 9,
        font_nomor_color: item.font_nomor_color || '#064E3B',
        nama_ttd: item.nama_ttd || '',
        jabatan_ttd: item.jabatan_ttd || 'Ketua Pokjawas Kab. Jember',
        qr_size: item.qr_size || 70,
        status: item.status || 'aktif'
      })
      setShowUploadModal(true)
    } else {
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
  }

  const handleDuplicate = async (item) => {
    try {
      const newTemplate = { ...item }
      delete newTemplate.id
      newTemplate.nama_template = `${item.nama_template} (Copy)`
      newTemplate.status = 'aktif'
      newTemplate.created_at = new Date().toISOString()

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.match(/image\/(jpeg|jpg|png)/i)) {
      alert('File harus JPG atau PNG')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadData({ ...uploadData, background_image: event.target.result })
    }
    reader.readAsDataURL(file)
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    
    if (!uploadData.nama_template.trim()) {
      alert('Nama template harus diisi')
      return
    }
    if (!uploadData.background_image) {
      alert('Silakan upload gambar background')
      return
    }

    try {
      const templateData = {
        nama_template: uploadData.nama_template,
        kategori_template: 'Custom Upload',
        background_image: uploadData.background_image,
        orientasi: uploadData.orientasi,
        warna_utama: uploadData.font_nama_color,
        warna_sekunder: '#D4AF37',
        pos_nama_y: Number(uploadData.pos_nama_y),
        pos_nomor_y: Number(uploadData.pos_nomor_y),
        pos_narasi_y: Number(uploadData.pos_narasi_y),
        pos_qr_x: Number(uploadData.pos_qr_x),
        pos_qr_y: Number(uploadData.pos_qr_y),
        pos_ttd_x: Number(uploadData.pos_ttd_x),
        pos_ttd_y: Number(uploadData.pos_ttd_y),
        font_nama_size: Number(uploadData.font_nama_size),
        font_nama_color: uploadData.font_nama_color,
        font_narasi_size: Number(uploadData.font_narasi_size),
        font_narasi_color: uploadData.font_narasi_color,
        font_nomor_size: Number(uploadData.font_nomor_size),
        font_nomor_color: uploadData.font_nomor_color,
        nama_ttd: uploadData.nama_ttd,
        jabatan_ttd: uploadData.jabatan_ttd,
        qr_size: Number(uploadData.qr_size),
        status: uploadData.status
      }

      if (editingId) {
        const { error } = await supabase
          .from('templates')
          .update(templateData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        templateData.created_at = new Date().toISOString()
        const { error } = await supabase
          .from('templates')
          .insert([templateData])
        if (error) throw error
      }

      setShowUploadModal(false)
      resetUploadForm()
      fetchTemplates()
      alert(editingId ? 'Template berhasil diupdate!' : 'Template berhasil ditambahkan!')
    } catch (error) {
      console.error('Error saving upload template:', error)
      alert('Gagal menyimpan template: ' + error.message)
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

  const resetUploadForm = () => {
    setUploadData({
      nama_template: '',
      background_image: '',
      orientasi: 'landscape',
      pos_nama_y: 35,
      pos_nomor_y: 18,
      pos_narasi_y: 52,
      pos_qr_x: 5,
      pos_qr_y: 82,
      pos_ttd_x: 70,
      pos_ttd_y: 82,
      font_nama_size: 28,
      font_nama_color: '#064E3B',
      font_narasi_size: 11,
      font_narasi_color: '#333333',
      font_nomor_size: 9,
      font_nomor_color: '#064E3B',
      nama_ttd: '',
      jabatan_ttd: 'Ketua Pokjawas Kab. Jember',
      qr_size: 70,
      status: 'aktif'
    })
    setEditingId(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isLandscape = uploadData.orientasi === 'landscape'

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
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetUploadForm()
                  setShowUploadModal(true)
                }}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Upload size={20} />
                Upload Gambar
              </button>
              <button
                onClick={() => {
                  resetForm()
                  setShowModal(true)
                }}
                className="flex items-center gap-2 bg-kemenag-green text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
              >
                <Plus size={20} />
                Template Warna
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <ImageIcon className="text-purple-600 flex-shrink-0" size={24} />
              <div className="text-sm text-purple-800">
                <p className="font-semibold mb-1">Upload Template Gambar (JPG/PNG)</p>
                <p>Desain sertifikat di Canva/Photoshop/coreldraw → export JPG/PNG → upload di sini. Posisi teks (nama, nomor, narasi, QR, TTD) bisa diatur sendiri.</p>
              </div>
            </div>
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
                  {item.background_image ? (
                    <div 
                      className="h-40 bg-gray-100 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${item.background_image})` }}
                    >
                      <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                        Custom Upload
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="h-40 flex items-center justify-center text-white font-bold text-xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${item.warna_utama} 0%, ${item.warna_sekunder} 100%)` 
                      }}
                    >
                      {item.nama_template}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2">{item.nama_template}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.kategori_template}</p>

                    {!item.background_image && (
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
                    )}

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

      {/* Modal Form - Template Warna (original) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-kemenag-green">
                {editingId ? 'Edit Template' : 'Tambah Template Warna'}
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

      {/* Modal Upload Gambar */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-purple-600">
                {editingId ? 'Edit Template Upload' : 'Upload Template Gambar'}
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  resetUploadForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              {/* Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Background (JPG/PNG, max 5MB) *</label>
                {uploadData.background_image ? (
                  <div className="relative">
                    <div 
                      className={`w-full border-2 border-purple-300 rounded-lg overflow-hidden bg-gray-100 ${isLandscape ? 'h-48' : 'h-64'}`}
                      style={{ 
                        backgroundImage: `url(${uploadData.background_image})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setUploadData({...uploadData, background_image: ''})}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center cursor-pointer hover:bg-purple-50 transition-colors"
                  >
                    <Upload className="mx-auto mb-3 text-purple-400" size={40} />
                    <p className="text-gray-600 font-medium">Klik untuk pilih file</p>
                    <p className="text-sm text-gray-400 mt-1">JPG atau PNG, maksimal 5MB</p>
                    <p className="text-xs text-gray-400 mt-2">Rekomendasi: A4 Landscape (3508 × 2480 px)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Nama Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Template *</label>
                <input
                  type="text"
                  value={uploadData.nama_template}
                  onChange={(e) => setUploadData({...uploadData, nama_template: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="contoh: Sertifikat Bimtek Canva 1"
                  required
                />
              </div>

              {/* Orientasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orientasi</label>
                <select
                  value={uploadData.orientasi}
                  onChange={(e) => setUploadData({...uploadData, orientasi: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="landscape">Landscape (Horizontal)</option>
                  <option value="portrait">Portrait (Vertikal)</option>
                </select>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">⚙️ Pengaturan Posisi Teks</h3>
                <p className="text-xs text-gray-500 mb-4">Atur posisi teks dalam persen (%) dari tepi kiri/atas sertifikat. Preview tersedia di menu Generate Sertifikat.</p>

                {/* Posisi Nomor Sertifikat */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Nomor Sertifikat</p>
                  <div>
                    <label className="text-xs text-gray-500">Posisi dari atas (%):</label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={uploadData.pos_nomor_y}
                      onChange={(e) => setUploadData({...uploadData, pos_nomor_y: e.target.value})}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-600">{uploadData.pos_nomor_y}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={uploadData.font_nomor_color}
                      onChange={(e) => setUploadData({...uploadData, font_nomor_color: e.target.value})}
                      className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="number"
                      value={uploadData.font_nomor_size}
                      onChange={(e) => setUploadData({...uploadData, font_nomor_size: e.target.value})}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="7"
                      max="16"
                    />
                    <span className="text-xs text-gray-500">pt, warna</span>
                  </div>
                </div>

                {/* Posisi Nama Peserta */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Nama Peserta</p>
                  <div>
                    <label className="text-xs text-gray-500">Posisi dari atas (%):</label>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      value={uploadData.pos_nama_y}
                      onChange={(e) => setUploadData({...uploadData, pos_nama_y: e.target.value})}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-600">{uploadData.pos_nama_y}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={uploadData.font_nama_color}
                      onChange={(e) => setUploadData({...uploadData, font_nama_color: e.target.value})}
                      className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="number"
                      value={uploadData.font_nama_size}
                      onChange={(e) => setUploadData({...uploadData, font_nama_size: e.target.value})}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="16"
                      max="48"
                    />
                    <span className="text-xs text-gray-500">pt, warna</span>
                  </div>
                </div>

                {/* Posisi Narasi */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Narasi Sertifikat</p>
                  <div>
                    <label className="text-xs text-gray-500">Posisi dari atas (%):</label>
                    <input
                      type="range"
                      min="40"
                      max="75"
                      value={uploadData.pos_narasi_y}
                      onChange={(e) => setUploadData({...uploadData, pos_narasi_y: e.target.value})}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-600">{uploadData.pos_narasi_y}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={uploadData.font_narasi_color}
                      onChange={(e) => setUploadData({...uploadData, font_narasi_color: e.target.value})}
                      className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="number"
                      value={uploadData.font_narasi_size}
                      onChange={(e) => setUploadData({...uploadData, font_narasi_size: e.target.value})}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="8"
                      max="16"
                    />
                    <span className="text-xs text-gray-500">pt, warna</span>
                  </div>
                </div>

                {/* Posisi QR Code */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">QR Code Verifikasi</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Kiri (%):</label>
                      <input
                        type="range"
                        min="1"
                        max="40"
                        value={uploadData.pos_qr_x}
                        onChange={(e) => setUploadData({...uploadData, pos_qr_x: e.target.value})}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-600">{uploadData.pos_qr_x}%</span>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Atas (%):</label>
                      <input
                        type="range"
                        min="60"
                        max="95"
                        value={uploadData.pos_qr_y}
                        onChange={(e) => setUploadData({...uploadData, pos_qr_y: e.target.value})}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-600">{uploadData.pos_qr_y}%</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-xs text-gray-500">Ukuran QR (px):</label>
                    <input
                      type="number"
                      value={uploadData.qr_size}
                      onChange={(e) => setUploadData({...uploadData, qr_size: e.target.value})}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="50"
                      max="150"
                    />
                  </div>
                </div>

                {/* Posisi TTD */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tanda Tangan</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Kiri (%):</label>
                      <input
                        type="range"
                        min="50"
                        max="95"
                        value={uploadData.pos_ttd_x}
                        onChange={(e) => setUploadData({...uploadData, pos_ttd_x: e.target.value})}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-600">{uploadData.pos_ttd_x}%</span>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Atas (%):</label>
                      <input
                        type="range"
                        min="60"
                        max="95"
                        value={uploadData.pos_ttd_y}
                        onChange={(e) => setUploadData({...uploadData, pos_ttd_y: e.target.value})}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-600">{uploadData.pos_ttd_y}%</span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={uploadData.nama_ttd}
                      onChange={(e) => setUploadData({...uploadData, nama_ttd: e.target.value})}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="Nama penandatangan (contoh: Subariyanto, S.Pd., M.Pd.I.)"
                    />
                    <input
                      type="text"
                      value={uploadData.jabatan_ttd}
                      onChange={(e) => setUploadData({...uploadData, jabatan_ttd: e.target.value})}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="Jabatan (contoh: Ketua Pokjawas Kab. Jember)"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={uploadData.status}
                  onChange={(e) => setUploadData({...uploadData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  {editingId ? 'Update Template' : 'Simpan Template'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    resetUploadForm()
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
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
