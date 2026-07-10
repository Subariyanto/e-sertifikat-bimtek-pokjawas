import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Kegiatan from './pages/Kegiatan'
import Peserta from './pages/Peserta'
import VerifikasiPublik from './pages/VerifikasiPublik'
import GenerateSertifikat from './pages/GenerateSertifikat'
import Templates from './pages/Templates'
import Pengaturan from './pages/Pengaturan'
import VerifikasiAdmin from './pages/VerifikasiAdmin'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verifikasi" element={<VerifikasiPublik />} />
          <Route path="/verifikasi/:kode" element={<VerifikasiPublik />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/kegiatan" element={
            <ProtectedRoute>
              <Kegiatan />
            </ProtectedRoute>
          } />
          <Route path="/peserta" element={
            <ProtectedRoute>
              <Peserta />
            </ProtectedRoute>
          } />
          
          {/* Placeholder routes - akan dilengkapi */}
          <Route path="/templates" element={
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          } />
          <Route path="/generate" element={
            <ProtectedRoute>
              <GenerateSertifikat />
            </ProtectedRoute>
          } />
          <Route path="/verifikasi" element={
            <ProtectedRoute>
              <VerifikasiAdmin />
            </ProtectedRoute>
          } />
          <Route path="/pengaturan" element={
            <ProtectedRoute>
              <Pengaturan />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
