import React from 'react'
import { useVoting } from './VotingContext'

const VotingPanel = () => {
  const {
    candidates,
    setCandidates,
    votes,
    setVotes,
    currentUser,
    hasVoted,
    setHasVoted,
    setNotification,
  } = useVoting()

  const handleVote = (candidateId: number) => {
    if (currentUser?.role !== 'user') {
      setNotification({ message: 'Hanya pemilih yang dapat melakukan voting!', type: 'error' })
      return
    }
    if (hasVoted) {
      setNotification({ message: 'Anda sudah melakukan voting!', type: 'error' })
      return
    }
    const updatedVotes = { ...votes }
    updatedVotes[candidateId] = (updatedVotes[candidateId] || 0) + 1
    setVotes(updatedVotes)
    setHasVoted(true)
    setCandidates(
      candidates.map((c) =>
        c.id === candidateId ? { ...c, votes: (updatedVotes[candidateId] || 0) } : c
      )
    )
    setNotification({ message: `Terima kasih! Anda telah memilih ${candidates.find((c) => c.id === candidateId)?.name}`, type: 'success' })
  }

  // Status voting
  let statusContent = null
  if (currentUser?.role !== 'user') {
    statusContent = (
      <div style={{ textAlign: 'center', padding: 20, background: 'rgba(59,130,246,0.1)', border: '2px solid var(--accent-primary)', borderRadius: 10, marginTop: 20 }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: 10 }}>ℹ️ INFORMASI</h3>
        <p>Login sebagai Pemilih untuk dapat melakukan voting</p>
      </div>
    )
  } else if (hasVoted) {
    statusContent = (
      <div style={{ textAlign: 'center', padding: 20, background: 'rgba(5,150,105,0.1)', border: '2px solid var(--accent-success)', borderRadius: 10, marginTop: 20 }}>
        <h3 style={{ color: 'var(--accent-success)', marginBottom: 10 }}>✓ VOTING BERHASIL</h3>
        <p>Terima kasih telah berpartisipasi dalam pemilihan!</p>
      </div>
    )
  } else {
    statusContent = (
      <div style={{ textAlign: 'center', padding: 20, background: 'rgba(217,119,6,0.1)', border: '2px solid var(--accent-warning)', borderRadius: 10, marginTop: 20 }}>
        <h3 style={{ color: 'var(--accent-warning)', marginBottom: 10 }}>⚠ BELUM MEMILIH</h3>
        <p>Silakan pilih kandidat favorit Anda!</p>
      </div>
    )
  }

  return (
    <section id="voting" className="section active">
      <div className="voting-container">
        <h2 className="section-title">PILIH KANDIDAT ANDA</h2>
        <div id="candidates-list" className="candidates-grid">
          {candidates.map((candidate) => {
            const isDisabled = hasVoted || currentUser?.role !== 'user'
            const buttonText = hasVoted
              ? 'SUDAH MEMILIH'
              : currentUser?.role !== 'user'
                ? 'LOGIN SEBAGAI PEMILIH'
                : 'PILIH'
            return (
              <div key={candidate.id} className={`candidate-card theme-${candidate.color}`}>
                <div className={`candidate-number theme-${candidate.color}`}>{candidate.id}</div>
                <div className="candidate-name">{candidate.name}</div>
                <div className="candidate-vision">{candidate.vision}</div>
                <button
                  className="vote-btn"
                  onClick={() => handleVote(candidate.id)}
                  disabled={isDisabled}
                >
                  {buttonText}
                </button>
              </div>
            )
          })}
        </div>
        <div className="vote-status" id="vote-status">
          {statusContent}
        </div>
      </div>
    </section>
  )
}

export default VotingPanel 