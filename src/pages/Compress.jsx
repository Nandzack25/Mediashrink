import React, { useState, useRef } from 'react'
import { compressImage } from '../utils/compression'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'

export default function Compress() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [compressedFile, setCompressedFile] = useState(null)
  const [compressedPreview, setCompressedPreview] = useState(null)
  const [quality, setQuality] = useState(80)
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [originalDimensions, setOriginalDimensions] = useState(null)
  const fileInputRef = useRef(null)

  const processFileSelection = (selectedFile) => {
    if (!selectedFile) return
    
    setError('')
    setCompressedFile(null)
    setCompressedPreview(null)

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP are supported.')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.')
      return
    }

    setFile(selectedFile)
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)
    
    const img = new Image()
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height })
    }
    img.src = objectUrl
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
    try {
      const result = await compressImage(file, quality)
      setCompressedFile(result)
      setCompressedPreview(URL.createObjectURL(result))

      // Insert to history
      if (user) {
        await supabase.from('history').insert({
          user_id: user.id,
          action_type: 'COMPRESS',
          file_name: file.name,
          original_size: file.size,
          result_size: result.size
        })
      }
    } catch (err) {
      setError(err.message || 'An error occurred during compression. Please try again.')
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

  const getEstimatedSize = () => {
    if (!originalDimensions) return '-'
    const scale = Math.max(0.1, quality / 100)
    const targetWidth = Math.floor(originalDimensions.width * scale)
    const targetHeight = Math.floor(originalDimensions.height * scale)
    
    // Raw pixels size (Width * Height * 3 bytes for RGB)
    const rawSize = targetWidth * targetHeight * 3
    // Standard JPEG 80% compression ratio is typically around 12:1 to 15:1
    const estimatedBytes = Math.floor(rawSize / 12)
    
    return formatSize(Math.max(1024, estimatedBytes)) // Minimum 1KB
  }

  return (
    <div className="max-w-container-max mx-auto">
      <header className="mb-stack-lg flex flex-col gap-2">
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Compress Image</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Optimize your images intelligently using Spatial Downscaling.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl flex items-center space-x-2 animate-fade-in border border-error/20">
          <span className="material-symbols-outlined">error</span>
          <span className="font-label-md text-label-md">{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-gutter">
        {/* Left Column - Input & Controls */}
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
                <span className="material-symbols-outlined text-4xl">cloud_upload</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
                {isDragging ? 'Drop image here' : 'Upload or Drag an image'}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">PNG, JPG or WebP (max. 10MB)</p>
            </div>
          ) : (
            <div className="bg-surface/70 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center flex-shrink-0 text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>image</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md font-bold text-on-surface truncate">{file.name}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{formatSize(file.size)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { 
                    setFile(null); 
                    setPreview(null); 
                    setCompressedFile(null); 
                    setCompressedPreview(null); 
                    setError(''); 
                    setOriginalDimensions(null);
                  }}
                  className="p-2 text-error hover:bg-error-container hover:text-on-error-container rounded-lg transition-colors flex items-center justify-center"
                  title="Remove"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                  <div className="flex justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface-variant font-bold mb-1">Rasio Spasial ({quality}%)</span>
                      <span className="text-xs text-on-surface-variant/80 font-normal mt-1 leading-relaxed">
                        • <b>Geser ke Kiri (1%):</b> Resolusi dikecilkan drastis, ukuran file (*JPEG*) menjadi sangat kecil.<br/>
                        • <b>Geser ke Kanan (100%):</b> Kembali ke ukuran dan dimensi awal (Kondisi Awal).
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
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Kompres Maksimal (Kecil)</span>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Kualitas Maksimal (Besar)</span>
                  </div>
                  
                  {originalDimensions && (
                    <div className="mt-5 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Estimasi Ukuran File JPEG Hasil:</p>
                        <p className="font-headline-sm text-headline-sm font-bold text-primary">{getEstimatedSize()}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Estimasi Dimensi Baru:</p>
                        <p className="font-label-md text-label-md font-bold text-on-surface">
                          {Math.floor(originalDimensions.width * Math.max(0.1, quality / 100))} x {Math.floor(originalDimensions.height * Math.max(0.1, quality / 100))} px
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleCompress}
                  disabled={isCompressing || !file}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-on-primary rounded-xl font-label-md text-label-md font-semibold transition-all shadow-[0_4px_12px_rgba(70,72,212,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isCompressing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                      <span>Compressing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">compress</span>
                      <span>Compress Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/webp"
            className="hidden" 
          />
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-stack-md h-full">
          {preview && !compressedPreview && (
            <div className="bg-surface/70 backdrop-blur-md rounded-2xl p-6 border border-outline-variant/10 shadow-sm animate-fade-in h-full flex flex-col">
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-4 uppercase tracking-wider">Original Preview</h3>
              <div className="flex-1 bg-surface-container-lowest rounded-xl overflow-hidden relative border border-outline-variant/20 flex items-center justify-center min-h-[300px]">
                <img src={preview} alt="Original" className="max-w-full max-h-[400px] object-contain p-2" />
              </div>
            </div>
          )}

          {compressedPreview && (
            <div className="bg-primary-fixed/20 backdrop-blur-md rounded-2xl p-6 border border-primary/20 shadow-md animate-slide-up relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider font-bold">Compressed Result</h3>
                <div className="px-3 py-1 bg-surface-container text-primary font-label-sm text-label-sm font-bold rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_down</span>
                  {Math.max(0, Math.round((1 - compressedFile.size / file.size) * 100))}% saved
                </div>
              </div>
              
              <div className="flex-1 bg-surface-container-lowest rounded-xl overflow-hidden mb-6 relative z-10 border border-outline-variant/20 flex items-center justify-center min-h-[300px]">
                <img src={compressedPreview} alt="Compressed" className="max-w-full max-h-[400px] object-contain p-2" />
              </div>

              <div className="flex items-center justify-between relative z-10 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Final Size</p>
                  <p className="font-headline-md text-headline-md font-bold text-on-surface mt-1">{formatSize(compressedFile.size)}</p>
                </div>
                
                <a 
                  href={compressedPreview}
                  download={compressedFile.name}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-label-md text-label-md font-semibold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">download</span>
                  <span>Download</span>
                </a>
              </div>
            </div>
          )}

          {!preview && !compressedPreview && (
            <div className="h-full min-h-[300px] bg-surface/30 backdrop-blur-sm border-2 border-dashed border-outline-variant/50 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-20">image</span>
              <p className="font-body-md text-body-md">Your preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
