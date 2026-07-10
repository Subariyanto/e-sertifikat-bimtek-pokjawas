import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { Award, Download, Eye, FileDown, Loader } from 'lucide-react'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import { generateNomorSertifikat, generateKodeUnik, formatTanggalIndonesia, getNarasiDefault, parseTemplatePlaceholder } from '../lib/utils'

export default function GenerateSertifikat() {
  const [kegiatan, setKegiatan] = useState([])
  const [templates, setTemplates] = useState([])
  const [peserta, setPeserta] = useState([])
  const [pengaturan, setPengaturan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  
  const [selectedKegiatan, setSelectedKegiatan] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedJenis, setSelectedJenis] = useState('')
  const [previewData, setPreviewData] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedKegiatan) {
      fetchPeserta(selectedKegiatan)
    }
  }, [selectedKegiatan])

  const fetchData = async () => {
    try {
      const [kegiatanRes, templatesRes, pengaturanRes] = await Promise.all([
        supabase.from('kegiatan').select('*').eq('status', 'aktif').order('created_at', { ascending: false }),
        supabase.from('templates').select('*').eq('status', 'aktif').order('created_at', { ascending: false }),
        supabase.from('pengaturan').select('*').limit(1).single()
      ])

      if (kegiatanRes.error) throw kegiatanRes.error
      if (templatesRes.error) throw templatesRes.error
      if (pengaturanRes.error) throw pengaturanRes.error

      setKegiatan(kegiatanRes.data || [])
      setTemplates(templatesRes.data || [])
      setPengaturan(pengaturanRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPeserta = async (kegiatanId) => {
    try {
      const { data, error } = await supabase
        .from('peserta')
        .select('*')
        .eq('kegiatan_id', kegiatanId)
        .eq('status_kehadiran', 'hadir')
        .order('nama_lengkap', { ascending: true })

      if (error) throw error
      setPeserta(data || [])
    } catch (error) {
      console.error('Error fetching peserta:', error)
    }
  }

  const generateQRCode = async (kodeUnik) => {
    try {
      const verifyUrl = `${window.location.origin}/verifikasi/${kodeUnik}`
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrDataUrl
    } catch (error) {
      console.error('Error generating QR:', error)
      return null
    }
  }

  const getNextNomorUrut = async (kegiatanId) => {
    try {
      const { count, error } = await supabase
        .from('sertifikat')
        .select('id', { count: 'exact', head: true })
        .eq('kegiatan_id', kegiatanId)

      if (error) throw error
      return (count || 0) + 1
    } catch (error) {
      console.error('Error getting nomor urut:', error)
      return 1
    }
  }

  const handlePreview = async () => {
    if (!selectedKegiatan || !selectedTemplate) {
      alert('Pilih kegiatan dan template terlebih dahulu')
      return
    }

    const filteredPeserta = selectedJenis 
      ? peserta.filter(p => p.jenis_sertifikat === selectedJenis)
      : peserta

    if (filteredPeserta.length === 0) {
      alert('Tidak ada peserta untuk jenis sertifikat yang dipilih')
      return
    }

    const kegiatanData = kegiatan.find(k => k.id === selectedKegiatan)
    const templateData = templates.find(t => t.id === selectedTemplate)
    const pesertaData = filteredPeserta[0]

    const kodeUnik = generateKodeUnik()
    const qrDataUrl = await generateQRCode(kodeUnik)
    const nomorUrut = await getNextNomorUrut(selectedKegiatan)
    const nomorSertifikat = generateNomorSertifikat(
      pengaturan?.format_nomor_sertifikat || '{nomor}/{kode_kegiatan}-POKJAWAS/JBR/{bulan_romawi}/{tahun}',
      nomorUrut,
      kegiatanData.jenis_kegiatan.toUpperCase(),
      new Date()
    )

    setPreviewData({
      kegiatan: kegiatanData,
      template: templateData,
      peserta: pesertaData,
      pengaturan,
      nomorSertifikat,
      kodeUnik,
      qrDataUrl
    })
  }

  const generateSertifikatPDF = async (pesertaData, nomorUrut) => {
    const kegiatanData = kegiatan.find(k => k.id === selectedKegiatan)
    const templateData = templates.find(t => t.id === selectedTemplate)
    
    const kodeUnik = generateKodeUnik()
    const qrDataUrl = await generateQRCode(kodeUnik)
    const nomorSertifikat = generateNomorSertifikat(
      pengaturan?.format_nomor_sertifikat || '{nomor}/{kode_kegiatan}-POKJAWAS/JBR/{bulan_romawi}/{tahun}',
      nomorUrut,
      kegiatanData.jenis_kegiatan.toUpperCase(),
      new Date()
    )

    // Simpan ke database
    const { data: sertifikatData, error: insertError } = await supabase
      .from('sertifikat')
      .insert([{
        kegiatan_id: selectedKegiatan,
        peserta_id: pesertaData.id,
        template_id: selectedTemplate,
        nomor_sertifikat: nomorSertifikat,
        kode_unik: kodeUnik,
        qr_url: qrDataUrl,
        status_validasi: 'valid',
        tanggal_terbit: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single()

    if (insertError) throw insertError

    // Generate PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const certificateHTML = renderCertificateHTML({
      kegiatan: kegiatanData,
      template: templateData,
      peserta: pesertaData,
      pengaturan,
      nomorSertifikat,
      qrDataUrl
    })

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = certificateHTML
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '297mm'
    tempDiv.style.height = '210mm'
    document.body.appendChild(tempDiv)

    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false
    })

    document.body.removeChild(tempDiv)

    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210)

    return {
      pdf,
      filename: `Sertifikat_${pesertaData.nama_lengkap.replace(/[^a-zA-Z0-9]/g, '_')}_${kegiatanData.nama_kegiatan.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      sertifikatData
    }
  }

  const handleGenerate = async () => {
    if (!selectedKegiatan || !selectedTemplate) {
      alert('Pilih kegiatan dan template terlebih dahulu')
      return
    }

    const filteredPeserta = selectedJenis 
      ? peserta.filter(p => p.jenis_sertifikat === selectedJenis)
      : peserta

    if (filteredPeserta.length === 0) {
      alert('Tidak ada peserta untuk jenis sertifikat yang dipilih')
      return
    }

    setGenerating(true)

    try {
      if (filteredPeserta.length === 1) {
        // Single download
        const nomorUrut = await getNextNomorUrut(selectedKegiatan)
        const { pdf, filename } = await generateSertifikatPDF(filteredPeserta[0], nomorUrut)
        pdf.save(filename)
        alert('Sertifikat berhasil digenerate!')
      } else {
        // Multiple download as ZIP
        const zip = new JSZip()
        let nomorUrut = await getNextNomorUrut(selectedKegiatan)

        for (let i = 0; i < filteredPeserta.length; i++) {
          const { pdf, filename } = await generateSertifikatPDF(filteredPeserta[i], nomorUrut + i)
          const pdfBlob = pdf.output('blob')
          zip.file(filename, pdfBlob)
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(zipBlob)
        link.download = `Sertifikat_${kegiatan.find(k => k.id === selectedKegiatan).nama_kegiatan.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.zip`
        link.click()

        alert(`${filteredPeserta.length} sertifikat berhasil digenerate!`)
      }

      // Refresh data
      fetchPeserta(selectedKegiatan)
    } catch (error) {
      console.error('Error generating sertifikat:', error)
      alert('Gagal generate sertifikat: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const renderCertificateHTML = ({ kegiatan, template, peserta, pengaturan, nomorSertifikat, qrDataUrl }) => {
    const narasi = getNarasiDefault(peserta.jenis_sertifikat)
    const placeholderData = {
      nama_peserta: peserta.nama_lengkap,
      nip_nik: peserta.nip_nik || '',
      jabatan: peserta.jabatan || '',
      instansi: peserta.instansi || '',
      nama_kegiatan: kegiatan.nama_kegiatan,
      jenis_kegiatan: kegiatan.jenis_kegiatan,
      tanggal_mulai: formatTanggalIndonesia(kegiatan.tanggal_mulai),
      tanggal_selesai: formatTanggalIndonesia(kegiatan.tanggal_selesai),
      tempat: kegiatan.tempat,
      jumlah_jp: kegiatan.jumlah_jp,
      nomor_sertifikat: nomorSertifikat,
      tanggal_terbit: formatTanggalIndonesia(new Date()),
      nama_lembaga: pengaturan?.nama_lembaga || 'Kelompok Kerja Pengawas Madrasah Kabupaten Jember',
      nama_ketua: pengaturan?.nama_ketua || 'Subariyanto, S.Pd., M.Pd.I.',
      jabatan_ketua: pengaturan?.jabatan_ketua || 'Ketua Pokjawas Kab. Jember'
    }

    const narasiFinal = parseTemplatePlaceholder(narasi, placeholderData)

    const bgColor = template.warna_utama || '#064E3B'
    const accentColor = template.warna_sekunder || '#D4AF37'

    return `
      <div style="width: 297mm; height: 210mm; background: white; position: relative; padding: 20mm; box-sizing: border-box; font-family: 'Times New Roman', serif;">
        <!-- Border -->
        <div style="position: absolute; top: 15mm; left: 15mm; right: 15mm; bottom: 15mm; border: 3px solid ${accentColor}; border-radius: 8px;"></div>
        <div style="position: absolute; top: 17mm; left: 17mm; right: 17mm; bottom: 17mm; border: 1px solid ${bgColor};"></div>
        
        <!-- Header -->
        <div style="text-align: center; margin-top: 10mm;">
          <h1 style="color: ${bgColor}; font-size: 32pt; margin: 0; font-weight: bold; letter-spacing: 2px;">SERTIFIKAT</h1>
          <p style="color: ${accentColor}; font-size: 12pt; margin: 5px 0;">Nomor: ${nomorSertifikat}</p>
        </div>

        <!-- Nama Peserta -->
        <div style="text-align: center; margin: 20mm 0 15mm 0;">
          <h2 style="color: ${bgColor}; font-size: 28pt; margin: 0; font-weight: bold;">${peserta.nama_lengkap}</h2>
          ${peserta.instansi ? `<p style="color: #666; font-size: 12pt; margin: 5px 0;">${peserta.instansi}</p>` : ''}
        </div>

        <!-- Narasi -->
        <div style="text-align: center; padding: 0 30mm; line-height: 1.8;">
          <p style="font-size: 11pt; color: #333; text-align: justify; text-justify: inter-word;">
            ${narasiFinal}
          </p>
        </div>

        <!-- Footer dengan TTD dan QR -->
        <div style="position: absolute; bottom: 35mm; left: 30mm; right: 30mm; display: flex; justify-content: space-between; align-items: flex-end;">
          <!-- QR Code -->
          <div style="text-align: center; width: 100px;">
            <img src="${qrDataUrl}" style="width: 80px; height: 80px; display: block; margin: 0 auto 5px;" />
            <p style="font-size: 7pt; color: #666; margin: 0;">Scan untuk verifikasi</p>
          </div>

          <!-- TTD -->
          <div style="text-align: center; flex: 1; margin-left: 50px;">
            <p style="font-size: 10pt; margin: 0 0 5px 0;">${kegiatan.tempat}, ${formatTanggalIndonesia(new Date())}</p>
            <p style="font-size: 10pt; margin: 0 0 40px 0;">${pengaturan?.jabatan_ketua || 'Ketua Pokjawas Kab. Jember'}</p>
            <p style="font-size: 10pt; margin: 0; font-weight: bold; border-bottom: 1px solid #000; display: inline-block; padding-bottom: 2px;">${pengaturan?.nama_ketua || 'Subariyanto, S.Pd., M.Pd.I.'}</p>
          </div>
        </div>

        <!-- Footer Note -->
        <div style="position: absolute; bottom: 15mm; left: 30mm; right: 30mm; text-align: center;">
          <p style="font-size: 8pt; color: #999; margin: 0;">
            Sertifikat ini diterbitkan secara digital dan dapat diverifikasi keasliannya melalui QR Code.
          </p>
        </div>
      </div>
    `
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

  const filteredPeserta = selectedJenis 
    ? peserta.filter(p => p.jenis_sertifikat === selectedJenis)
    : peserta

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-kemenag-green mb-2">Generate Sertifikat</h1>
            <p className="text-gray-600">Buat dan unduh sertifikat peserta kegiatan</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kegiatan *</label>
                <select
                  value={selectedKegiatan}
                  onChange={(e) => {
                    setSelectedKegiatan(e.target.value)
                    setSelectedJenis('')
                  }}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Template *</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  required
                >
                  <option value="">Pilih Template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.nama_template}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter Jenis Sertifikat</label>
                <select
                  value={selectedJenis}
                  onChange={(e) => setSelectedJenis(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kemenag-green focus:border-transparent"
                  disabled={!selectedKegiatan}
                >
                  <option value="">Semua Jenis</option>
                  <option value="Peserta">Peserta</option>
                  <option value="Narasumber">Narasumber</option>
                  <option value="Panitia">Panitia</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Penghargaan">Penghargaan</option>
                </select>
              </div>
            </div>

            {selectedKegiatan && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Jumlah peserta:</strong> {filteredPeserta.length} orang
                  {selectedJenis && ` (${selectedJenis})`}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                disabled={!selectedKegiatan || !selectedTemplate || generating}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye size={20} />
                Preview
              </button>
              <button
                onClick={handleGenerate}
                disabled={!selectedKegiatan || !selectedTemplate || generating || filteredPeserta.length === 0}
                className="flex items-center gap-2 bg-kemenag-green text-white px-6 py-2 rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Generate & Download {filteredPeserta.length > 1 ? `(${filteredPeserta.length} sertifikat)` : ''}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          {previewData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Preview Sertifikat</h2>
              <div 
                className="border border-gray-300 rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ 
                  __html: renderCertificateHTML(previewData)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
