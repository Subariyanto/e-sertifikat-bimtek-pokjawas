import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { Plus, Edit, Trash2, FileText, Calendar, MapPin } from 'lucide-react'
import { formatTanggalIndonesia } from '../lib/utils'

export default function Kegiatan() {
  const [kegiatan, setKegiatan] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    jenis_kegiatan: 'Bimtek',
    tanggal_mulai: '',
    tanggal_selesai: '',
    tempat: '',
    jumlah_jp: '',
    penyelenggara: 'Kelompok Kerja Pengawas Madrasah Kabupaten Jember',
    deskripsi: '',
    status: 'aktif'
  })

  const jenisKegiatan = ['Bimtek', 'Workshop', 'Seminar', 'Sosialisasi', 'Diklat', 'Pendampingan', 'Pelatihan']

  useEffect(() => {
    fetchKegiatan()
  }, [])

  const fetchKegiatan = async () => {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setKegiatan(data || [])
    } catch (error) {
      console.error('Error fetching kegiatan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { error } = await supabase
          .from('kegiatan')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('kegiatan')
          .insert([formData])
        if (error) throw error
      }
      
      setShowModal(false)
      resetForm()
      fetchKegiatan()
    } catch (error) {
      console.error('Error saving kegiatan:', error)
      alert('Gagal menyimpan kegiatan')
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData({
      nama_kegiatan: item.nama_kegiatan,
      jenis_kegiatan: item.jenis_kegiatan,
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai,
      tempat: item.tempat,
      jumlah_jp: item.jumlah_jp,
      penyelenggara: item.penyelenggara,
      deskripsi: item.deskripsi || '',
      status: item.status
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus kegiatan ini?')) return
    
    try {
      const { error } = await supabase
        .from('kegiatan')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchKegiatan()
    } catch (error) {
      console.error('Error deleting kegiatan:', error)
      alert('Gagal menghapus kegiatan')
    }
  }

  const resetForm = () => {
    setFormData({
      nama_kegiatan: '',
      jenis_kegiatan: 'Bimtek',
      tanggal_mulai: '',
      tanggal_selesai: '',
      tempat: '',
      jumlah_jp: '',
      penyelenggara: 'Kelompok Kerja Pengawas Madrasah Kabupaten Jember',
      deskripsi: '',
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
              <h1 className="text-3xl font-bold text-kemenag-green mb-2">Data Kegiatan</h1>
              <p className="text-gray-600">Kelola data kegiatan Bimtek dan pelatihan</p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="flex items-center gap-2 bg-kemenag-green text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <Plus size={20} />
              Tambah Kegiatan
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kemenag-green mx-auto"></div>
              </div>
            ) : kegiatan.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText size={48} className="mx-auto mb-3 text-gray-300" />
                <p>Belum ada data kegiatan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Kegiatan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Jenis</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tempat</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">JP</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kegiatan.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.nama_kegiatan}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {item.jenis_kegiatan}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.tempat}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.jumlah_jp} JP</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                {editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kegiatan *</label>
                <input
                  type="text"
                  value={formData.nama_kegiatan}
                  onChange={(e) => setFormData({...formData, nama_kegiatan: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kegiatan *</label>
                  <select
                    value={formData.jenis_kegiatan}
                    onChange={(e) => setFormData({...formData, jenis_kegiatan: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                    required
                  >
                    {jenisKegiatan.map(jenis => (
                      <option key={jenis} value={jenis}>{jenis}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah JP *</label>
                  <input
                    type="number"
                    value={formData.jumlah_jp}
                    onChange={(e) => setFormData({...formData, jumlah_jp: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai *</label>
                  <input
                    type="date"
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({...formData, tanggal_mulai: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai *</label>
                  <input
                    type="date"
                    value={formData.tanggal_selesai}
                    onChange={(e) => setFormData({...formData, tanggal_selesai: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tempat *</label>
                <input
                  type="text"
                  value={formData.tempat}
                  onChange={(e) => setFormData({...formData, tempat: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Penyelenggara *</label>
                <input
                  type="text"
                  value={formData.penyelenggara}
                  onChange={(e) => setFormData({...formData, penyelenggara: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  rows="3"
                />
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
