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

  const generateQRCode = async (kodeUnik, pesertaData, sertifikatInfo) => {
    try {
      // Minimal data: only 4 fields for small QR
      const d = sertifikatInfo || {}
      const v = [
        d.kode || kodeUnik,
        d.nama || pesertaData?.nama_lengkap || '',
        d.jenis || 'Peserta',
        d.nomor || ''
      ]
      // URL-safe base64 (modern, no deprecated unescape/escape)
      const jsonStr = v.join('|')
      const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(jsonStr))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
      const verifyUrl = `${window.location.origin}${window.location.pathname}#/v/${encoded}`
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 300,
        margin: 1,
        errorCorrectionLevel: 'L',
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
    const nomorUrut = await getNextNomorUrut(selectedKegiatan)
    const nomorSertifikat = generateNomorSertifikat(
      pengaturan?.format_nomor_sertifikat || '{nomor}/{kode_kegiatan}-POKJAWAS/JBR/{bulan_romawi}/{tahun}',
      nomorUrut,
      kegiatanData.jenis_kegiatan.toUpperCase(),
      new Date()
    )
    const qrDataUrl = await generateQRCode(kodeUnik, pesertaData, {
      kode: kodeUnik,
      nama: pesertaData.nama_lengkap,
      jenis: pesertaData.jenis_sertifikat || 'Peserta',
      nomor: nomorSertifikat
    })

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

  const renderMateriHTML = ({ kegiatan, materiList, pengaturan }) => {
    const bgColor = '#064E3B'
    const accentColor = '#D4AF37'
    const totalJP = materiList.reduce((sum, m) => sum + (parseInt(m.jumlah_jp) || 0), 0)
    return `
      <div style="width: 297mm; height: 210mm; background: #ffffff; position: relative; overflow: hidden; font-family: 'Times New Roman', Georgia, serif; box-sizing: border-box;">
        <div style="position: absolute; top: 0; left: 0; width: 70px; height: 70px; border-top: 4px solid ${accentColor}; border-left: 4px solid ${accentColor}; border-radius: 8px 0 0 0;"></div>
        <div style="position: absolute; top: 0; right: 0; width: 70px; height: 70px; border-top: 4px solid ${accentColor}; border-right: 4px solid ${accentColor}; border-radius: 0 8px 0 0;"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 70px; height: 70px; border-bottom: 4px solid ${accentColor}; border-left: 4px solid ${accentColor}; border-radius: 0 0 0 8px;"></div>
        <div style="position: absolute; bottom: 0; right: 0; width: 70px; height: 70px; border-bottom: 4px solid ${accentColor}; border-right: 4px solid ${accentColor}; border-radius: 0 0 8px 0;"></div>
        <div style="position: absolute; top: 8mm; left: 8mm; right: 8mm; bottom: 8mm; border: 2.5px solid ${accentColor}; border-radius: 4px;"></div>
        <div style="position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm; border: 1px solid ${bgColor}; border-radius: 2px;"></div>
        <div style="position: relative; text-align: center; padding-top: 16mm; z-index: 1;">
          <div style="font-size: 9pt; color: ${bgColor}; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 4px;">${pengaturan && pengaturan.nama_lembaga ? pengaturan.nama_lembaga : 'Kelompok Kerja Pengawas Madrasah Kabupaten Jember'}</div>
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin: 4px 0;">
            <div style="width: 40px; height: 1px; background: ${accentColor};"></div>
            <div style="width: 8px; height: 8px; background: ${accentColor}; transform: rotate(45deg);"></div>
            <div style="width: 40px; height: 1px; background: ${accentColor};"></div>
          </div>
          <h2 style="color: ${bgColor}; font-size: 16pt; margin: 6px 0 2px 0; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">MATERI ${kegiatan.nama_kegiatan}</h2>
          <p style="color: #666; font-size: 9pt; margin: 2px 0 0 0;">${formatTanggalIndonesia(kegiatan.tanggal_mulai)} s.d. ${formatTanggalIndonesia(kegiatan.tanggal_selesai)} &bull; ${kegiatan.tempat}</p>
        </div>
        <div style="position: relative; padding: 6mm 18mm 0 18mm; z-index: 1;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12pt;">
            <thead>
              <tr style="background: ${bgColor}; color: #ffffff;">
                <th style="padding: 6px 10px; text-align: center; width: 6%;">No</th>
                <th style="padding: 6px 10px; text-align: left; width: 48%;">Judul Materi</th>
                <th style="padding: 6px 10px; text-align: left; width: 36%;">Pemateri</th>
                <th style="padding: 6px 10px; text-align: center; width: 10%;">JP</th>
              </tr>
            </thead>
            <tbody>
              ${materiList.map((m, i) => '<tr style="background: ' + (i % 2 === 0 ? '#ffffff' : '#f9f9f9') + '; border-bottom: 1px solid #e5e7eb;"><td style="padding: 5px 10px; text-align: center; color: #555;">' + (i + 1) + '</td><td style="padding: 5px 10px; color: #222; font-weight: 500;">' + m.judul_materi + '</td><td style="padding: 5px 10px; color: #444;">' + m.nama_pemateri + '</td><td style="padding: 5px 10px; text-align: center; color: ' + bgColor + '; font-weight: bold;">' + m.jumlah_jp + '</td></tr>').join('')}
              <tr style="background: #f0fdf4; border-top: 2px solid ${accentColor};">
                <td colspan="3" style="padding: 6px 10px; text-align: right; font-weight: bold; color: ${bgColor};">Total Jam Pelajaran:</td>
                <td style="padding: 6px 10px; text-align: center; font-weight: bold; color: ${bgColor}; font-size: 11pt;">${totalJP}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="position: absolute; bottom: 18mm; right: 25mm; text-align: center; z-index: 1;">
          <p style="font-size: 12pt; color: #555; margin: 0 0 2px 0;">Jember, ${formatTanggalIndonesia(kegiatan.tanggal_selesai)}</p>
          <p style="font-size: 12pt; color: #555; margin: 0 0 4px 0;">${pengaturan && pengaturan.jabatan_ketua ? pengaturan.jabatan_ketua : 'Ketua Pokjawas Kab. Jember'}</p>
          <div style="margin: 4px auto; width: 90px; height: 90px;">
            <img src="${qrDataUrl}" style="width: 90px; height: 90px; display: block;" />
          </div>
          <div style="min-width: 60mm; margin: 2px auto 0 auto;">
            <p style="font-size: 12pt; margin: 0; font-weight: bold; color: ${bgColor};">${pengaturan && pengaturan.nama_ketua ? pengaturan.nama_ketua : 'Subariyanto, S.Pd., M.Pd.I.'}</p>
            <p style="font-size: 12pt; color: #555; margin: 1px 0 0 0;">NIP. ${peserta.nip_nik || '-'}</p>
          </div>
        </div>
      </div>
    `
  }

  const renderMateriHTMLSimple = ({ kegiatan, materiList, pengaturan }) => {
    const bgColor = '#064E3B'
    const accentColor = '#D4AF37'
    const totalJP = materiList.reduce((sum, m) => sum + (parseInt(m.jumlah_jp) || 0), 0)
    return `
      <div style="width: 297mm; height: 210mm; background: #ffffff; position: relative; overflow: hidden; font-family: 'Times New Roman', Georgia, serif; box-sizing: border-box; border: 3px solid ${accentColor};">
        <div style="padding: 12mm 16mm 8mm 16mm;">
          <div style="text-align: center; margin-bottom: 6mm;">
            <p style="font-size: 9pt; color: ${bgColor}; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 3px 0;">${pengaturan && pengaturan.nama_lembaga ? pengaturan.nama_lembaga : 'Kelompok Kerja Pengawas Madrasah Kabupaten Jember'}</p>
            <h2 style="color: ${bgColor}; font-size: 14pt; margin: 4px 0 2px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">MATERI ${kegiatan.nama_kegiatan}</h2>
            <p style="color: #666; font-size: 8.5pt; margin: 2px 0 0 0;">${formatTanggalIndonesia(kegiatan.tanggal_mulai)} s.d. ${formatTanggalIndonesia(kegiatan.tanggal_selesai)} &bull; ${kegiatan.tempat}</p>
            <div style="width: 80mm; height: 1px; background: ${accentColor}; margin: 6px auto 0;"></div>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12pt;">
            <thead>
              <tr style="background: ${bgColor}; color: #ffffff;">
                <th style="padding: 5px 8px; text-align: center; width: 6%;">No</th>
                <th style="padding: 5px 8px; text-align: left; width: 48%;">Judul Materi</th>
                <th style="padding: 5px 8px; text-align: left; width: 36%;">Pemateri</th>
                <th style="padding: 5px 8px; text-align: center; width: 10%;">JP</th>
              </tr>
            </thead>
            <tbody>
              ${materiList.map((m, i) => '<tr style="background: ' + (i % 2 === 0 ? '#ffffff' : '#f9f9f9') + '; border-bottom: 1px solid #e5e7eb;"><td style="padding: 4px 8px; text-align: center; color: #555;">' + (i + 1) + '</td><td style="padding: 4px 8px; color: #222;">' + m.judul_materi + '</td><td style="padding: 4px 8px; color: #444;">' + m.nama_pemateri + '</td><td style="padding: 4px 8px; text-align: center; font-weight: bold; color: ' + bgColor + ';">' + m.jumlah_jp + '</td></tr>').join('')}
              <tr style="border-top: 2px solid ${accentColor}; background: #f0fdf4;">
                <td colspan="3" style="padding: 5px 8px; text-align: right; font-weight: bold; color: ${bgColor};">Total Jam Pelajaran:</td>
                <td style="padding: 5px 8px; text-align: center; font-weight: bold; color: ${bgColor};">${totalJP}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="position: absolute; bottom: 12mm; right: 20mm; text-align: center;">
          <p style="font-size: 12pt; color: #555; margin: 0 0 2px 0;">Jember, ${formatTanggalIndonesia(kegiatan.tanggal_selesai)}</p>
          <p style="font-size: 12pt; color: #555; margin: 0 0 4px 0;">${pengaturan && pengaturan.jabatan_ketua ? pengaturan.jabatan_ketua : 'Ketua Pokjawas Kab. Jember'}</p>
          <div style="margin: 4px auto; width: 90px; height: 90px;">
            <img src="${qrDataUrl}" style="width: 90px; height: 90px; display: block;" />
          </div>
          <div style="min-width: 55mm; margin: 2px auto 0 auto;">
            <p style="font-size: 12pt; margin: 0; font-weight: bold; color: ${bgColor};">${pengaturan && pengaturan.nama_ketua ? pengaturan.nama_ketua : 'Subariyanto, S.Pd., M.Pd.I.'}</p>
            <p style="font-size: 12pt; color: #555; margin: 1px 0 0 0;">NIP. ${peserta.nip_nik || '-'}</p>
          </div>
        </div>
      </div>
    `
  }

  const generateSertifikatPDF = async (pesertaData, nomorUrut) => {
    const kegiatanData = kegiatan.find(k => k.id === selectedKegiatan)
    const templateData = templates.find(t => t.id === selectedTemplate)
    
    const kodeUnik = generateKodeUnik()
    const nomorSertifikat = generateNomorSertifikat(
      pengaturan?.format_nomor_sertifikat || '{nomor}/{kode_kegiatan}-POKJAWAS/JBR/{bulan_romawi}/{tahun}',
      nomorUrut,
      kegiatanData.jenis_kegiatan.toUpperCase(),
      new Date()
    )
    const qrDataUrl = await generateQRCode(kodeUnik, pesertaData, {
      kode: kodeUnik,
      nama: pesertaData.nama_lengkap,
      jenis: pesertaData.jenis_sertifikat || 'Peserta',
      nomor: nomorSertifikat
    })

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

    // Page 1
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

    // Page 2: Materi
    const { data: materiData } = await supabase
      .from('materi')
      .select('*')
      .eq('kegiatan_id', selectedKegiatan)
      .order('created_at', { ascending: true })
    const materiList = materiData || []

    pdf.addPage()

    const materiHTML = templateData && templateData.background_image
      ? renderMateriHTMLSimple({ kegiatan: kegiatanData, materiList, pengaturan })
      : renderMateriHTML({ kegiatan: kegiatanData, materiList, pengaturan })

    const tempDiv2 = document.createElement('div')
    tempDiv2.innerHTML = materiHTML
    tempDiv2.style.position = 'absolute'
    tempDiv2.style.left = '-9999px'
    tempDiv2.style.width = '297mm'
    tempDiv2.style.height = '210mm'
    document.body.appendChild(tempDiv2)

    const canvas2 = await html2canvas(tempDiv2, {
      scale: 2,
      useCORS: true,
      logging: false
    })
    document.body.removeChild(tempDiv2)

    const imgData2 = canvas2.toDataURL('image/png')
    pdf.addImage(imgData2, 'PNG', 0, 0, 297, 210)

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
    // If template has background_image, use image overlay mode
    if (template.background_image) {
      return renderCertificateHTMLWithImage({ kegiatan, template, peserta, pengaturan, nomorSertifikat, qrDataUrl })
    }

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
    const isNarasumber = peserta.jenis_sertifikat === 'Narasumber'
    const isPenghargaan = peserta.jenis_sertifikat === 'Penghargaan'

    return `
      <div style="width: 297mm; height: 210mm; background: #ffffff; position: relative; overflow: hidden; font-family: 'Times New Roman', Georgia, serif;">
        
        <!-- Decorative Corner Ornaments -->
        <div style="position: absolute; top: 0; left: 0; width: 70px; height: 70px; border-top: 4px solid ${accentColor}; border-left: 4px solid ${accentColor}; border-radius: 8px 0 0 0;"></div>
        <div style="position: absolute; top: 0; right: 0; width: 70px; height: 70px; border-top: 4px solid ${accentColor}; border-right: 4px solid ${accentColor}; border-radius: 0 8px 0 0;"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 70px; height: 70px; border-bottom: 4px solid ${accentColor}; border-left: 4px solid ${accentColor}; border-radius: 0 0 0 8px;"></div>
        <div style="position: absolute; bottom: 0; right: 0; width: 70px; height: 70px; border-bottom: 4px solid ${accentColor}; border-right: 4px solid ${accentColor}; border-radius: 0 0 8px 0;"></div>

        <!-- Outer Border -->
        <div style="position: absolute; top: 8mm; left: 8mm; right: 8mm; bottom: 8mm; border: 2.5px solid ${accentColor}; border-radius: 4px;"></div>
        
        <!-- Inner Border -->
        <div style="position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm; border: 1px solid ${bgColor}; border-radius: 2px;"></div>

        <!-- Inner decorative line -->
        <div style="position: absolute; top: 11mm; left: 11mm; right: 11mm; bottom: 11mm; border: 0.5px solid ${accentColor}99; border-radius: 2px;"></div>

        <!-- Watermark -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 120pt; font-weight: bold; color: ${bgColor}06; white-space: nowrap; pointer-events: none; z-index: 0;">SERTIFIKAT</div>

        <!-- Top decorative bar -->
        <div style="position: absolute; top: 12mm; left: 50%; transform: translateX(-50%); width: 60mm; height: 3px; background: linear-gradient(90deg, transparent, ${accentColor}, transparent);"></div>

        <!-- Header Section -->
        <div style="position: relative; text-align: center; padding-top: 18mm; z-index: 1;">
          <div style="font-size: 9pt; color: ${bgColor}; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 4px;">${pengaturan?.nama_lembaga || 'Kelompok Kerja Pengawas Madrasah Kabupaten Jember'}</div>
          
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin: 6px 0;">
            <div style="width: 40px; height: 1px; background: ${accentColor};"></div>
            <div style="width: 8px; height: 8px; background: ${accentColor}; transform: rotate(45deg);"></div>
            <div style="width: 40px; height: 1px; background: ${accentColor};"></div>
          </div>

          <h1 style="color: ${bgColor}; font-size: 36pt; margin: 8px 0 2px 0; font-weight: bold; letter-spacing: 4px; text-shadow: 1px 1px 2px ${accentColor}33;">SERTIFIKAT</h1>
          
          <p style="color: ${accentColor}; font-size: 11pt; margin: 4px 0; font-style: italic;">${isPenghargaan ? 'Penghargaan' : isNarasumber ? 'Narasumber' : 'Peserta'}</p>
          
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 6px 0;">
            <div style="width: 30px; height: 1px; background: ${bgColor}55;"></div>
            <span style="font-size: 8pt; color: ${bgColor}; letter-spacing: 1px;">No: ${nomorSertifikat}</span>
            <div style="width: 30px; height: 1px; background: ${bgColor}55;"></div>
          </div>
        </div>

        <!-- "Diberikan kepada" -->
        <div style="text-align: center; margin-top: 12mm; position: relative; z-index: 1;">
          <p style="font-size: 10pt; color: #555; margin: 0 0 6px 0; font-style: italic;">Diberikan kepada:</p>
          
          <!-- Name with decorative underline -->
          <div style="display: inline-block; position: relative;">
            <h2 style="color: ${bgColor}; font-size: 26pt; margin: 0; font-weight: bold; padding: 0 20px; letter-spacing: 1px;">${peserta.nama_lengkap}</h2>
            <div style="height: 2px; background: linear-gradient(90deg, transparent, ${accentColor}, transparent); margin-top: 4px;"></div>
          </div>
          
          ${peserta.jabatan || peserta.instansi ? `<p style="color: #666; font-size: 10pt; margin: 8px 0 0 0;">${peserta.jabatan ? peserta.jabatan : ''}${peserta.jabatan && peserta.instansi ? ' — ' : ''}${peserta.instansi ? peserta.instansi : ''}</p>` : ''}
        </div>

        <!-- Narasi -->
        <div style="text-align: center; padding: 8mm 35mm 0 35mm; line-height: 1.9; position: relative; z-index: 1;">
          <p style="font-size: 10.5pt; color: #333; text-align: justify; text-justify: inter-word; margin: 0;">
            ${narasiFinal}
          </p>
        </div>

        <!-- Bottom decorative bar -->
        <div style="position: absolute; bottom: 52mm; left: 50%; transform: translateX(-50%); width: 80mm; height: 1px; background: linear-gradient(90deg, transparent, ${accentColor}88, transparent);"></div>

        <!-- Footer: QR + TTD -->
        <div style="position: absolute; bottom: 18mm; left: 25mm; right: 25mm; display: flex; justify-content: space-between; align-items: flex-end; z-index: 1;">
          
          <!-- QR Code with decorative frame -->
          <div style="text-align: center;">
            <div style="border: 1.5px solid ${accentColor}; padding: 4px; border-radius: 4px; display: inline-block;">
              <img src="${qrDataUrl}" style="width: 70px; height: 70px; display: block;" />
            </div>
            <p style="font-size: 7pt; color: #777; margin: 3px 0 0 0;">Scan untuk verifikasi</p>
          </div>

          <!-- Center info -->
          <div style="text-align: center; flex: 1; padding: 0 20px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px;">
              <div style="width: 20px; height: 1px; background: ${bgColor}44;"></div>
              <span style="font-size: 8pt; color: ${bgColor}; text-transform: uppercase; letter-spacing: 2px;">Diterbitkan</span>
              <div style="width: 20px; height: 1px; background: ${bgColor}44;"></div>
            </div>
            <p style="font-size: 9pt; color: #555; margin: 0;">${kegiatan.tempat}, ${formatTanggalIndonesia(new Date())}</p>
            <p style="font-size: 8pt; color: #999; margin: 2px 0 0 0;">${kegiatan.jumlah_jp} Jam Pelajaran</p>
          </div>

          <!-- TTD -->
          <div style="text-align: center;">
            <p style="font-size: 14pt; color: #555; margin: 0 0 2px 0;">Jember, ${formatTanggalIndonesia(kegiatan.tanggal_selesai)}</p>
            <p style="font-size: 14pt; color: #555; margin: 0 0 4px 0;">${pengaturan?.jabatan_ketua || 'Ketua Pokjawas Kab. Jember'}</p>
            <div style="margin: 4px auto; width: 90px; height: 90px;">
              <img src="${qrDataUrl}" style="width: 90px; height: 90px; display: block;" />
            </div>
            <div style="min-width: 60mm; margin: 2px auto 0 auto;">
              <p style="font-size: 14pt; margin: 0; font-weight: bold; color: ${bgColor};">${pengaturan?.nama_ketua || 'Subariyanto, S.Pd., M.Pd.I.'}</p>
              <p style="font-size: 14pt; color: #777; margin: 1px 0 0 0;">NIP. ${peserta.nip_nik || '-'}</p>
            </div>
          </div>
        </div>

        <!-- Official Seal (decorative) -->
        <div style="position: absolute; bottom: 28mm; right: 60mm; width: 50px; height: 50px; border: 2px solid ${accentColor}44; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 0;">
          <div style="width: 42px; height: 42px; border: 1px solid ${accentColor}44; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 7pt; color: ${bgColor}44; font-weight: bold; text-align: center; line-height: 1;">POKJ<br>WAS</div>
        </div>

        <!-- Bottom footer text -->
        <div style="position: absolute; bottom: 10mm; left: 25mm; right: 25mm; text-align: center; z-index: 1;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 2px;">
            <div style="width: 25px; height: 0.5px; background: ${accentColor}66;"></div>
            <span style="font-size: 7pt; color: #aaa; letter-spacing: 1px;">Sertifikat ini diterbitkan secara digital dan dapat diverifikasi melalui QR Code</span>
            <div style="width: 25px; height: 0.5px; background: ${accentColor}66;"></div>
          </div>
        </div>
      </div>
    `
  }

  // Render certificate with uploaded background image
  const renderCertificateHTMLWithImage = ({ kegiatan, template, peserta, pengaturan, nomorSertifikat, qrDataUrl }) => {
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

    const isLandscape = template.orientasi !== 'portrait'
    const width = isLandscape ? '297mm' : '210mm'
    const height = isLandscape ? '210mm' : '297mm'

    const namaTtd = template.nama_ttd || pengaturan?.nama_ketua || 'Subariyanto, S.Pd., M.Pd.I.'
    const jabatanTtd = template.jabatan_ttd || pengaturan?.jabatan_ketua || 'Ketua Pokjawas Kab. Jember'
    const qrSize = template.qr_size || 70

    return `
      <div style="width: ${width}; height: ${height}; position: relative; overflow: hidden; font-family: 'Times New Roman', Georgia, serif; background: #ffffff;">
        
        <!-- Background Image -->
        <img src="${template.background_image}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;" />

        <!-- Lembaga + SERTIFIKAT + No (merged, no gap) -->
        <div style="position: absolute; top: ${Math.max(28 - 16, 3)}%; left: 50%; transform: translateX(-50%); z-index: 2; text-align: center; width: 100%;">
          <p style="font-size: ${(template.font_nomor_size || 9) + 2}pt; color: ${template.font_nomor_color || '#064E3B'}; letter-spacing: 2px; margin: 0 0 6px 0; text-transform: uppercase; font-weight: bold;">Kelompok Kerja Pengawas Madrasah Kab. Jember</p>
          <h1 style="font-size: ${(template.font_nomor_size || 9) + 18}pt; color: ${template.font_nomor_color || '#064E3B'}; margin: 0 0 2px 0; font-weight: bold; letter-spacing: 4px; text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">SERTIFIKAT</h1>
          <span style="font-size: ${template.font_nomor_size || 9}pt; color: ${template.font_nomor_color || '#064E3B'}; letter-spacing: 1px; display: block;">No: ${nomorSertifikat}</span>
        </div>

        <!-- Diberikan Kepada -->
        <div style="position: absolute; top: ${Math.min(33 - 5, 33 - 5)}%; left: 50%; transform: translateX(-50%); z-index: 2; text-align: center; width: 80%;">
          <p style="font-size: ${(template.font_narasi_size || 11)}pt; color: #555; margin: 0; font-style: italic;">Diberikan Kepada:</p>
        </div>

        <!-- Nama Peserta -->
        <div style="position: absolute; top: 33%; left: 50%; transform: translateX(-50%); z-index: 2; text-align: center; width: 85%;">
          <h2 style="font-size: ${template.font_nama_size || 28}pt; color: ${template.font_nama_color || '#064E3B'}; margin: 0; font-weight: bold; letter-spacing: 1px; text-shadow: 1px 1px 2px rgba(255,255,255,0.5); line-height: 1.3; word-wrap: break-word; white-space: normal;">${peserta.nama_lengkap}</h2>
        </div>

        <!-- Narasi -->
        <div style="position: absolute; top: 44%; left: 50%; transform: translateX(-50%); z-index: 2; text-align: center; width: 70%; line-height: 1.8;">
          <p style="font-size: ${template.font_narasi_size || 11}pt; color: ${template.font_narasi_color || '#333333'}; text-align: justify; text-justify: inter-word; margin: 0;">
            ${narasiFinal}
          </p>
        </div>

        <!-- Tanda Tangan (center, font 14, QR as signature) -->
        <div style="position: absolute; top: 66%; left: 50%; transform: translateX(-50%); z-index: 2; text-align: center;">
          <p style="font-size: 14pt; color: #555; margin: 0 0 2px 0;">Jember, ${formatTanggalIndonesia(kegiatan.tanggal_selesai)}</p>
          <p style="font-size: 14pt; color: #555; margin: 0 0 4px 0;">${jabatanTtd}</p>
          <div style="margin: 4px auto; width: 90px; height: 90px;">
            <img src="${qrDataUrl}" style="width: 90px; height: 90px; display: block;" />
          </div>
          <div style="min-width: 55mm; margin: 2px auto 0 auto;">
            <p style="font-size: 14pt; margin: 0; font-weight: bold; color: ${template.font_nama_color || '#064E3B'};">${namaTtd}</p>
            <p style="font-size: 14pt; color: #555; margin: 1px 0 0 0;">NIP. ${peserta.nip_nik || '-'}</p>
          </div>
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
