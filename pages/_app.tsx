import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { VotingProvider } from '../components/VotingContext'
import Sidebar from '../components/Sidebar'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import Notification from '../components/Notification'
import dynamic from 'next/dynamic'
import type { FC } from 'react'
import { Moon, Sun } from 'lucide-react'
import DarkModeToggle from '../components/DarkModeToggle'

// Import Hamburger dari hamburger-react (dynamic agar SSR aman)
const Hamburger = dynamic(() => import('hamburger-react').then(mod => mod.default), { ssr: false }) as FC<any>;

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isLoginPage = router.pathname === '/login'
  const [isSidebarOpen, setSidebarOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [isDark, setIsDark] = React.useState(false)

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 900)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Dark mode auto-detect & sync
  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  const toggleDarkMode = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  // Mode sidebar: drawer (mobile) atau fixed (desktop)
  const sidebarMode = isMobile ? 'drawer' : 'fixed'
  return (
    <VotingProvider>
      <Notification />
      {/* Toggle dark mode global, hanya jika bukan halaman login */}
      {!isLoginPage && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000 }}>
          <DarkModeToggle />
        </div>
      )}
      {/* Kontainer baris atas: hamburger kiri */}
      {!isLoginPage && (
        <div className="fixed top-4 left-4 z-[200]"> {/* Adjusted left padding */}
          <button
            className="btn-hamburger-modern"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen && isMobile ? 'Tutup Sidebar' : 'Buka Sidebar'}
          >
            <span className="block transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 group-active:scale-95">
              <Hamburger
                toggled={isSidebarOpen}
                toggle={() => setSidebarOpen(!isSidebarOpen)}
                size={28}
                rounded
                color={isDark ? '#60a5fa' : '#2563eb'}
                duration={0.5}
                distance="sm"
                direction="left"
              />
            </span>
          </button>
        </div>
      )}
      {/* Overlay hanya di mobile + sidebar open */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar hanya render jika open, kirim prop dark mode */}
      {!isLoginPage && isSidebarOpen && (
        <Sidebar open={isSidebarOpen} setOpen={setSidebarOpen} isMobile={isMobile} mode={sidebarMode} isDark={isDark} toggleDarkMode={toggleDarkMode} />
      )}
      <div className={!isLoginPage && !isMobile && isSidebarOpen ? 'ml-64 transition-all duration-500' : ''}>
        <Component {...pageProps} />
      </div>
    </VotingProvider>
  )
}

export default MyApp 