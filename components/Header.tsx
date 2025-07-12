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
    <header className="header bg-white dark:bg-gray-800 shadow-md">
      <div className="header-content container mx-auto px-4 py-3 flex items-center justify-center min-h-[96px] relative">
        <div className="title text-center w-full">
          <span className="title-text text-blue-600 dark:text-blue-400 block">Sistem Voting KPU</span>
          <span className="title-sub text-gray-600 dark:text-gray-300 text-base mt-1 block">Aman, Cepat, Transparan</span>
        </div>
        {/* Toggle dark mode mengambang di pojok kanan atas */}
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000 }}>
          <DarkModeToggle />
        </div>
      </div>
      <div className="neon-line bg-blue-500 dark:bg-blue-400"></div>
    </header>
  )
}

export default Header 