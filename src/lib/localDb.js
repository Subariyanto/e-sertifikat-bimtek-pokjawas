// localStorage Database Layer
// Mimics Supabase API shape for drop-in replacement

const STORAGE_KEY = 'e_sertifikat_bimtek_pokjawas_v1'

// Initialize default data
const initializeData = () => {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return JSON.parse(existing)

  const defaultData = {
    profiles: [
      {
        id: '1',
        user_id: '1',
        nama: 'Admin Pokjawas',
        email: 'admin@pokjawas.com',
        role: 'admin',
        created_at: new Date().toISOString()
      }
    ],
    kegiatan: [],
    peserta: [],
    templates: [
      {
        id: generateId(),
        nama_template: 'Formal Hijau Emas - Default',
        kategori_template: 'Formal Hijau Emas',
        warna_utama: '#064E3B',
        warna_sekunder: '#D4AF37',
        orientasi: 'landscape',
        status: 'aktif',
        created_at: new Date().toISOString()
      },
      {
        id: generateId(),
        nama_template: 'Modern Navy Gold',
        kategori_template: 'Modern Navy Gold',
        warna_utama: '#1e40af',
        warna_sekunder: '#f59e0b',
        orientasi: 'landscape',
        status: 'aktif',
        created_at: new Date().toISOString()
      },
      {
        id: generateId(),
        nama_template: 'Islami Emerald Gold',
        kategori_template: 'Islami Emerald Gold',
        warna_utama: '#059669',
        warna_sekunder: '#D4AF37',
        orientasi: 'landscape',
        status: 'aktif',
        created_at: new Date().toISOString()
      },
      {
        id: generateId(),
        nama_template: 'Sertifikat Narasumber',
        kategori_template: 'Sertifikat Narasumber',
        warna_utama: '#7c3aed',
        warna_sekunder: '#fbbf24',
        orientasi: 'landscape',
        status: 'aktif',
        created_at: new Date().toISOString()
      },
      {
        id: generateId(),
        nama_template: 'Sertifikat Penghargaan',
        kategori_template: 'Sertifikat Penghargaan',
        warna_utama: '#dc2626',
        warna_sekunder: '#fbbf24',
        orientasi: 'landscape',
        status: 'aktif',
        created_at: new Date().toISOString()
      }
    ],
    sertifikat: [],
    verifikasi_logs: [],
    materi: [
      {
        id: generateId(),
        kegiatan_id: '',
        judul_materi: 'Kebijakan Pengawasan Madrasah',
        nama_pemateri: 'Dr. H. Ahmad Syafi\'i, M.Pd.',
        jumlah_jp: 3,
        created_at: new Date().toISOString()
      },
      {
        id: generateId(),
        kegiatan_id: '',
        judul_materi: 'Teknik Supervisi Akademik',
        nama_pemateri: 'Subariyanto, S.Pd., M.Pd.I.',
        jumlah_jp: 4,
        created_at: new Date().toISOString()
      },
      {
        id: generateId(),
        kegiatan_id: '',
        judul_materi: 'Penyusunan Laporan Pengawasan',
        nama_pemateri: 'Drs. H. Mukhlis, M.Ag.',
        jumlah_jp: 3,
        created_at: new Date().toISOString()
      }
    ],
    pengaturan: [
      {
        id: '1',
        nama_lembaga: 'Kelompok Kerja Pengawas Madrasah Kabupaten Jember',
        alamat_lembaga: 'Jember, Jawa Timur',
        nama_ketua: 'Subariyanto, S.Pd., M.Pd.I.',
        jabatan_ketua: 'Ketua Pokjawas Kabupaten Jember',
        nip_ketua: '',
        nama_panitia: '',
        jabatan_panitia: '',
        format_nomor_sertifikat: '{nomor}/{kode_kegiatan}-POKJAWAS/JBR/{bulan_romawi}/{tahun}',
        tema_aplikasi: 'hijau-emas',
        created_at: new Date().toISOString()
      }
    ],
    users: [
      {
        id: '1',
        email: 'admin@pokjawas.com',
        password: 'admin123', // Plain text for demo — in production use bcrypt
        created_at: new Date().toISOString()
      }
    ],
    session: null // Current session
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
  return defaultData
}

// Generate simple UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Get all data
const getData = () => {
  return initializeData()
}

// Save all data (with cleanup to prevent quota exceeded)
const saveData = (data) => {
  // Clean up large qr_url fields from sertifikat records
  if (data.sertifikat && Array.isArray(data.sertifikat)) {
    data.sertifikat.forEach(s => {
      if (s.qr_url && s.qr_url.length > 100) s.qr_url = ''
    })
  }
  // Clean up large background_image from templates (keep only if < 500KB)
  if (data.templates && Array.isArray(data.templates)) {
    data.templates.forEach(t => {
      if (t.background_image && t.background_image.length > 500000) {
        console.warn('Template background_image too large, removing to prevent quota')
        t.background_image = ''
      }
    })
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('localStorage quota exceeded, attempting cleanup...')
    // Emergency: clear qr_url and retry
    if (data.sertifikat) data.sertifikat.forEach(s => { s.qr_url = '' })
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e2) {
      console.error('Still exceeded after cleanup. Data may be too large.')
      throw e2
    }
  }
}

// Mimic Supabase query builder
class QueryBuilder {
  constructor(table) {
    this.table = table
    this.filters = []
    this.orderBy = null
    this.limitCount = null
    this.selectFields = '*'
    this.joinData = {}
  }

  select(fields = '*') {
    this.selectFields = fields
    return this
  }

  eq(field, value) {
    this.filters.push({ field, op: 'eq', value })
    return this
  }

  order(field, options = {}) {
    this.orderBy = { field, ascending: options.ascending !== false }
    return this
  }

  limit(count) {
    this.limitCount = count
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  async then(resolve) {
    try {
      const data = getData()
      let items = [...(data[this.table] || [])]

      // Apply filters
      this.filters.forEach(filter => {
        if (filter.op === 'eq') {
          items = items.filter(item => item[filter.field] === filter.value)
        }
      })

      // Apply ordering
      if (this.orderBy) {
        items.sort((a, b) => {
          const aVal = a[this.orderBy.field]
          const bVal = b[this.orderBy.field]
          if (aVal < bVal) return this.orderBy.ascending ? -1 : 1
          if (aVal > bVal) return this.orderBy.ascending ? 1 : -1
          return 0
        })
      }

      // Apply limit
      if (this.limitCount) {
        items = items.slice(0, this.limitCount)
      }

      // Handle joins for select with nested fields
      if (this.selectFields !== '*' && this.selectFields.includes(':')) {
        items = items.map(item => {
          const enhanced = { ...item }
          const joinMatches = this.selectFields.matchAll(/(\w+):(\w+)\s*\(([^)]+)\)/g)
          for (const match of joinMatches) {
            const [, alias, foreignKey, fields] = match
            const foreignId = item[foreignKey]
            if (foreignId) {
              const foreignTable = alias === 'kegiatan' ? 'kegiatan' : alias === 'peserta' ? 'peserta' : alias
              const foreignItem = data[foreignTable]?.find(f => f.id === foreignId)
              if (foreignItem) {
                enhanced[alias] = foreignItem
              }
            }
          }
          return enhanced
        })
      }

      // Handle single
      if (this.isSingle) {
        if (items.length === 0) {
          resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' }, count: null })
        } else {
          resolve({ data: items[0], error: null, count: null })
        }
      } else {
        resolve({ data: items, error: null, count: items.length })
      }
    } catch (error) {
      resolve({ data: null, error, count: null })
    }
  }
}

// Mimic Supabase insert
class InsertBuilder {
  constructor(table, records) {
    this.table = table
    this.records = Array.isArray(records) ? records : [records]
    this.shouldSelect = false
    this.isSingle = false
  }

  select() {
    this.shouldSelect = true
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  async then(resolve) {
    try {
      const data = getData()
      const newRecords = this.records.map(record => ({
        ...record,
        id: record.id || generateId(),
        created_at: record.created_at || new Date().toISOString()
      }))

      data[this.table] = [...(data[this.table] || []), ...newRecords]
      saveData(data)

      const result = this.isSingle ? newRecords[0] : newRecords
      resolve({ data: this.shouldSelect ? result : null, error: null })
    } catch (error) {
      resolve({ data: null, error })
    }
  }
}

// Mimic Supabase update
class UpdateBuilder {
  constructor(table, updates) {
    this.table = table
    this.updates = updates
    this.filters = []
  }

  eq(field, value) {
    this.filters.push({ field, op: 'eq', value })
    return this
  }

  async then(resolve) {
    try {
      const data = getData()
      let updated = false

      data[this.table] = data[this.table].map(item => {
        const matches = this.filters.every(filter => {
          if (filter.op === 'eq') return item[filter.field] === filter.value
          return true
        })

        if (matches) {
          updated = true
          return { ...item, ...this.updates, updated_at: new Date().toISOString() }
        }
        return item
      })

      saveData(data)
      resolve({ data: null, error: updated ? null : { message: 'No rows updated' } })
    } catch (error) {
      resolve({ data: null, error })
    }
  }
}

// Mimic Supabase delete
class DeleteBuilder {
  constructor(table) {
    this.table = table
    this.filters = []
  }

  eq(field, value) {
    this.filters.push({ field, op: 'eq', value })
    return this
  }

  async then(resolve) {
    try {
      const data = getData()
      const originalLength = data[this.table].length

      data[this.table] = data[this.table].filter(item => {
        const matches = this.filters.every(filter => {
          if (filter.op === 'eq') return item[filter.field] === filter.value
          return true
        })
        return !matches
      })

      saveData(data)
      const deleted = originalLength - data[this.table].length
      resolve({ data: null, error: deleted > 0 ? null : { message: 'No rows deleted' } })
    } catch (error) {
      resolve({ data: null, error })
    }
  }
}

// Main localDb object mimicking Supabase client
export const localDb = {
  from(table) {
    return {
      select(fields, options) {
        if (options?.count === 'exact' && options?.head === true) {
          // Count only
          return {
            eq(field, value) {
              return {
                async then(resolve) {
                  const data = getData()
                  const items = data[table] || []
                  const filtered = items.filter(item => item[field] === value)
                  resolve({ data: null, error: null, count: filtered.length })
                }
              }
            },
            async then(resolve) {
              const data = getData()
              const count = (data[table] || []).length
              resolve({ data: null, error: null, count })
            }
          }
        }
        const qb = new QueryBuilder(table)
        if (fields) qb.select(fields)
        return qb
      },

      insert(records) {
        return new InsertBuilder(table, records)
      },

      update(updates) {
        return new UpdateBuilder(table, updates)
      },

      delete() {
        return new DeleteBuilder(table)
      }
    }
  },

  auth: {
    async getSession() {
      const data = getData()
      return { 
        data: { 
          session: data.session ? {
            user: data.session.user
          } : null
        }, 
        error: null 
      }
    },

    onAuthStateChange(callback) {
      // Simple implementation - just call once with current session
      setTimeout(() => {
        const data = getData()
        callback('SIGNED_IN', data.session)
      }, 0)

      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    },

    async signInWithPassword({ email, password }) {
      const data = getData()
      const user = data.users.find(u => u.email === email && u.password === password)
      
      if (!user) {
        return { 
          data: null, 
          error: { message: 'Invalid login credentials' } 
        }
      }

      const profile = data.profiles.find(p => p.user_id === user.id)
      const session = {
        user: {
          id: user.id,
          email: user.email,
          profile
        }
      }

      data.session = session
      saveData(data)

      return { data: { user: session.user, session }, error: null }
    },

    async signUp({ email, password, options }) {
      const data = getData()
      
      // Check if user exists
      if (data.users.find(u => u.email === email)) {
        return {
          data: null,
          error: { message: 'User already exists' }
        }
      }

      const userId = generateId()
      const newUser = {
        id: userId,
        email,
        password,
        created_at: new Date().toISOString()
      }

      const newProfile = {
        id: generateId(),
        user_id: userId,
        nama: options?.data?.nama || 'User',
        email,
        role: 'admin',
        created_at: new Date().toISOString()
      }

      data.users.push(newUser)
      data.profiles.push(newProfile)
      saveData(data)

      return { 
        data: { 
          user: { id: userId, email }
        }, 
        error: null 
      }
    },

    async signOut() {
      const data = getData()
      data.session = null
      saveData(data)
      return { error: null }
    }
  }
}
