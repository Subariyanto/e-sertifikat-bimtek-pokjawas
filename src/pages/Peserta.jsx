import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { Plus, Edit, Trash2, Users, Upload, Download, Search } from 'lucide-react'
import Papa from 'papaparse'
import { exportToCSV } from '../lib/utils'

export default function Peserta() {
  const [peserta, setPeserta] = useState([])
  const [kegiatan, setKegiatan] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterKegiatan, setFilterKegiatan] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    kegiatan_id: '',
    nama_lengkap: '',
    nip_nik: '',
    jabatan: '',
    instansi: '',
    email: '',
    no_hp: '',
    jenis_sertifikat: 'Peserta',
    status_kehadiran: 'hadir'
  })

  const jenisSertifikat = ['Peserta', 'Narasumber', 'Panitia', 'Moderator', 'Penghargaan']

  useEffect(() => {
    fetchKegiatan()
    fetchPeserta()
  }, [])

  const fetchKegiatan = async () => {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .eq('status', 'aktif')
        .order('created_at', { ascending: false })

      if (error) throw error
      setKegiatan(data || [])
    } catch (error) {
      console.error('Error fetching kegiatan:', error)
    }
  }

  const fetchPeserta = async () => {
    try {
      const { data, error } = await supabase
        .from('peserta')
        .select(`
          *,
          kegiatan:kegiatan_id (
            nama_kegiatan,
            jenis_kegiatan
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPeserta(data || [])
    } catch (error) {
      console.error('Error fetching peserta:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { error } = await supabase
          .from('peserta')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('peserta')
          .insert([formData])
        if (error) throw error
      }
      
      setShowModal(false)
      resetForm()
      fetchPeserta()
    } catch (error) {
      console.error('Error saving peserta:', error)
      alert('Gagal menyimpan peserta')
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData({
      kegiatan_id: item.kegiatan_id,
      nama_lengkap: item.nama_lengkap,
      nip_nik: item.nip_nik || '',
      jabatan: item.jabatan || '',
      instansi: item.instansi || '',
      email: item.email || '',
      no_hp: item.no_hp || '',
      jenis_sertifikat: item.jenis_sertifikat,
      status_kehadiran: item.status_kehadiran
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus peserta ini?')) return
    
    try {
      const { error } = await supabase
        .from('peserta')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchPeserta()
    } catch (error) {
      console.error('Error deleting peserta:', error)
      alert('Gagal menghapus peserta')
    }
  }

  const handleImportCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const validData = results.data
            .filter(row => row.nama_lengkap && row.nama_lengkap.trim())
            .map(row => ({
              kegiatan_id: formData.kegiatan_id,
              nama_lengkap: row.nama_lengkap?.trim() || '',
              nip_nik: row.nip_nik?.trim() || '',
              jabatan: row.jabatan?.trim() || '',
              instansi: row.instansi?.trim() || '',
              email: row.email?.trim() || '',
              no_hp: row.no_hp?.trim() || '',
              jenis_sertifikat: row.jenis_sertifikat?.trim() || 'Peserta',
              status_kehadiran: 'hadir'
            }))

          if (validData.length === 0) {
            alert('Tidak ada data valid untuk diimport')
            return
          }

          const { error } = await supabase
            .from('peserta')
            .insert(validData)

          if (error) throw error
          
          alert(`Berhasil import ${validData.length} peserta`)
          setShowImportModal(false)
          resetForm()
          fetchPeserta()
        } catch (error) {
          console.error('Error importing CSV:', error)
          alert('Gagal import data')
        }
      },
      error: (error) => {
        console.error('CSV parse error:', error)
        alert('Gagal membaca file CSV')
      }
    })
  }

  const handleExport = () => {
    const exportData = filteredPeserta.map(p => ({
      nama_lengkap: p.nama_lengkap,
      nip_nik: p.nip_nik || '',
      jabatan: p.jabatan || '',
      instansi: p.instansi || '',
      email: p.email || '',
      no_hp: p.no_hp || '',
      jenis_sertifikat: p.jenis_sertifikat,
      kegiatan: p.kegiatan?.nama_kegiatan || '',
      status_kehadiran: p.status_kehadiran
    }))
    
    exportToCSV(exportData, `peserta_${new Date().toISOString().slice(0,10)}.csv`)
  }

  const resetForm = () => {
    setFormData({
      kegiatan_id: '',
      nama_lengkap: '',
      nip_nik: '',
      jabatan: '',
      instansi: '',
      email: '',
      no_hp: '',
      jenis_sertifikat: 'Peserta',
      status_kehadiran: 'hadir'
    })
    setEditingId(null)
  }

  const filteredPeserta = peserta.filter(p => {
    const matchKegiatan = !filterKegiatan || p.kegiatan_id === filterKegiatan
    const matchSearch = !searchTerm || 
      p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.instansi && p.instansi.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchKegiatan && matchSearch
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-kemenag-green mb-2">Data Peserta</h1>
              <p className="text-gray-600">Kelola data peserta kegiatan</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload size={20} />
                Import CSV
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={20} />
                Export
              </button>
              <button
                onClick={() => {
                  resetForm()
                  setShowModal(true)
                }}
                className="flex items-center gap-2 bg-kemenag-green text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
              >
                <Plus size={20} />
                Tambah Peserta
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter Kegiatan</label>
                <select
                  value={filterKegiatan}
                  onChange={(e) => setFilterKegiatan(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                >
                  <option value="">Semua Kegiatan</option>
                  {kegiatan.map(k => (
                    <option key={k.id} value={k.id}>{k.nama_kegiatan}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cari Peserta</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama atau instansi..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kemenag-green mx-auto"></div>
              </div>
            ) : filteredPeserta.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users size={48} className="mx-auto mb-3 text-gray-300" />
                <p>Belum ada data peserta</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Lengkap</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Instansi</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Kegiatan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Jenis Sertifikat</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPeserta.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.nama_lengkap}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.instansi || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.kegiatan?.nama_kegiatan || '-'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            {item.jenis_sertifikat}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.status_kehadiran === 'hadir' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status_kehadiran}
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
                {editingId ? 'Edit Peserta' : 'Tambah Peserta'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kegiatan *</label>
                <select
                  value={formData.kegiatan_id}
                  onChange={(e) => setFormData({...formData, kegiatan_id: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIP/NIK</label>
                  <input
                    type="text"
                    value={formData.nip_nik}
                    onChange={(e) => setFormData({...formData, nip_nik: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instansi</label>
                <input
                  type="text"
                  value={formData.instansi}
                  onChange={(e) => setFormData({...formData, instansi: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No HP</label>
                  <input
                    type="text"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({...formData, no_hp: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Sertifikat *</label>
                  <select
                    value={formData.jenis_sertifikat}
                    onChange={(e) => setFormData({...formData, jenis_sertifikat: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                    required
                  >
                    {jenisSertifikat.map(jenis => (
                      <option key={jenis} value={jenis}>{jenis}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Kehadiran</label>
                  <select
                    value={formData.status_kehadiran}
                    onChange={(e) => setFormData({...formData, status_kehadiran: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  >
                    <option value="hadir">Hadir</option>
                    <option value="tidak_hadir">Tidak Hadir</option>
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

      {/* Modal Import */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-kemenag-green">Import Peserta CSV</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kegiatan *</label>
                <select
                  value={formData.kegiatan_id}
                  onChange={(e) => setFormData({...formData, kegiatan_id: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">File CSV</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  disabled={!formData.kegiatan_id}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-2">Format CSV:</p>
                <p>nama_lengkap, nip_nik, jabatan, instansi, email, no_hp, jenis_sertifikat</p>
              </div>

              <button
                onClick={() => {
                  setShowImportModal(false)
                  resetForm()
                }}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
