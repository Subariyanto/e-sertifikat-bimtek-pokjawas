import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle, XCircle, Award, User, ArrowLeft } from 'lucide-react'

export default function VerifikasiPublik() {
  const { kode, encoded } = useParams()
  const [sertifikat, setSertifikat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    try {
      // Try :encoded first (/v/:encoded), fallback to :kode (/verifikasi/:kode)
      const raw = encoded || kode || ''
      if (!raw) { setNotFound(true); setLoading(false); return }

      let b64 = raw.replace(/-/g, '+').replace(/_/g, '/')
      while (b64.length % 4) b64 += '='
      const decoded = new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0)))
      const parts = decoded.split('|')

      if (parts.length >= 2) {
        // New format: pipe-delimited
        setSertifikat({
          kode: parts[0],
          nama: parts[1],
          jenis: parts[2] || 'Peserta',
          nomor: parts[3] || parts[0]
        })
      } else {
        // Old format: just kode_unik — try to find in localStorage
        const data = JSON.parse(localStorage.getItem('e_sertifikat_bimtek_pokjawas_v1') || '{}')
        const found = (data.sertifikat || []).find(s => s.kode_unik === raw)
        if (found) {
          setSertifikat({
            kode: found.kode_unik,
            nama: found.peserta?.nama_lengkap || '-',
            jenis: found.jenis_sertifikat || 'Peserta',
            nomor: found.nomor_sertifikat || found.kode_unik
          })
        } else {
          setNotFound(true)
        }
      }
    } catch (e) {
      console.error('Verifikasi error:', e)
      setNotFound(true)
    }
    setLoading(false)
  }, [kode, encoded])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kemenag-green via-emerald-700 to-kemenag-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Memverifikasi...</p>
        </div>
      </div>
    )
  }

  if (notFound || !sertifikat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kemenag-green via-emerald-700 to-kemenag-navy flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <XCircle size={80} className="text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-800 mb-2">Tidak Valid</h1>
          <p className="text-red-700 mb-6">Sertifikat tidak ditemukan</p>
          <Link to="/" className="inline-flex items-center gap-2 text-kemenag-green hover:text-kemenag-gold">
            <ArrowLeft size={20} /> Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kemenag-green via-emerald-700 to-kemenag-navy py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white hover:text-kemenag-gold mb-6">
          <ArrowLeft size={20} /> Beranda
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center bg-green-50">
            <CheckCircle size={72} className="text-green-600 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-green-800 mb-1">Sertifikat Valid</h1>
            <p className="text-green-700 text-sm">Sertifikat terverifikasi</p>
          </div>

          <div className="p-8 space-y-5">
            <div className="text-center pb-5 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">No. Sertifikat</p>
              <p className="font-bold text-kemenag-green text-lg">{sertifikat.nomor}</p>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="text-blue-600" size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-bold text-gray-800 text-lg">{sertifikat.nama}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="text-purple-600" size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jenis</p>
                <p className="font-bold text-gray-800">{sertifikat.jenis}</p>
              </div>
            </div>

            <div className="text-center pt-5 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Kode: <span className="font-mono font-bold">{sertifikat.kode}</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/80 text-sm mt-6">
          © 2026 Pokjawas Jember
        </p>
      </div>
    </div>
  )
}
