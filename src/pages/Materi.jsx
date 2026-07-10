import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { Plus, Edit, Trash2, BookOpen, Search } from 'lucide-react'

export default function Materi() {
  const [materi, setMateri] = useState([])
  const [kegiatan, setKegiatan] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterKegiatan, setFilterKegiatan] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    kegiatan_id: '',
    judul_materi: '',
    nama_pemateri: '',
    jumlah_jp: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [materiRes, kegiatanRes] = await Promise.all([
        supabase.from('materi').select('*').order('created_at', { ascending: true }),
        supabase.from('kegiatan').select('*').order('created_at', { ascending: false })
      ])
      if (materiRes.error) throw materiRes.error
      if (kegiatanRes.error) throw kegiatanRes.error
      setMateri(materiRes.data || [])
      setKegiatan(kegiatanRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ kegiatan_id: '', judul_materi: '', nama_pemateri: '', jumlah_jp: '' })
    setEditingId(null)
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        kegiatan_id: item.kegiatan_id || '',
        judul_materi: item.judul_materi,
        nama_pemateri: item.nama_pemateri,
        jumlah_jp: item.jumlah_jp
      })
      setEditingId(item.id)
    } else {
      resetForm()
      if (filterKegiatan) setFormData(f => ({ ...f, kegiatan_id: filterKegiatan }))
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.kegiatan_id) {
      alert('Pilih kegiatan terlebih dahulu')
      return
    }
    try {
      const payload = {
        ...formData,
        jumlah_jp: parseInt(formData.jumlah_jp) || 0
      }
      if (editingId) {
        const { error } = await supabase.from('materi').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('materi').insert([payload])
        if (error) throw error
      }
      handleCloseModal()
      fetchData()
    } catch (error) {
      console.error('Error saving materi:', error)
      alert('Gagal menyimpan data: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus materi ini?')) return
    try {
      const { error } = await supabase.from('materi').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting materi:', error)
      alert('Gagal menghapus data: ' + error.message)
    }
  }

  const filtered = materi.filter(m => {
    const matchKegiatan = filterKegiatan ? m.kegiatan_id === filterKegiatan : true
    const matchSearch = searchTerm
      ? m.judul_materi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.nama_pemateri.toLowerCase().includes(searchTerm.toLowerCase())
      : true
    return matchKegiatan && matchSearch
  })

  const totalJP = filtered.reduce((sum, m) => sum + (parseInt(m.jumlah_jp) || 0), 0)

  const getNamaKegiatan = (id) => {
    const k = kegiatan.find(k => k.id === id)
    return k ? k.nama_kegiatan : '-'
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-kemenag-green mb-2">Materi Bimtek</h1>
              <p className="text-gray-600">Kelola materi dan pemateri kegiatan bimbingan teknis</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-kemenag-green text-white px-5 py-2.5 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <Plus size={20} />
              Tambah Materi
            </button>
          </div>

          {/* Filter & Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Kegiatan</label>
                <select
                  value={filterKegiatan}
                  onChange={e => setFilterKegiatan(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                >
                  <option value="">Semua Kegiatan</option>
                  {kegiatan.map(k => (
                    <option key={k.id} value={k.id}>{k.nama_kegiatan}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cari Materi</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Judul materi atau pemateri..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <BookOpen size={20} className="text-kemenag-green" />
              <span className="font-semibold text-gray-800">
                Daftar Materi {filterKegiatan && `— ${getNamaKegiatan(filterKegiatan)}`}
              </span>
              <span className="ml-auto text-sm text-gray-500">{filtered.length} materi</span>
            </div>

            {filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                <p>Belum ada materi. Tambahkan materi kegiatan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Materi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemateri</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kegiatan</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">JP</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{m.judul_materi}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{m.nama_pemateri}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{getNamaKegiatan(m.kegiatan_id)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-kemenag-green/10 text-kemenag-green">
                            {m.jumlah_jp} JP
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenModal(m)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-kemenag-green/5 border-t-2 border-kemenag-green/20">
                    <tr>
                      <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-700 text-right">Total Jam Pelajaran:</td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-kemenag-green text-white">
                          {totalJP} JP
                        </span>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Materi' : 'Tambah Materi'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan *</label>
                <select
                  value={formData.kegiatan_id}
                  onChange={e => setFormData(f => ({ ...f, kegiatan_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  required
                >
                  <option value="">Pilih Kegiatan</option>
                  {kegiatan.map(k => (
                    <option key={k.id} value={k.id}>{k.nama_kegiatan}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Materi *</label>
                <input
                  type="text"
                  value={formData.judul_materi}
                  onChange={e => setFormData(f => ({ ...f, judul_materi: e.target.value }))}
                  placeholder="Contoh: Kebijakan Pengawasan Madrasah"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemateri *</label>
                <input
                  type="text"
                  value={formData.nama_pemateri}
                  onChange={e => setFormData(f => ({ ...f, nama_pemateri: e.target.value }))}
                  placeholder="Contoh: Dr. H. Ahmad Syafi'i, M.Pd."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah JP *</label>
                <input
                  type="number"
                  value={formData.jumlah_jp}
                  onChange={e => setFormData(f => ({ ...f, jumlah_jp: e.target.value }))}
                  placeholder="Jumlah jam pelajaran"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-kemenag-green text-white rounded-lg hover:bg-emerald-800 transition-colors"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Materi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
