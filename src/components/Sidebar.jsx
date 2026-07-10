import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, FileText, Users, Layout, FileCheck, Settings, 
  Menu, X, LogOut, Award 
} from 'lucide-react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Data Kegiatan', path: '/kegiatan' },
    { icon: Users, label: 'Data Peserta', path: '/peserta' },
    { icon: Layout, label: 'Template Sertifikat', path: '/templates' },
    { icon: Award, label: 'Generate Sertifikat', path: '/generate' },
    { icon: FileCheck, label: 'Verifikasi Sertifikat', path: '/verifikasi' },
    { icon: Settings, label: 'Pengaturan', path: '/pengaturan' },
  ]

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-kemenag-green text-white rounded-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay untuk mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen
          bg-kemenag-green text-white
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              {isOpen && (
                <div className="flex-1">
                  <h1 className="font-bold text-lg">e-Sertifikat</h1>
                  <p className="text-xs text-kemenag-gold">Pokjawas Jember</p>
                </div>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:block p-1 hover:bg-white/10 rounded"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      hover:bg-white/10 transition-colors
                      ${window.location.pathname === item.path ? 'bg-white/20' : ''}
                    `}
                  >
                    <item.icon size={20} />
                    {isOpen && <span className="text-sm">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer - Logout */}
          <div className="p-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={20} />
              {isOpen && <span className="text-sm">Keluar</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
