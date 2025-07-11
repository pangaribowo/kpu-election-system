import React from 'react'
import { useVoting } from './VotingContext'

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
      <div className="header-content container mx-auto px-4 py-3">
        <div className="title text-center">
          <span className="title-text text-blue-600 dark:text-blue-400">PEMILIHAN KETUA</span>
          <span className="title-sub text-gray-600 dark:text-gray-300">ORGANISASI 2026</span>
        </div>
        {currentUser && (
          <div className="user-info absolute top-4 right-4 flex items-center space-x-3">
            <span id="current-user" className="text-sm text-gray-700 dark:text-gray-200">Selamat datang, {currentUser.name}</span>
            <button
              id="logout-btn"
              className="btn-logout bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <div className="neon-line bg-blue-500 dark:bg-blue-400"></div>
    </header>
  )
}

export default Header 