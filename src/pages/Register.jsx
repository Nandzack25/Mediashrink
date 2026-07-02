import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 w-full">
      <div className="w-full max-w-md bg-surface/70 backdrop-blur-md rounded-2xl shadow-lg border border-outline-variant/10 p-8 animate-slide-up">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
          </div>
        </div>
        <h2 className="font-headline-md text-headline-md font-bold text-center text-on-surface mb-2">Create an Account</h2>
        <p className="font-body-md text-body-md text-center text-on-surface-variant mb-8">Join MediaShrink & Hide today</p>
        
        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded-xl text-sm mb-6 animate-fade-in flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">mail</span>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-surface-container-lowest text-on-surface"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">lock</span>
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-surface-container-lowest text-on-surface"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl font-label-md text-label-md font-semibold text-on-primary bg-primary hover:bg-primary/90 transition-all shadow-[0_4px_12px_rgba(70,72,212,0.2)] disabled:opacity-70 disabled:cursor-not-allowed mt-6 gap-2"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
