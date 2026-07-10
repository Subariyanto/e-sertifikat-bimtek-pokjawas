import { Link } from 'react-router-dom'
import { Award, LogIn, Search, Shield, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kemenag-green via-emerald-700 to-kemenag-navy">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 shadow-2xl">
            <Award size={48} className="text-kemenag-green" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            e-Sertifikat Bimtek Pokjawas
          </h1>
          <p className="text-xl text-kemenag-gold mb-2">
            Sistem Manajemen Sertifikat Digital
          </p>
          <p className="text-white/90 text-lg">
            Kelompok Kerja Pengawas Madrasah Kabupaten Jember
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <Shield className="w-12 h-12 text-kemenag-gold mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Terverifikasi</h3>
            <p className="text-white/80 text-sm">
              Setiap sertifikat dilengkapi QR Code untuk verifikasi keaslian
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <CheckCircle className="w-12 h-12 text-kemenag-gold mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Profesional</h3>
            <p className="text-white/80 text-sm">
              Desain template modern dan elegan sesuai standar lembaga
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <Award className="w-12 h-12 text-kemenag-gold mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Multi Kegiatan</h3>
            <p className="text-white/80 text-sm">
              Mendukung berbagai jenis kegiatan: Bimtek, Workshop, Seminar, dll
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-white text-kemenag-green px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            <LogIn size={24} />
            Login Admin
          </Link>
          <Link
            to="/verifikasi"
            className="inline-flex items-center gap-2 bg-kemenag-gold text-kemenag-navy px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors shadow-lg"
          >
            <Search size={24} />
            Cek Sertifikat
          </Link>
        </div>

        {/* Quick Verify Form */}
        <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-white text-xl font-bold mb-4 text-center">
            Verifikasi Cepat Sertifikat
          </h3>
          <form onSubmit={(e) => {
            e.preventDefault()
            const kode = e.target.kode.value
            if (kode) {
              window.location.href = `/verifikasi/${kode}`
            }
          }}>
            <div className="flex gap-2">
              <input
                type="text"
                name="kode"
                placeholder="Masukkan Kode Sertifikat"
                className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-kemenag-gold focus:outline-none"
                required
              />
              <button
                type="submit"
                className="bg-kemenag-gold text-kemenag-navy px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Cek
              </button>
            </div>
          </form>
          <p className="text-white/70 text-sm mt-3 text-center">
            Masukkan kode unik yang tertera di sertifikat Anda
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-kemenag-navy/50 backdrop-blur-lg border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/80 text-sm">
            <p className="mb-2">© 2026 Kelompok Kerja Pengawas Madrasah Kabupaten Jember</p>
            <p>Jember, Jawa Timur</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
