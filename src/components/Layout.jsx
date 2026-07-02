import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Compress Image', path: '/compress', icon: 'compress' },
    { name: 'Steganography', path: '/stegano', icon: 'enhanced_encryption' },
    { name: 'History', path: '/history', icon: 'history' },
  ]

  return (
    <>
      {/* SideNavBar */}
      <nav className={`md:flex h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/20 bg-surface/70 backdrop-blur-xl shadow-lg shadow-primary/5 flex-col p-gutter z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="mb-stack-lg flex items-center justify-between">
          <div>
            <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-primary">MediaShrink</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Premium Media Tools</p>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-out font-label-md text-label-md ${
                      isActive 
                        ? 'bg-gradient-to-r from-primary to-secondary text-on-primary shadow-[0_4px_12px_rgba(70,72,212,0.3)] active:scale-95' 
                        : 'text-on-surface-variant hover:text-primary hover:translate-x-1'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        
        <div className="mt-auto space-y-4">
          <ul className="space-y-2 border-t border-outline-variant/20 pt-4">
            <li>
              <div className="flex items-center gap-3 px-4 py-2 text-on-surface-variant font-label-sm text-label-sm rounded-lg">
                <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-primary uppercase font-bold text-xs">
                  {user?.email?.charAt(0)}
                </div>
                <span className="truncate flex-1">{user?.email}</span>
              </div>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-error transition-colors font-label-sm text-label-sm rounded-lg"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative w-full">
        {/* TopAppBar */}
        <header className="w-full sticky top-0 z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/10 shadow-sm flex items-center justify-between px-margin-x py-stack-md">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-on-surface-variant p-2 rounded-lg hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          <div className="md:hidden">
            <span className="font-headline-md text-headline-md font-bold text-primary">MediaShrink</span>
          </div>
          
          {/* Empty div for flex spacing on desktop */}
          <div className="hidden md:block flex-1"></div>
          
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-primary-container/10 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-primary-container/10 transition-colors hidden sm:block">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed shadow-sm cursor-pointer hover:border-primary transition-colors flex items-center justify-center bg-surface-container-high text-primary font-bold uppercase">
              {user?.email?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Canvas / Main Content */}
        <div className="flex-1 p-margin-x max-w-container-max mx-auto w-full space-y-stack-lg animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </>
  )
}
