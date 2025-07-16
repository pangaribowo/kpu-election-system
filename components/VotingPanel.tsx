import React from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'
import { useState } from 'react'
import { FiCheckSquare } from 'react-icons/fi'
import { getValidColor, getCandidateBg, getCandidateTextColor } from '../utils/colors';

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
    // CEGAH VOTING JIKA NOMOR HP BELUM DIISI/TERVERIFIKASI
    if (!currentUser.phone || currentUser.phone === '-' || currentUser.phone.trim() === '') {
      setNotification({ message: 'Anda harus melengkapi nomor HP yang valid sebelum dapat melakukan voting. Anda akan diarahkan ke halaman profil.', type: 'error' })
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1200);
      return
    }
    // Cek status verifikasi email
    const { data: { session } } = await supabase.auth.getSession();
    const provider = session?.user?.app_metadata?.provider;
    if (provider !== 'google' && !session?.user?.email_confirmed_at) {
      setNotification({ message: 'Akun Anda belum diverifikasi. Silakan cek email Anda.', type: 'error' })
      return
    }
    if (hasVoted) {
      setNotification({ message: 'Anda sudah melakukan voting!', type: 'error' })
      return
    }
    try {
      setVotingLoading(candidateId)
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
            mission: k.misi, // Tambahkan mission
            color: k.color || 'blue', // Ambil color dari API, fallback ke blue jika undefined
            votes: k.suara,
          }
        })
        setVotes(newVotes)
        setCandidates(newCandidates)
      }
      // Fetch status voting user ke backend
      try {
        const statusRes = await fetch(`/api/voting?username=${encodeURIComponent(currentUser.username)}`, { cache: 'no-store' })
        if (!statusRes.ok) {
          setNotification({ message: 'Gagal cek status voting. Silakan refresh halaman.', type: 'error' })
          setHasVoted(false)
          setVotingLoading(null)
          console.error('VotingPanel: fetch status voting gagal', statusRes.status)
          return
        }
        const statusData = await statusRes.json()
        setHasVoted(!!statusData.hasVoted)
      } catch (err) {
        setNotification({ message: 'Terjadi kesalahan saat cek status voting. Silakan refresh halaman.', type: 'error' })
        setHasVoted(false)
        setVotingLoading(null)
        console.error('VotingPanel: error fetch status voting', err)
        return
      }
      setNotification({ message: `Terima kasih! Anda telah memilih ${candidates.find((c) => c.id === candidateId)?.name}`, type: 'success' })
      setVotingLoading(null)
    } catch (err) {
      setVotingLoading(null)
      setNotification({ message: 'Terjadi kesalahan jaringan', type: 'error' })
    }
  }

  // Status voting
  let statusContent = null;
  if (!currentUser || !currentUser.username) {
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
        <h2 className="section-title text-3xl font-bold text-center text-blue-700 dark:text-blue-300 mb-8 flex items-center justify-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 mr-1">
            <FiCheckSquare className="text-blue-500 dark:text-blue-400" size={24} />
          </span>
          <span className="drop-shadow-sm">PILIH KANDIDAT ANDA</span>
        </h2>
        <div id="candidates-list" className="candidates-grid gap-6">
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
            const colorClass = getValidColor(candidate.color);
            const cardBg = getCandidateBg(candidate.color);
            const textColor = getCandidateTextColor(candidate.color);
            return (
              <div
                key={candidate.id}
                className={`candidate-card theme-${colorClass} shadow-lg rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-${colorClass}-500 dark:hover:border-${colorClass}-400 relative group`}
                style={{ position: 'relative', overflow: 'hidden', background: cardBg, color: textColor }}
              >
                <div
                  className={`candidate-number w-12 h-12 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white rounded-full theme-${colorClass} bg-gradient-to-br from-${colorClass}-500 to-${colorClass}-700 shadow-lg`}
                >
                  {idx + 1}
                </div>
                <div className="candidate-name text-xl font-semibold mb-2 flex items-center justify-center gap-2" style={{color: textColor}}>
                  {candidate.name}
                  {isVoted && (
                    <span className="inline-block align-middle text-green-200 animate-bounce" title="Kandidat yang dipilih">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </span>
                  )}
                </div>
                <div className="candidate-vision-mission flex flex-col gap-1 mb-4 h-24 overflow-y-auto" style={{color: textColor}}>
                  <div><span className="font-semibold">Visi:</span> {candidate.vision || '-'}</div>
                  <div><span className="font-semibold">Misi:</span> {candidate.mission || '-'}</div>
                </div>
                <button
                  className={`vote-btn w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-${colorClass}-400 focus:ring-offset-2
                    dark:focus:ring-offset-gray-800
                    ${isDisabled ? 'bg-gray-300 dark:bg-gray-700 text-black dark:text-white cursor-not-allowed' : `bg-${colorClass}-600 hover:bg-${colorClass}-700 text-white dark:bg-${colorClass}-500 dark:hover:bg-${colorClass}-400 dark:text-white active:scale-95`}`}
                  onClick={() => handleVote(candidate.id)}
                  disabled={isDisabled || votingLoading !== null}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  {votingLoading === candidate.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="loader border-2 border-t-2 border-t-white border-white/30 rounded-full w-5 h-5 animate-spin"></span>
                      <span className={`text-${colorClass}-700 dark:text-${colorClass}-200`}>Memilih...</span>
                    </span>
                  ) : (
                    <span className={`font-bold`}>{buttonText}</span>
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