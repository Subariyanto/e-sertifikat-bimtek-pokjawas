import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Award, FileText, Users, Layout, TrendingUp } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalKegiatan: 0,
    totalPeserta: 0,
    totalSertifikat: 0,
    totalTemplate: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentKegiatan, setRecentKegiatan] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecentKegiatan()
  }, [])

  const fetchStats = async () => {
    try {
      const [kegiatanRes, pesertaRes, sertifikatRes, templateRes] = await Promise.all([
        supabase.from('kegiatan').select('id', { count: 'exact', head: true }),
        supabase.from('peserta').select('id', { count: 'exact', head: true }),
        supabase.from('sertifikat').select('id', { count: 'exact', head: true }),
        supabase.from('templates').select('id', { count: 'exact', head: true })
      ])

      setStats({
        totalKegiatan: kegiatanRes.count || 0,
        totalPeserta: pesertaRes.count || 0,
        totalSertifikat: sertifikatRes.count || 0,
        totalTemplate: templateRes.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentKegiatan = async () => {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setRecentKegiatan(data || [])
    } catch (error) {
      console.error('Error fetching recent kegiatan:', error)
    }
  }

  const statCards = [
    {
      icon: FileText,
      label: 'Total Kegiatan',
      value: stats.totalKegiatan,
      color: 'bg-blue-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500'
    },
    {
      icon: Users,
      label: 'Total Peserta',
      value: stats.totalPeserta,
      color: 'bg-green-500',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500'
    },
    {
      icon: Award,
      label: 'Total Sertifikat',
      value: stats.totalSertifikat,
      color: 'bg-yellow-500',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-500'
    },
    {
      icon: Layout,
      label: 'Total Template',
      value: stats.totalTemplate,
      color: 'bg-purple-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500'
    }
  ]

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-kemenag-green mb-2">Dashboard</h1>
          <p className="text-gray-600">Ringkasan data e-Sertifikat Bimtek Pokjawas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Kegiatan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Kegiatan Terbaru</h2>
          
          {recentKegiatan.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Belum ada kegiatan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Kegiatan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Jenis</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tempat</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentKegiatan.map((kegiatan) => (
                    <tr key={kegiatan.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{kegiatan.nama_kegiatan}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {kegiatan.jenis_kegiatan}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(kegiatan.tanggal_mulai).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{kegiatan.tempat}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          kegiatan.status === 'aktif' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {kegiatan.status}
                        </span>
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
  )
}
