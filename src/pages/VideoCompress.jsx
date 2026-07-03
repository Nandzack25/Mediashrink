import React, { useState, useRef } from 'react'
import { compressVideo } from '../utils/videoCodec'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'

export default function VideoCompress() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [compressedFile, setCompressedFile] = useState(null)
  const [compressedUrl, setCompressedUrl] = useState(null)
  const [quality, setQuality] = useState(80)
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const processFileSelection = (selectedFile) => {
    if (!selectedFile) return
    
    setError('')
    setCompressedFile(null)
    setCompressedUrl(null)
    setProgress(0)

    if (!selectedFile.type.startsWith('video/')) {
      setError('Invalid file type. Please upload a video file.')
      return
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('Video too large. Maximum size is 50 MB for manual browser processing.')
      return
    }

    setFile(selectedFile)
  }

  const handleFileChange = (e) => {
    processFileSelection(e.target.files[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleCompress = async () => {
    if (!file) return

    setIsCompressing(true)
    setError('')
    setProgress(0)
    
    try {
      const result = await compressVideo(file, quality, (p) => {
        setProgress(p)
      })
      
      setCompressedFile(result)
      setCompressedUrl(URL.createObjectURL(result))

      if (user) {
        await supabase.from('history').insert({
          user_id: user.id,
          action_type: 'COMPRESS_VIDEO',
          file_name: file.name,
          original_size: file.size,
          result_size: result.size
        })
      }
    } catch (err) {
      setError(err.message || 'An error occurred during video compression.')
    } finally {
      setIsCompressing(false)
    }
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-container-max mx-auto">
      <header className="mb-stack-lg flex flex-col gap-2">
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Video Compression</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Intelligently reduce video size via manual Spatio-Temporal subsampling.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl flex items-center space-x-2 animate-fade-in border border-error/20">
          <span className="material-symbols-outlined">error</span>
          <span className="font-label-md text-label-md">{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-gutter">
        <div className="space-y-stack-md">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors backdrop-blur-md group h-full min-h-[300px] ${
                isDragging 
                  ? 'bg-surface-container border-primary scale-[1.02]' 
                  : 'bg-surface/70 border-outline-variant hover:bg-surface-container hover:border-primary'
              }`}
            >
              <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-fixed group-hover:text-primary transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl">movie</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
                {isDragging ? 'Drop video here' : 'Upload Video File'}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">MP4, WEBM, MOV (max. 50MB)</p>
            </div>
          ) : (
            <div className="bg-surface/70 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center flex-shrink-0 text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>movie</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md font-bold text-on-surface truncate">{file.name}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{formatSize(file.size)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { 
                    setFile(null); 
                    setCompressedFile(null); 
                    setCompressedUrl(null); 
                    setError(''); 
                  }}
                  className="p-2 text-error hover:bg-error-container hover:text-on-error-container rounded-lg transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                  <div className="flex justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface-variant font-bold mb-1">Rasio Kualitas & FPS ({quality}%)</span>
                      <span className="text-xs text-on-surface-variant/80 font-normal mt-1 leading-relaxed">
                        • <b>Kiri (1%):</b> Frame Rate ditekan drastis (5 FPS), resolusi mengecil ekstrim.<br/>
                        • <b>Kanan (100%):</b> Kualitas tertinggi, Frame Rate normal (30 FPS).
                      </span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={quality} 
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Maksimal</span>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Minimal</span>
                  </div>
                </div>
                
                <button
                  onClick={handleCompress}
                  disabled={isCompressing || !file}
                  className="w-full relative overflow-hidden flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-on-primary rounded-xl font-label-md text-label-md font-semibold transition-all shadow-[0_4px_12px_rgba(70,72,212,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isCompressing && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300 ease-linear" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  )}
                  {isCompressing ? (
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                      <span>Processing... {progress}%</span>
                    </div>
                  ) : (
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="material-symbols-outlined">compress</span>
                      <span>Compress Video</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden" 
          />
        </div>

        <div className="space-y-stack-md h-full">
          {!compressedFile ? (
             <div className="h-full min-h-[300px] bg-surface/30 backdrop-blur-sm border-2 border-dashed border-outline-variant/50 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-on-surface-variant">
               <span className="material-symbols-outlined text-6xl mb-4 opacity-20">videocam</span>
               <p className="font-body-md text-body-md">Your processed video will appear here</p>
             </div>
          ) : (
            <div className="bg-primary-fixed/20 backdrop-blur-md rounded-2xl p-6 border border-primary/20 shadow-md animate-slide-up relative overflow-hidden h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider font-bold">Compressed Result (WEBM)</h3>
                <div className="px-3 py-1 bg-surface-container text-primary font-label-sm text-label-sm font-bold rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_down</span>
                  {Math.max(0, Math.round((1 - compressedFile.size / file.size) * 100))}% saved
                </div>
              </div>
              
              <div className="flex-1 bg-surface-container-lowest rounded-xl overflow-hidden mb-6 border border-outline-variant/20 flex flex-col items-center justify-center p-2 min-h-[200px]">
                <video controls src={compressedUrl} className="max-w-full max-h-[400px] object-contain shadow-sm"></video>
              </div>

              <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Final Size</p>
                  <p className="font-headline-md text-headline-md font-bold text-on-surface mt-1">{formatSize(compressedFile.size)}</p>
                </div>
                
                <a 
                  href={compressedUrl}
                  download={compressedFile.name}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-label-md text-label-md font-semibold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">download</span>
                  <span>Download</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
