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
import Header from '../components/Header'

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
      {/* Hamburger selalu tampil di kiri atas */}
      {!isLoginPage && (
        <div className="fixed top-4 left-4 z-40">
          <button
            className="btn-hamburger-modern z-40"
            onClick={() => setSidebarOpen(true)}
            aria-label={isSidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
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
      {/* Sidebar overlay dan overlay hitam */}
      {!isLoginPage && isSidebarOpen && (
        <>
          {/* Overlay hitam, klik untuk menutup sidebar */}
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />
          {/* Sidebar overlay */}
          <div className="fixed inset-y-0 left-0 w-64 z-50">
            <Sidebar
              open={isSidebarOpen}
              setOpen={setSidebarOpen}
              isMobile={isMobile}
              mode={sidebarMode}
              isDark={isDark}
              toggleDarkMode={toggleDarkMode}
            />
          </div>
        </>
      )}
      {/* Main content selalu full width, tidak ada margin kiri */}
      <div className="min-h-screen flex flex-col transition-all duration-500">
        {!isLoginPage && <Header />}
        <Component {...pageProps} />
      </div>
    </VotingProvider>
  )
}

export default MyApp 