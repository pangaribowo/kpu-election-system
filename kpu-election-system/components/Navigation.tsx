import React from 'react'
import { useVoting } from './VotingContext'

const Navigation = () => {
  const { activeTab, setActiveTab, currentUser } = useVoting()

  return (
    <nav className="nav">
      <button
        className={`nav-btn${activeTab === 'voting' ? ' active' : ''}`}
        data-tab="voting"
        onClick={() => setActiveTab('voting')}
      >
        VOTING
      </button>
      <button
        className={`nav-btn${activeTab === 'quickcount' ? ' active' : ''}`}
        data-tab="quickcount"
        onClick={() => setActiveTab('quickcount')}
      >
        QUICK COUNT
      </button>
      {currentUser?.role === 'admin' && (
        <button
          className={`nav-btn admin-only${activeTab === 'admin' ? ' active' : ''}`}
          data-tab="admin"
          onClick={() => setActiveTab('admin')}
        >
          ADMIN
        </button>
      )}
      <button
        className={`nav-btn${activeTab === 'manual' ? ' active' : ''}`}
        data-tab="manual"
        onClick={() => setActiveTab('manual')}
      >
        MANUAL
      </button>
    </nav>
  )
}

export default Navigation 