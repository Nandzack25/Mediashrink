import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'

export default function Dashboard() {
  const { user } = useAuth()
  const [compressCount, setCompressCount] = useState(0)
  const [steganoCount, setSteganoCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      // Fetch compress count
      const { count: cCount, error: cErr } = await supabase
        .from('history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action_type', 'COMPRESS')
      
      if (!cErr && cCount !== null) setCompressCount(cCount)

      // Fetch stegano count
      const { count: sCount, error: sErr } = await supabase
        .from('history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('action_type', ['STEGANO_HIDE', 'STEGANO_EXTRACT'])

      if (!sErr && sCount !== null) setSteganoCount(sCount)
      
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    }
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Dashboard</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Welcome back, {user?.email}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Stat Card 1 */}
        <div className="bg-surface/70 backdrop-blur-md rounded-xl p-6 shadow-[0_8px_16px_-4px_rgba(99,102,241,0.05)] border border-outline-variant/10 flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">image</span>
            </div>
            <div className="bg-surface-variant text-primary px-2 py-1 rounded-full flex items-center gap-1 font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">history</span>
            </div>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Images Compressed</p>
            <p className="font-headline-md text-headline-md font-bold text-on-surface">{compressCount}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-surface/70 backdrop-blur-md rounded-xl p-6 shadow-[0_8px_16px_-4px_rgba(99,102,241,0.05)] border border-outline-variant/10 flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-xl group-hover:bg-secondary/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <div className="bg-surface-variant text-secondary px-2 py-1 rounded-full flex items-center gap-1 font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">history</span>
            </div>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">Steganography Operations</p>
            <p className="font-headline-md text-headline-md font-bold text-on-surface">{steganoCount}</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Feature Card 1: Compress Image */}
        <div className="bg-surface/70 backdrop-blur-md rounded-xl p-8 border border-outline-variant/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start gap-6 group">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>compress</span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Compress Image</h3>
            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">
              Reduce file sizes intelligently without losing perceived quality. Optimize your media for faster loading times and reduced storage costs with our advanced compression algorithms.
            </p>
          </div>
          <Link to="/compress" className="mt-4 px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-label-md text-label-md font-semibold hover:brightness-110 transition-all duration-200 shadow-[0_4px_12px_rgba(70,72,212,0.2)]">
            Get Started
          </Link>
        </div>

        {/* Feature Card 2: Steganography */}
        <div className="bg-surface/70 backdrop-blur-md rounded-xl p-8 border border-outline-variant/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start gap-6 group">
          <div className="w-16 h-16 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>enhanced_encryption</span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Steganography</h3>
            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">
              Hide sensitive information securely within standard image files. Ensure your private data remains undetected while maintaining the original appearance of the carrier image.
            </p>
          </div>
          <Link to="/stegano" className="mt-4 px-6 py-3 bg-gradient-to-r from-secondary to-secondary-container text-on-secondary rounded-xl font-label-md text-label-md font-semibold hover:brightness-110 transition-all duration-200 shadow-[0_4px_12px_rgba(107,56,212,0.2)]">
            Get Started
          </Link>
        </div>
      </div>
    </>
  )
}
