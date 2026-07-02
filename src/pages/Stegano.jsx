import React, { useState, useRef } from 'react'
import { encodeMessage, decodeMessage } from '../utils/steganography'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'

export default function Stegano() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('hide') // 'hide' or 'extract'
  
  // States for Hide
  const [hideFile, setHideFile] = useState(null)
  const [secretText, setSecretText] = useState('')
  const [encodedPreview, setEncodedPreview] = useState(null)
  const [isEncoding, setIsEncoding] = useState(false)
  const [isDraggingHide, setIsDraggingHide] = useState(false)
  const hideInputRef = useRef(null)

  // States for Extract
  const [extractFile, setExtractFile] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isDraggingExtract, setIsDraggingExtract] = useState(false)
  const extractInputRef = useRef(null)

  const [error, setError] = useState('')

  const processHideFile = (selectedFile) => {
    if (!selectedFile) return
    setError('')
    setEncodedPreview(null)

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP are supported for hiding.')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.')
      return
    }
    setHideFile(selectedFile)
  }

  const processExtractFile = (selectedFile) => {
    if (!selectedFile) return
    setError('')
    setExtractedText('')

    if (selectedFile.type !== 'image/png') {
      setError('Invalid file type. Encoded images must be PNG format.')
      return
    }
    setExtractFile(selectedFile)
  }

  const handleHideFileChange = (e) => processHideFile(e.target.files[0])
  const handleExtractFileChange = (e) => processExtractFile(e.target.files[0])

  const handleDragOverHide = (e) => { e.preventDefault(); setIsDraggingHide(true); }
  const handleDragLeaveHide = (e) => { e.preventDefault(); setIsDraggingHide(false); }
  const handleDropHide = (e) => {
    e.preventDefault();
    setIsDraggingHide(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processHideFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOverExtract = (e) => { e.preventDefault(); setIsDraggingExtract(true); }
  const handleDragLeaveExtract = (e) => { e.preventDefault(); setIsDraggingExtract(false); }
  const handleDropExtract = (e) => {
    e.preventDefault();
    setIsDraggingExtract(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processExtractFile(e.dataTransfer.files[0])
    }
  }

  const handleEncode = async () => {
    if (!hideFile || !secretText) return

    setIsEncoding(true)
    setError('')
    try {
      const resultBlob = await encodeMessage(hideFile, secretText)
      setEncodedPreview(URL.createObjectURL(resultBlob))

      if (user) {
        await supabase.from('history').insert({
          user_id: user.id,
          action_type: 'STEGANO_HIDE',
          file_name: hideFile.name,
          original_size: hideFile.size,
          result_size: resultBlob.size
        })
      }
    } catch (err) {
      setError(err.message || 'An error occurred during encoding.')
    } finally {
      setIsEncoding(false)
    }
  }

  const handleDecode = async () => {
    if (!extractFile) return

    setIsExtracting(true)
    setError('')
    setExtractedText('')
    try {
      const text = await decodeMessage(extractFile)
      setExtractedText(text)
      
      if (user) {
        await supabase.from('history').insert({
          user_id: user.id,
          action_type: 'STEGANO_EXTRACT',
          file_name: extractFile.name,
          original_size: extractFile.size,
          result_size: null
        })
      }
    } catch (err) {
      setError(err.message || 'An error occurred during decoding.')
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="max-w-container-max mx-auto">
      <header className="mb-stack-lg flex flex-col gap-2">
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Steganography</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Hide secret messages inside images securely using LSB encoding.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl flex items-center space-x-2 animate-fade-in border border-error/20">
          <span className="material-symbols-outlined">error</span>
          <span className="font-label-md text-label-md">{error}</span>
        </div>
      )}

      <div className="bg-surface/70 backdrop-blur-md rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="flex border-b border-outline-variant/20">
          <button
            onClick={() => { setActiveTab('hide'); setError(''); }}
            className={`flex-1 py-4 px-6 font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'hide' 
                ? 'bg-secondary-fixed text-on-secondary-fixed border-b-2 border-secondary' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'hide' ? "'FILL' 1" : "'FILL' 0" }}>visibility_off</span>
            <span>Hide Message</span>
          </button>
          <button
            onClick={() => { setActiveTab('extract'); setError(''); }}
            className={`flex-1 py-4 px-6 font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'extract' 
                ? 'bg-secondary-fixed text-on-secondary-fixed border-b-2 border-secondary' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'extract' ? "'FILL' 1" : "'FILL' 0" }}>search</span>
            <span>Extract Message</span>
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'hide' && (
            <div className="grid md:grid-cols-2 gap-gutter animate-fade-in">
              <div className="space-y-stack-md">
                {!hideFile ? (
                  <div 
                    onClick={() => hideInputRef.current?.click()}
                    onDragOver={handleDragOverHide}
                    onDragLeave={handleDragLeaveHide}
                    onDrop={handleDropHide}
                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group min-h-[300px] ${
                      isDraggingHide 
                        ? 'bg-surface-container border-secondary scale-[1.02]' 
                        : 'bg-surface/30 border-outline-variant hover:bg-surface-container hover:border-secondary'
                    }`}
                  >
                    <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary-fixed group-hover:text-secondary transition-colors text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
                      {isDraggingHide ? 'Drop image here' : 'Upload or Drag Carrier Image'}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">PNG, JPG or WebP (max. 10MB)</p>
                  </div>
                ) : (
                  <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="material-symbols-outlined text-secondary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>image</span>
                        <p className="font-label-md text-label-md font-bold text-on-surface truncate">{hideFile.name}</p>
                      </div>
                      <button 
                        onClick={() => { setHideFile(null); setEncodedPreview(null); }}
                        className="text-sm font-label-md text-error hover:bg-error-container hover:text-on-error-container px-3 py-1 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="space-y-3 flex-1 flex flex-col">
                      <label className="block font-label-md text-label-md text-on-surface">Secret Message</label>
                      <textarea
                        value={secretText}
                        onChange={(e) => setSecretText(e.target.value)}
                        placeholder="Enter the text you want to hide..."
                        className="w-full p-4 border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors bg-background text-on-surface flex-1 resize-none min-h-[120px]"
                      />
                    </div>

                    <button
                      onClick={handleEncode}
                      disabled={isEncoding || !hideFile || !secretText}
                      className="w-full mt-6 flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-secondary to-secondary-container hover:brightness-110 text-on-secondary rounded-xl font-label-md text-label-md font-semibold transition-all shadow-[0_4px_12px_rgba(107,56,212,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isEncoding ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">refresh</span>
                          <span>Encoding...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">enhanced_encryption</span>
                          <span>Hide & Generate</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                <input type="file" ref={hideInputRef} onChange={handleHideFileChange} accept="image/jpeg, image/png, image/webp" className="hidden" />
              </div>

              <div className="h-full">
                {encodedPreview ? (
                  <div className="bg-secondary-fixed/30 rounded-2xl p-6 border border-secondary/20 animate-slide-up h-full flex flex-col shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-label-md text-label-md font-bold text-on-secondary-fixed uppercase tracking-wider">Encoded Result</h3>
                      <span className="text-xs bg-surface-container text-secondary px-3 py-1 rounded-full font-bold">Lossless PNG</span>
                    </div>
                    <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden mb-4 p-2 flex items-center justify-center">
                      <img src={encodedPreview} alt="Encoded" className="max-h-64 object-contain" />
                    </div>
                    <div className="bg-secondary-fixed p-4 rounded-xl font-body-md text-sm text-on-secondary-fixed mb-4 flex gap-2">
                      <span className="material-symbols-outlined text-secondary text-xl">info</span>
                      <p><strong>Note:</strong> The output is converted to PNG to preserve the hidden data. Compressing it later will destroy the message.</p>
                    </div>
                    <a 
                      href={encodedPreview}
                      download={`stegano-${hideFile?.name.split('.')[0] || 'image'}.png`}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined">download</span>
                      <span>Download PNG</span>
                    </a>
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] border-2 border-dashed border-outline-variant/50 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-surface/30 text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">visibility_off</span>
                    <p className="font-body-md text-body-md">Your encoded image will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'extract' && (
            <div className="grid md:grid-cols-2 gap-gutter animate-fade-in">
              <div className="space-y-stack-md">
                {!extractFile ? (
                  <div 
                    onClick={() => extractInputRef.current?.click()}
                    onDragOver={handleDragOverExtract}
                    onDragLeave={handleDragLeaveExtract}
                    onDrop={handleDropExtract}
                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group min-h-[300px] ${
                      isDraggingExtract 
                        ? 'bg-surface-container border-tertiary scale-[1.02]' 
                        : 'bg-surface/30 border-outline-variant hover:bg-surface-container hover:border-tertiary'
                    }`}
                  >
                    <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mb-4 group-hover:bg-tertiary-fixed group-hover:text-tertiary transition-colors text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
                      {isDraggingExtract ? 'Drop encoded image here' : 'Upload or Drag Encoded Image'}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Must be PNG format</p>
                  </div>
                ) : (
                  <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="material-symbols-outlined text-tertiary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>image</span>
                        <p className="font-label-md text-label-md font-bold text-on-surface truncate">{extractFile.name}</p>
                      </div>
                      <button 
                        onClick={() => { setExtractFile(null); setExtractedText(''); }}
                        className="text-sm font-label-md text-error hover:bg-error-container hover:text-on-error-container px-3 py-1 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex-1"></div>

                    <button
                      onClick={handleDecode}
                      disabled={isExtracting || !extractFile}
                      className="w-full mt-6 flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-tertiary to-tertiary-container hover:brightness-110 text-on-tertiary rounded-xl font-label-md text-label-md font-semibold transition-all shadow-[0_4px_12px_rgba(144,73,0,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isExtracting ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">refresh</span>
                          <span>Extracting...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">search</span>
                          <span>Extract Secret Message</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                <input type="file" ref={extractInputRef} onChange={handleExtractFileChange} accept="image/png" className="hidden" />
              </div>

              <div className="h-full">
                {extractedText ? (
                  <div className="bg-tertiary-fixed/30 rounded-2xl p-6 border border-tertiary/20 animate-slide-up h-full flex flex-col shadow-inner">
                    <h3 className="font-label-md text-label-md font-bold text-on-tertiary-fixed mb-4 uppercase tracking-wider">Extracted Message</h3>
                    <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 whitespace-pre-wrap text-on-surface font-body-lg text-body-lg break-words overflow-y-auto max-h-80 shadow-sm">
                      {extractedText}
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] border-2 border-dashed border-outline-variant/50 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-surface/30 text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">search</span>
                    <p className="font-body-md text-body-md">Secret message will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
