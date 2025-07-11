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
  let statusContent = null;
  if (currentUser?.role !== "user") {
    statusContent = (
      <div className="status-info text-center p-5 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-700 rounded-lg mt-5">
        <h3 className="text-blue-600 dark:text-blue-400 mb-2 text-lg font-semibold">
          ℹ️ INFORMASI
        </h3>
        <p className="text-gray-700 dark:text-gray-300">Login sebagai Pemilih untuk dapat melakukan voting</p>
      </div>
    );
  } else if (hasVoted) {
    statusContent = (
      <div className="status-success text-center p-5 bg-green-50 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-700 rounded-lg mt-5">
        <h3 className="text-green-600 dark:text-green-400 mb-2 text-lg font-semibold">
          ✓ VOTING BERHASIL
        </h3>
        <p className="text-gray-700 dark:text-gray-300">Terima kasih telah berpartisipasi dalam pemilihan!</p>
      </div>
    );
  } else {
    statusContent = (
      <div className="status-warning text-center p-5 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-500 dark:border-yellow-700 rounded-lg mt-5">
        <h3 className="text-yellow-600 dark:text-yellow-400 mb-2 text-lg font-semibold">
          ⚠ BELUM MEMILIH
        </h3>
        <p className="text-gray-700 dark:text-gray-300">Silakan pilih kandidat favorit Anda!</p>
      </div>
    );
  }

  return (
    <section id="voting" className="section active py-8 px-4">
      <div className="voting-container container mx-auto">
        <h2 className="section-title text-3xl font-bold text-center text-blue-700 dark:text-blue-300 mb-8">
          PILIH KANDIDAT ANDA
        </h2>
        <div id="candidates-list" className="candidates-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => {
            const isDisabled = hasVoted || currentUser?.role !== "user";
            const buttonText = hasVoted
              ? "SUDAH MEMILIH"
              : currentUser?.role !== "user"
              ? "LOGIN SEBAGAI PEMILIH"
              : "PILIH";
            return (
              <div
                key={candidate.id}
                className={`candidate-card bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center transition-all hover:shadow-xl theme-${candidate.color}`}
              >
                <div
                  className={`candidate-number w-12 h-12 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white rounded-full theme-${candidate.color}`}
                >
                  {candidate.id}
                </div>
                <div className="candidate-name text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {candidate.name}
                </div>
                <div className="candidate-vision text-sm text-gray-600 dark:text-gray-300 mb-4 h-20 overflow-y-auto">
                  {candidate.vision}
                </div>
                <button
                  className="vote-btn w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  onClick={() => handleVote(candidate.id)}
                  disabled={isDisabled}
                >
                  {buttonText}
                </button>
              </div>
            );
          })}
        </div>
        <div className="vote-status mt-8" id="vote-status">
          {statusContent}
        </div>
      </div>
    </section>
  );
}

export default VotingPanel 