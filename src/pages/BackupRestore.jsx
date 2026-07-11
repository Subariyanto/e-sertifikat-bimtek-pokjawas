import { useEffect, useState, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import { Download, Upload, RefreshCw, Database, AlertTriangle, FileJson, CheckCircle, X } from 'lucide-react'

const STORAGE_KEY = 'e_sertifikat_bimtek_pokjawas_v1'

export default function BackupRestore() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [importPreview, setImportPreview] = useState(null)
  const [importError, setImportError] = useState(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [importFileName, setImportFileName] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setStats(null)
        return
      }
      const data = JSON.parse(raw)
      setStats({
        kegiatan: (data.kegiatan || []).length,
        peserta: (data.peserta || []).length,
        sertifikat: (data.sertifikat || []).length,
        templates: (data.templates || []).length,
        materi: (data.materi || []).length,
        pengaturan: (data.pengaturan || []).length,
      })
    } catch (e) {
      console.error('Error reading localStorage:', e)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  // === EXPORT BACKUP ===
  const handleExport = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        alert('Tidak ada data untuk di-backup.')
        return
      }

      const parsed = JSON.parse(raw)
      const today = new Date().toISOString().split('T')[0]

      const backup = {
        version: '1.0',
        export_date: new Date().toISOString(),
        app: 'e-Sertifikat Bimtek Pokjawas',
        metadata: {
          kegiatan: (parsed.kegiatan || []).length,
          peserta: (parsed.peserta || []).length,
          sertifikat: (parsed.sertifikat || []).length,
          templates: (parsed.templates || []).length,
          materi: (parsed.materi || []).length,
          pengaturan: (parsed.pengaturan || []).length,
        },
        data: {
          [STORAGE_KEY]: parsed,
        },
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-sertifikat-bimtek-${today}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export error:', e)
      alert('Gagal membuat backup: ' + e.message)
    }
  }

  // === IMPORT / RESTORE ===
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImportError(null)
    setImportPreview(null)
    setImportFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)

        // Validasi: cek apakah ada key STORAGE_KEY di .data atau di root
        let dataPayload = null
        if (json.data && json.data[STORAGE_KEY]) {
          dataPayload = json.data[STORAGE_KEY]
        } else if (json[STORAGE_KEY]) {
          dataPayload = json[STORAGE_KEY]
        } else {
          setImportError('Format file tidak valid. Key storage tidak ditemukan.')
          return
        }

        const preview = {
          kegiatan: (dataPayload.kegiatan || []).length,
          peserta: (dataPayload.peserta || []).length,
          sertifikat: (dataPayload.sertifikat || []).length,
          templates: (dataPayload.templates || []).length,
          materi: (dataPayload.materi || []).length,
          pengaturan: (dataPayload.pengaturan || []).length,
          profiles: (dataPayload.profiles || []).length,
          users: (dataPayload.users || []).length,
        }

        setImportPreview({ preview, raw: JSON.stringify(dataPayload), version: json.version || 'unknown', exportDate: json.export_date || null })
      } catch (err) {
        setImportError('File JSON tidak bisa dibaca: ' + err.message)
      }
    }
    reader.readAsText(file)

    // Reset input agar bisa upload file yang sama lagi
    e.target.value = ''
  }

  const handleRestoreConfirm = () => {
    if (!importPreview) return
    try {
      localStorage.setItem(STORAGE_KEY, importPreview.raw)
      setShowRestoreModal(false)
      alert('Data berhasil direstore. Halaman akan dimuat ulang.')
      window.location.reload()
    } catch (e) {
      alert('Gagal restore data: ' + e.message)
    }
  }

  // === RESET DATA ===
  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setShowResetModal(false)
    alert('Semua data telah dihapus. Halaman akan dimuat ulang.')
    window.location.reload()
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

  const statCards = [
    { label: 'Kegiatan', value: stats?.kegiatan ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Peserta', value: stats?.peserta ?? 0, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Sertifikat Terbit', value: stats?.sertifikat ?? 0, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Template', value: stats?.templates ?? 0, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Materi', value: stats?.materi ?? 0, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-kemenag-green mb-2">Backup & Restore</h1>
            <p className="text-gray-600">Kelola data aplikasi — export, import, atau reset</p>
          </div>

          {/* Info Card — Statistik Data */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Database size={20} className="text-kemenag-green" />
              <h2 className="text-xl font-bold text-gray-800">Statistik Data Saat Ini</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {statCards.map((s) => (
                <div key={s.label} className={`${s.bg} rounded-lg p-4 text-center`}>
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Export */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <Download size={28} className="text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Export Backup</h3>
              <p className="text-sm text-gray-500 mb-4">Download seluruh data sebagai file JSON untuk cadangan.</p>
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <Download size={18} />
                Download Backup
              </button>
            </div>

            {/* Import */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Upload size={28} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Import / Restore</h3>
              <p className="text-sm text-gray-500 mb-4">Upload file backup JSON untuk memulihkan data.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Upload size={18} />
                Pilih File Backup
              </button>
            </div>

            {/* Reset */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <RefreshCw size={28} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Reset Data</h3>
              <p className="text-sm text-gray-500 mb-4">Hapus seluruh data dan kembali ke kondisi awal.</p>
              <button
                onClick={() => setShowResetModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                <RefreshCw size={18} />
                Reset Semua Data
              </button>
            </div>
          </div>

          {/* Import Preview */}
          {importError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex items-start gap-3">
              <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 mb-1">Gagal Memproses File</h3>
                <p className="text-sm text-red-600">{importError}</p>
              </div>
            </div>
          )}

          {importPreview && !importError && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FileJson size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Preview Data Backup</h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-2">
                  <span><strong>File:</strong> {importFileName}</span>
                  {importPreview.version !== 'unknown' && <span><strong>Versi:</strong> {importPreview.version}</span>}
                  {importPreview.exportDate && <span><strong>Tanggal Export:</strong> {new Date(importPreview.exportDate).toLocaleString('id-ID')}</span>}
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-3">Data yang akan direstore:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {Object.entries(importPreview.preview).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-700">{value}</div>
                    <div className="text-xs text-gray-500 capitalize mt-1">{key}</div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>Peringatan:</strong> Restore akan menimpa (overwrite) seluruh data saat ini. Pastikan Anda sudah membuat backup jika diperlukan.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRestoreModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle size={18} />
                  Restore Data
                </button>
                <button
                  onClick={() => { setImportPreview(null); setImportFileName('') }}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  <X size={18} />
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <Database size={18} />
              Tips Penggunaan
            </h3>
            <ul className="text-sm text-blue-700 space-y-1.5">
              <li>• Lakukan backup berkala untuk mencegah kehilangan data.</li>
              <li>• Simpan file backup di tempat yang aman (cloud storage, flashdisk).</li>
              <li>• Sebelum restore, pastikan file backup berasal dari aplikasi ini.</li>
              <li>• Reset data tidak bisa dibatalkan — pastikan sudah backup terlebih dahulu.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Restore */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Konfirmasi Restore</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Semua data saat ini akan ditimpa dengan data dari file backup. Tindakan ini tidak dapat dibatalkan. Lanjutkan?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRestoreConfirm}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Ya, Restore
              </button>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Reset Semua Data</h3>
            </div>
            <p className="text-gray-600 mb-6">
              <strong className="text-red-600">Yakin?</strong> Semua data akan hilang — kegiatan, peserta, sertifikat, template, materi, dan pengaturan. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Ya, Hapus Semua
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
