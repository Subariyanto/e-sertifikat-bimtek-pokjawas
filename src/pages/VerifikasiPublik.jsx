import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle, Award, Calendar, MapPin, User, Building, ArrowLeft } from 'lucide-react'
import { formatTanggalIndonesia } from '../lib/utils'

export default function VerifikasiPublik() {
  const { kode } = useParams()
  const [sertifikat, setSertifikat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (kode) {
      verifySertifikat(kode)
    }
  }, [kode])

  const verifySertifikat = async (kodeUnik) => {
    try {
      // Log verifikasi
      await supabase.from('verifikasi_logs').insert([{
        kode_unik: kodeUnik,
        user_agent: navigator.userAgent,
        status_hasil: 'checking'
      }])

      // Fetch sertifikat dengan join ke tabel terkait
      const { data, error } = await supabase
        .from('sertifikat')
        .select(`
          *,
          peserta:peserta_id (
            nama_lengkap,
            nip_nik,
            jabatan,
            instansi,
            jenis_sertifikat
          ),
          kegiatan:kegiatan_id (
            nama_kegiatan,
            jenis_kegiatan,
            tanggal_mulai,
            tanggal_selesai,
            tempat,
            jumlah_jp,
            penyelenggara
          )
        `)
        .eq('kode_unik', kodeUnik)
        .single()

      if (error || !data) {
        setNotFound(true)
        // Update log
        await supabase.from('verifikasi_logs').insert([{
          kode_unik: kodeUnik,
          user_agent: navigator.userAgent,
          status_hasil: 'not_found'
        }])
      } else {
        setSertifikat(data)
        // Update log
        await supabase.from('verifikasi_logs').insert([{
          sertifikat_id: data.id,
          kode_unik: kodeUnik,
          user_agent: navigator.userAgent,
          status_hasil: data.status_validasi
        }])
      }
    } catch (error) {
      console.error('Error verifying certificate:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

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

  const isValid = sertifikat && sertifikat.status_validasi === 'valid'

  return (
    <div className="min-h-screen bg-gradient-to-br from-kemenag-green via-emerald-700 to-kemenag-navy py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white hover:text-kemenag-gold mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Kembali ke Beranda
        </Link>

        {/* Result Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Status */}
          <div className={`p-8 text-center ${isValid ? 'bg-green-50' : 'bg-red-50'}`}>
            {isValid ? (
              <>
                <CheckCircle size={80} className="text-green-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-green-800 mb-2">Sertifikat Valid</h1>
                <p className="text-green-700">Sertifikat ini terverifikasi dan sah</p>
              </>
            ) : (
              <>
                <XCircle size={80} className="text-red-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-red-800 mb-2">Sertifikat Tidak Valid</h1>
                <p className="text-red-700">
                  {notFound 
                    ? 'Data sertifikat tidak ditemukan atau kode tidak sesuai'
                    : 'Sertifikat sudah dinonaktifkan oleh admin'}
                </p>
              </>
            )}
          </div>

          {/* Certificate Details */}
          {sertifikat && (
            <div className="p-8 space-y-6">
              {/* Nomor Sertifikat */}
              <div className="text-center pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Nomor Sertifikat</p>
                <p className="text-2xl font-bold text-kemenag-green">{sertifikat.nomor_sertifikat}</p>
              </div>

              {/* Peserta Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nama Peserta</p>
                    <p className="font-bold text-gray-800">{sertifikat.peserta?.nama_lengkap}</p>
                    {sertifikat.peserta?.nip_nik && (
                      <p className="text-sm text-gray-600">NIP/NIK: {sertifikat.peserta.nip_nik}</p>
                    )}
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
                    <p className="font-bold text-gray-800">{sertifikat.peserta?.jenis_sertifikat}</p>
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
                    <p className="font-bold text-gray-800">{sertifikat.peserta?.instansi || '-'}</p>
                    {sertifikat.peserta?.jabatan && (
                      <p className="text-sm text-gray-600">{sertifikat.peserta.jabatan}</p>
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
                    <p className="font-bold text-gray-800">
                      {formatTanggalIndonesia(sertifikat.tanggal_terbit)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kegiatan Info */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <h3 className="font-bold text-gray-800 mb-4">Detail Kegiatan</h3>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Nama Kegiatan</span>
                  <span className="font-semibold text-gray-800 text-right max-w-md">
                    {sertifikat.kegiatan?.nama_kegiatan}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Jenis Kegiatan</span>
                  <span className="font-semibold text-gray-800">
                    {sertifikat.kegiatan?.jenis_kegiatan}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tanggal Pelaksanaan</span>
                  <span className="font-semibold text-gray-800">
                    {formatTanggalIndonesia(sertifikat.kegiatan?.tanggal_mulai)}
                    {sertifikat.kegiatan?.tanggal_mulai !== sertifikat.kegiatan?.tanggal_selesai && 
                      ` - ${formatTanggalIndonesia(sertifikat.kegiatan?.tanggal_selesai)}`
                    }
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tempat</span>
                  <span className="font-semibold text-gray-800">{sertifikat.kegiatan?.tempat}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Jumlah JP</span>
                  <span className="font-semibold text-gray-800">{sertifikat.kegiatan?.jumlah_jp} Jam Pelajaran</span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Penyelenggara</span>
                  <span className="font-semibold text-gray-800 text-right max-w-md">
                    {sertifikat.kegiatan?.penyelenggara}
                  </span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Sertifikat ini diterbitkan secara digital dan dapat diverifikasi keasliannya melalui QR Code.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 flex gap-3">
            <Link
              to="/"
              className="flex-1 bg-kemenag-green text-white py-3 rounded-lg font-semibold text-center hover:bg-emerald-800 transition-colors"
            >
              Kembali ke Beranda
            </Link>
            {sertifikat && sertifikat.file_pdf_url && (
              <a
                href={sertifikat.file_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-kemenag-gold text-kemenag-navy py-3 rounded-lg font-semibold text-center hover:bg-yellow-400 transition-colors"
              >
                Download Sertifikat
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-sm mt-8">
          © 2026 Kelompok Kerja Pengawas Madrasah Kabupaten Jember
        </p>
      </div>
    </div>
  )
}
