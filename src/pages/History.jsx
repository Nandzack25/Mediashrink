import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'

export default function History() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchHistory()
    }
  }, [user])

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setHistory(data || [])
    } catch (err) {
      console.error('Error fetching history:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes) => {
    if (!bytes) return '-'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (isoString) => {
    const d = new Date(isoString)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getActionBadge = (type) => {
    switch (type) {
      case 'COMPRESS':
        return <span className="px-3 py-1 bg-primary-fixed text-primary rounded-full text-xs font-bold tracking-wider">COMPRESS</span>
      case 'STEGANO_HIDE':
        return <span className="px-3 py-1 bg-secondary-fixed text-secondary rounded-full text-xs font-bold tracking-wider">STEG HIDE</span>
      case 'STEGANO_EXTRACT':
        return <span className="px-3 py-1 bg-tertiary-fixed text-tertiary rounded-full text-xs font-bold tracking-wider">STEG EXTRACT</span>
      default:
        return type
    }
  }

  return (
    <div className="max-w-container-max mx-auto h-full flex flex-col">
      <header className="mb-stack-lg flex flex-col gap-2">
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">History</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Track your recent media operations.</p>
      </header>

      <div className="bg-surface/70 backdrop-blur-md rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden flex-1 animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20">
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">File Name</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Original Size</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Result Size</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-50">history</span>
                      <p className="font-body-md">No history found yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 font-body-md text-on-surface truncate max-w-[200px]" title={row.file_name}>{row.file_name}</td>
                    <td className="px-6 py-4">{getActionBadge(row.action_type)}</td>
                    <td className="px-6 py-4 font-body-md text-on-surface-variant">{formatSize(row.original_size)}</td>
                    <td className="px-6 py-4 font-body-md text-on-surface-variant">{formatSize(row.result_size)}</td>
                    <td className="px-6 py-4 font-body-md text-on-surface-variant">{formatDate(row.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
