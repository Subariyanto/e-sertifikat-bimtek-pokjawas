import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Award, Calendar, MapPin, User, Building, ArrowLeft } from 'lucide-react'
import { formatTanggalIndonesia } from '../lib/utils'

export default function VerifikasiPublik() {
  const [sertifikat, setSertifikat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    try {
      const hash = window.location.hash
      // Support both /verifikasi/:kode and /v/:encoded
      const segs = hash.split('/')
      const encoded = segs[segs.length - 1]
      if (!encoded) { setNotFound(true); setLoading(false); return }

      const decoded = decodeURIComponent(escape(atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))))
      const parts = decoded.split('|')
      if (parts.length < 5) { setNotFound(true); setLoading(false); return }

      setSertifikat({
        kode: parts[0],
        nama: parts[1],
        nip: parts[2],
        jenis: parts[3],
        nomor: parts[4],
        kegiatan_nama: parts[5] || '-',
        kegiatan_tanggal_mulai: parts[6] || '',
        kegiatan_tanggal_selesai: parts[7] || '',
        kegiatan_tempat: parts[8] || '-',
        kegiatan_jp: parts[9] || 0,
        kegiatan_penyelenggara: parts[10] || '-',
        tanggal_terbit: parts[11] || '',
        instansi: parts[12] || '-',
        jabatan: parts[13] || '-'
      })
    } catch (e) {
      setNotFound(true)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kemenag-green via-emerald-700 to-kemenag-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Memverifikasi sertifikat...</p>
        </div>
      </div>
    )
  }

  if (notFound || !sertifikat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kemenag-green via-emerald-700 to-kemenag-navy flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <XCircle size={80} className="text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-800 mb-2">Sertifikat Tidak Valid</h1>
          <p className="text-red-700 mb-6">Data sertifikat tidak ditemukan atau kode tidak sesuai</p>
          <Link to="/" className="inline-flex items-center gap-2 text-kemenag-green hover:text-kemenag-gold transition-colors">
            <ArrowLeft size={20} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kemenag-green via-emerald-700 to-kemenag-navy py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white hover:text-kemenag-gold mb-6 transition-colors">
          <ArrowLeft size={20} /> Kembali ke Beranda
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center bg-green-50">
            <CheckCircle size={80} className="text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-800 mb-2">Sertifikat Valid</h1>
            <p className="text-green-700">Sertifikat ini terverifikasi dan sah</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Nomor Sertifikat</p>
              <p className="font-bold text-kemenag-green">{sertifikat.nomor || sertifikat.kode}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="text-blue-600" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-bold text-gray-800">{sertifikat.nama}</p>
                  <p className="text-sm text-gray-600">NIP/NIK: {sertifikat.nip}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="text-purple-600" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jenis Sertifikat</p>
                  <p className="font-bold text-gray-800">{sertifikat.jenis}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building className="text-green-600" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Instansi</p>
                  <p className="font-bold text-gray-800">{sertifikat.instansi}</p>
                  {sertifikat.jabatan && sertifikat.jabatan !== '-' && (
                    <p className="text-sm text-gray-600">{sertifikat.jabatan}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-yellow-600" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Terbit</p>
                  <p className="font-bold text-gray-800">{sertifikat.tanggal_terbit ? formatTanggalIndonesia(sertifikat.tanggal_terbit) : '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <h3 className="font-bold text-gray-800 mb-4">Detail Kegiatan</h3>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Nama Kegiatan</span>
                <span className="font-semibold text-gray-800 text-right max-w-md">{sertifikat.kegiatan_nama}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Jenis Kegiatan</span>
                <span className="font-semibold text-gray-800">{sertifikat.kegiatan_jenis}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tanggal Pelaksanaan</span>
                <span className="font-semibold text-gray-800">
                  {sertifikat.kegiatan_tanggal_mulai ? formatTanggalIndonesia(sertifikat.kegiatan_tanggal_mulai) : '-'}
                  {sertifikat.kegiatan_tanggal_selesai && sertifikat.kegiatan_tanggal_mulai !== sertifikat.kegiatan_tanggal_selesai &&
                    ` - ${formatTanggalIndonesia(sertifikat.kegiatan_tanggal_selesai)}`}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tempat</span>
                <span className="font-semibold text-gray-800">{sertifikat.kegiatan_tempat}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Jumlah JP</span>
                <span className="font-semibold text-gray-800">{sertifikat.kegiatan_jp} Jam Pelajaran</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Penyelenggara</span>
                <span className="font-semibold text-gray-800 text-right max-w-md">{sertifikat.kegiatan_penyelenggara}</span>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Kode Verifikasi: <span className="font-mono font-bold">{sertifikat.kode}</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/80 text-sm mt-8">
          © 2026 Pokjawas Jember - Sistem Verifikasi Sertifikat
        </p>
      </div>
    </div>
  )
}
