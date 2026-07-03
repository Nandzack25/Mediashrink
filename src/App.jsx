import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Compress from './pages/Compress'
import Stegano from './pages/Stegano'
import History from './pages/History'

import AudioCompress from './pages/AudioCompress'
import VideoCompress from './pages/VideoCompress'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes inside Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/compress" element={<Compress />} />
              <Route path="/audio" element={<AudioCompress />} />
              <Route path="/video" element={<VideoCompress />} />
              <Route path="/stegano" element={<Stegano />} />
              <Route path="/history" element={<History />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
