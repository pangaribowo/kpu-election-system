import React from 'react'
import { useVoting } from './VotingContext'
import DarkModeToggle from './DarkModeToggle'

const Header = () => {
  const { currentUser, setCurrentUser, setActiveTab, setNotification } = useVoting()

  const handleLogout = () => {
    if (window.confirm('Yakin ingin logout?')) {
      setCurrentUser(null)
      setActiveTab('voting')
      setNotification({ message: 'Berhasil logout!', type: 'success' })
    }
  }

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-xl rounded-xl mb-6 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-center gap-2 relative min-h-[80px] bg-slate-100/90 dark:bg-gray-800/90 rounded-xl">
        {/* Judul dan subjudul */}
        <div className="flex flex-col items-center w-full">
          <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight mb-1 drop-shadow-sm select-none">Sistem Voting KPU</span>
          <span className="text-gray-600 dark:text-gray-300 text-base sm:text-lg font-medium mb-1 select-none">Aman, Cepat, Transparan</span>
        </div>
        {/* Toggle dark mode absolute kanan atas */}
        <div className="absolute right-4 top-4 md:fixed md:right-8 md:top-8 z-50">
          <DarkModeToggle />
        </div>
      </div>
      {/* Neon line modern dengan animasi glow */}
      <div className="mx-auto my-0 w-28 h-1 rounded-full bg-blue-500 dark:bg-blue-400 shadow-[0_0_16px_2px_rgba(59,130,246,0.4)] animate-pulse" />
    </header>
  )
}

export default Header 