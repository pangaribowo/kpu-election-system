import React from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'

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

  const handleVote = async (candidateId: number) => {
    if (currentUser?.role !== 'user') {
      setNotification({ message: 'Hanya pemilih yang dapat melakukan voting!', type: 'error' })
      return
    }
    // Cek status verifikasi email
    const session = supabase.auth.getSession && (await supabase.auth.getSession()).data.session
    if (!session?.user?.email_confirmed_at) {
      setNotification({ message: 'Akun Anda belum diverifikasi. Silakan cek email Anda.', type: 'error' })
      return
    }
    if (hasVoted) {
      setNotification({ message: 'Anda sudah melakukan voting!', type: 'error' })
      return
    }
    try {
      const res = await fetch('/api/voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kandidat_id: candidateId, username: currentUser.username })
      })
      const result = await res.json()
      if (!res.ok) {
        setNotification({ message: result.error || 'Voting gagal', type: 'error' })
        return
      }
      // Ambil quick count terbaru setelah voting
      const quickCountRes = await fetch('/api/voting')
      const quickCountData = await quickCountRes.json()
      if (quickCountRes.ok && quickCountData.hasil) {
        // Update votes dan candidates dari hasil backend
        const newVotes: Record<number, number> = {}
        const newCandidates = quickCountData.hasil.map((k: any) => {
          newVotes[k.id] = k.suara
          return {
            id: k.id,
            name: k.nama,
            vision: k.visi,
            color: candidates.find((c) => c.id === k.id)?.color || 'blue',
            votes: k.suara,
          }
        })
        setVotes(newVotes)
        setCandidates(newCandidates)
      }
      // Fetch status voting user ke backend
      const statusRes = await fetch(`/api/voting?username=${encodeURIComponent(currentUser.username)}`)
      const statusData = await statusRes.json()
      setHasVoted(!!statusData.hasVoted)
      setNotification({ message: `Terima kasih! Anda telah memilih ${candidates.find((c) => c.id === candidateId)?.name}`, type: 'success' })
    } catch (err) {
      setNotification({ message: 'Terjadi kesalahan jaringan', type: 'error' })
    }
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