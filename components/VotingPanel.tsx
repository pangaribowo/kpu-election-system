import React from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'
import { useState } from 'react'

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

  const [votingLoading, setVotingLoading] = useState<number | null>(null)

  const handleVote = async (candidateId: number) => {
    // BEST PRACTICE 2025: Validasi context user & payload sebelum submit voting
    if (!currentUser || !currentUser.username) {
      setNotification({ message: 'Anda harus login sebagai pemilih untuk voting.', type: 'error' })
      return
    }
    if (!candidateId) {
      setNotification({ message: 'Kandidat tidak valid.', type: 'error' })
      return
    }
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
      setVotingLoading(candidateId)
      // Log payload voting
      console.log('[VOTING] Submit payload:', { kandidat_id: candidateId, username: currentUser.username })
      const res = await fetch('/api/voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kandidat_id: candidateId, username: String(currentUser.username) })
      })
      const result = await res.json()
      if (!res.ok) {
        setNotification({ message: result.error || 'Voting gagal', type: 'error' })
        setVotingLoading(null)
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
      setVotingLoading(null)
    } catch (err) {
      setVotingLoading(null)
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
  } else if (!currentUser?.phone_verified) {
    statusContent = (
      <div className="status-warning text-center p-5 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-500 dark:border-yellow-700 rounded-lg mt-5">
        <h3 className="text-yellow-600 dark:text-yellow-400 mb-2 text-lg font-semibold">
          ⚠ FITUR VERIFIKASI NOMOR HP SEGERA HADIR
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Saat ini hanya <b>user yang sudah terverifikasi</b> yang dapat melakukan voting.<br />
          Fitur verifikasi nomor HP & OTP akan segera hadir (Coming Soon).<br />
          <span className="block mt-2">Setiap <b>Pemilih</b> hanya dapat memberikan <b>1 suara</b> untuk menjaga keadilan dan integritas sistem voting.</span>
        </p>
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
          {candidates.map((candidate, idx) => {
            const isDisabled = hasVoted || currentUser?.role !== "user" || votingLoading !== null;
            const isVoted = hasVoted && votes && votes[candidate.id] > 0;
            const buttonText = hasVoted
              ? isVoted ? "✓ SUDAH MEMILIH" : "SUDAH MEMILIH"
              : currentUser?.role !== "user"
              ? "LOGIN SEBAGAI PEMILIH"
              : votingLoading === candidate.id
              ? "Memilih..."
              : "PILIH";
            return (
              <div
                key={candidate.id}
                className={`candidate-card bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 relative group`}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <div
                  className={`candidate-number w-12 h-12 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white rounded-full theme-${candidate.color} bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg`}
                >
                  {idx + 1}
                </div>
                <div className="candidate-name text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center justify-center gap-2">
                  {candidate.name}
                  {isVoted && (
                    <span className="inline-block align-middle text-green-500 animate-bounce" title="Kandidat yang dipilih">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </span>
                  )}
                </div>
                <div className="candidate-vision text-sm text-gray-600 dark:text-gray-300 mb-4 h-20 overflow-y-auto">
                  {candidate.vision}
                </div>
                <button
                  className={`vote-btn w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                    dark:focus:ring-offset-gray-800
                    ${isDisabled ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white active:scale-95'}`}
                  onClick={() => handleVote(candidate.id)}
                  disabled={isDisabled || votingLoading !== null}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  {votingLoading === candidate.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="loader border-2 border-t-2 border-t-white border-white/30 rounded-full w-5 h-5 animate-spin"></span>
                      <span className="text-blue-700 dark:text-blue-200">Memilih...</span>
                    </span>
                  ) : (
                    <span className="text-blue-50 dark:text-white font-bold">{buttonText}</span>
                  )}
                </button>
                {/* Animasi ripple pada klik (opsional, bisa pakai JS/React state jika ingin lebih advance) */}
                <style jsx>{`
                  .loader {
                    border-top-color: #fff;
                    border-right-color: #fff;
                    border-bottom-color: #fff;
                    border-left-color: #3b82f6;
                  }
                `}</style>
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