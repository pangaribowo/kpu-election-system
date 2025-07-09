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
    <header className="header">
      <div className="header-content">
        <h1 className="title">
          <span className="title-text">PEMILIHAN KETUA</span>
          <span className="title-sub">ORGANISASI 2026</span>
        </h1>
        {currentUser && (
          <div className="user-info">
            <span id="current-user">Selamat datang, {currentUser.name}</span>
            <button id="logout-btn" className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
      <div className="neon-line"></div>
    </header>
  )
}

export default Header 