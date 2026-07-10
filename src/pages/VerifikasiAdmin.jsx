import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { FileCheck, CheckCircle, XCircle, Eye, Trash2, Search } from 'lucide-react'
import { formatTanggalIndonesia } from '../lib/utils'

export default function VerifikasiAdmin() {
  const [sertifikat, setSertifikat] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchSertifikat()
  }, [])

  const fetchSertifikat = async () => {
    try {
      const { data, error } = await supabase
        .from('sertifikat')
        .select(`
          *,
          peserta:peserta_id (
            nama_lengkap,
            instansi,
            jenis_sertifikat
          ),
          kegiatan:kegiatan_id (
            nama_kegiatan,
            jenis_kegiatan
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSertifikat(data || [])
    } catch (error) {
      console.error('Error fetching sertifikat:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'valid' ? 'tidak_valid' : 'valid'
    
    try {
      const { error } = await supabase
        .from('sertifikat')
        .update({ status_validasi: newStatus })
        .eq('id', id)

      if (error) throw error
      fetchSertifikat()
      alert(`Status sertifikat berhasil diubah menjadi ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Gagal mengubah status sertifikat')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus sertifikat ini?')) return
    
    try {
      const { error } = await supabase
        .from('sertifikat')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchSertifikat()
    } catch (error) {
      console.error('Error deleting sertifikat:', error)
      alert('Gagal menghapus sertifikat')
    }
  }

  const filteredSertifikat = sertifikat.filter(s => {
    const matchSearch = !searchTerm || 
      s.nomor_sertifikat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.peserta?.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.kegiatan?.nama_kegiatan.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchStatus = !filterStatus || s.status_validasi === filterStatus

    return matchSearch && matchStatus
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-kemenag-green mb-2">Verifikasi Sertifikat</h1>
            <p className="text-gray-600">Kelola dan monitor sertifikat yang telah diterbitkan</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cari Sertifikat</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nomor, nama, atau kegiatan..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="valid">Valid</option>
                  <option value="tidak_valid">Tidak Valid</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sertifikat</p>
                  <p className="text-2xl font-bold text-gray-800">{sertifikat.length}</p>
                </div>
                <FileCheck className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sertifikat Valid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {sertifikat.filter(s => s.status_validasi === 'valid').length}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tidak Valid</p>
                  <p className="text-2xl font-bold text-red-600">
                    {sertifikat.filter(s => s.status_validasi === 'tidak_valid').length}
                  </p>
                </div>
                <XCircle className="text-red-500" size={32} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kemenag-green mx-auto"></div>
              </div>
            ) : filteredSertifikat.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileCheck size={48} className="mx-auto mb-3 text-gray-300" />
                <p>Belum ada data sertifikat</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nomor Sertifikat</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Peserta</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Kegiatan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Jenis</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal Terbit</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSertifikat.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-sm">{item.nomor_sertifikat}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-sm">{item.peserta?.nama_lengkap}</p>
                            <p className="text-xs text-gray-600">{item.peserta?.instansi}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {item.kegiatan?.nama_kegiatan?.substring(0, 40)}
                          {item.kegiatan?.nama_kegiatan?.length > 40 && '...'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            {item.peserta?.jenis_sertifikat}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(item.tanggal_terbit).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(item.id, item.status_validasi)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.status_validasi === 'valid' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : item.status_validasi === 'tidak_valid'
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {item.status_validasi}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <a
                              href={`/verifikasi/${item.kode_unik}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Lihat Verifikasi"
                            >
                              <Eye size={16} />
                            </a>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Hapus"
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
    </div>
  )
}
