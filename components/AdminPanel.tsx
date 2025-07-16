import React, { useRef } from 'react'
import { useVoting } from './VotingContext'
import { getValidColor, COLOR_MAP } from '../utils/colors';
import { FiRefreshCw, FiDownload, FiUsers } from 'react-icons/fi';
import { useState } from 'react';

const AdminPanel = () => {
  const {
    candidates,
    setCandidates,
    votes,
    setVotes,
    currentUser,
    setNotification,
    users,
    setHasVoted,
  } = useVoting()

  const nameRef = useRef<HTMLInputElement>(null)
  const visionRef = useRef<HTMLTextAreaElement>(null)
  const missionRef = useRef<HTMLTextAreaElement>(null)
  const colorRef = useRef<HTMLSelectElement>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Daftar warna yang didukung
  const SUPPORTED_COLORS = ['blue', 'green', 'orange', 'purple', 'red', 'indigo'] as const;
  type SupportedColor = typeof SUPPORTED_COLORS[number];
  function getValidColorClass(color: string | undefined): SupportedColor {
    return SUPPORTED_COLORS.includes((color || '').toLowerCase() as SupportedColor)
      ? (color || 'blue').toLowerCase() as SupportedColor
      : 'blue';
  }

  // Tambah kandidat
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUser?.role !== 'admin') {
      setNotification({ message: 'Akses ditolak! Hanya admin yang dapat menambah kandidat.', type: 'error' })
      return
    }
    const name = nameRef.current?.value.trim() || ''
    const vision = visionRef.current?.value.trim() || ''
    const mission = missionRef.current?.value.trim() || ''
    const color = getValidColorClass(colorRef.current?.value);
    if (!name || !vision) {
      setNotification({ message: 'Mohon lengkapi semua field!', type: 'error' })
      return
    }
    try {
      const res = await fetch('/api/kandidat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, vision, mission, color, role: currentUser.role })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menambah kandidat')
      setNotification({ message: 'Kandidat berhasil ditambahkan!', type: 'success' })
      if (nameRef.current) nameRef.current.value = ''
      if (visionRef.current) visionRef.current.value = ''
      if (missionRef.current) missionRef.current.value = ''
      if (colorRef.current) colorRef.current.value = 'blue'
      // Fetch ulang kandidat (context akan auto update via VotingContext realtime, tapi bisa fetch manual jika perlu)
    } catch (err: any) {
      setNotification({ message: err.message || 'Gagal menambah kandidat', type: 'error' })
    }
  }

  // Hapus kandidat
  const handleRemoveCandidate = async (id: number) => {
    if (currentUser?.role !== 'admin') {
      setNotification({ message: 'Akses ditolak! Hanya admin yang dapat menghapus kandidat.', type: 'error' })
      return
    }
    if (window.confirm('Yakin ingin menghapus kandidat ini?')) {
      try {
        const res = await fetch(`/api/kandidat?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: currentUser.role })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus kandidat')
        setNotification({ message: 'Kandidat berhasil dihapus!', type: 'success' })
        // Fetch ulang kandidat (context akan auto update via VotingContext realtime, tapi bisa fetch manual jika perlu)
      } catch (err: any) {
        setNotification({ message: err.message || 'Gagal menghapus kandidat', type: 'error' })
      }
    }
  }

  // Reset suara
  const handleResetVotes = async () => {
    if (currentUser?.role !== 'admin') {
      setNotification({ message: 'Akses ditolak! Hanya admin yang dapat mereset suara.', type: 'error' })
      return
    }
    if (!window.confirm('Yakin ingin mereset semua suara? Tindakan ini tidak dapat dibatalkan!')) return;
    setLoadingAction('reset');
    setTimeout(() => { // Simulasi loading
      setVotes({})
      setHasVoted(false)
      setCandidates(candidates.map((c) => ({ ...c, votes: 0 })))
      setNotification({ message: 'Semua suara berhasil direset!', type: 'success' })
      setLoadingAction(null);
    }, 1200);
  }

  // Export hasil
  const handleExportResults = async () => {
    if (currentUser?.role !== 'admin') {
      setNotification({ message: 'Akses ditolak! Hanya admin yang dapat export hasil.', type: 'error' })
      return
    }
    setLoadingAction('export');
    setTimeout(() => { // Simulasi loading
      const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0)
      const participationRate = ((totalVotes / 1000) * 100).toFixed(1)
      let exportData = `HASIL PEMILIHAN KETUA ORGANISASI\n`
      exportData += `=====================================\n\n`
      exportData += `Total Suara: ${totalVotes.toLocaleString()}\n`
      exportData += `Tingkat Partisipasi: ${participationRate}%\n`
      exportData += `Estimasi Total Pemilih: 1,000\n\n`
      exportData += `HASIL PER KANDIDAT:\n-------------------\n`
      const sortedCandidates = [...candidates].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0))
      sortedCandidates.forEach((candidate, index) => {
        const candidateVotes = votes[candidate.id] || 0
        const percentage = totalVotes > 0 ? ((candidateVotes / totalVotes) * 100).toFixed(1) : 0
        exportData += `${index + 1}. ${candidate.name}\n   Suara: ${candidateVotes.toLocaleString()} (${percentage}%)\n   Visi: ${candidate.vision}\n   Misi: ${candidate.mission || '-'}\n\n`
      })
      exportData += `\nDiekspor pada: ${new Date().toLocaleString('id-ID')}\n`
      exportData += `Diekspor oleh: ${currentUser.name} (${currentUser.role})\n`
      const blob = new Blob([exportData], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hasil-pemilihan-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setNotification({ message: 'Hasil berhasil diekspor!', type: 'success' })
      setLoadingAction(null);
    }, 1200);
  }

  // Kelola user
  const handleManageUsers = async () => {
    if (currentUser?.role !== 'admin') {
      setNotification({ message: 'Akses ditolak! Hanya admin yang dapat kelola user.', type: 'error' })
      return
    }
    setLoadingAction('users');
    setTimeout(() => {
      const userList = Object.keys(users)
        .map((username) => {
          const user = users[username]
          return `${username} (${user.role}) - ${user.name}`
        })
        .join('\n')
      alert(`Daftar User:\n\n${userList}\n\nUntuk mengelola user lebih lanjut, hubungi developer sistem.`)
      setLoadingAction(null);
    }, 800);
  }

  return (
    <section id="admin" className="section active py-8 px-4">
      <div className="admin-container container mx-auto">
        <h2 className="section-title text-3xl font-bold text-center text-blue-700 dark:text-blue-300 mb-8 flex items-center justify-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 13L19 18"/><path d="M13 19L18 14"/><path d="M16 16L22 22"/><path d="M2 2L16 16"/><rect x="3" y="13" width="6" height="2" rx="1"/><rect x="9" y="7" width="6" height="2" rx="1"/><rect x="17" y="3" width="4" height="2" rx="1"/></svg>
          </span>
          PANEL ADMIN
        </h2>
        <div className="admin-form bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Tambah Kandidat Baru</h3>
          <form id="add-candidate-form" onSubmit={handleAddCandidate} className="space-y-6">
            <div className="form-group">
              <label htmlFor="candidate-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Kandidat:</label>
              <input type="text" id="candidate-name" ref={nameRef} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100" />
            </div>
            <div className="form-group">
              <label htmlFor="candidate-vision" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visi:</label>
              <textarea id="candidate-vision" ref={visionRef} required rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="candidate-mission" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Misi:</label>
              <textarea id="candidate-mission" ref={missionRef} rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="candidate-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warna Tema:</label>
              <select id="candidate-color" ref={colorRef} defaultValue="blue" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100">
                <option value="blue">Biru</option>
                <option value="green">Hijau</option>
                <option value="orange">Oranye</option>
                <option value="purple">Ungu</option>
                <option value="red">Merah</option>
                <option value="indigo">Indigo</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full sm:w-auto">Tambah Kandidat</button>
          </form>
        </div>

        <div className="admin-actions grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            id="reset-votes"
            className="btn-danger w-full flex items-center justify-center gap-2 py-2 px-4 font-semibold rounded bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-400 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-60"
            onClick={handleResetVotes}
            disabled={loadingAction === 'reset'}
            title="Set semua suara kandidat ke 0."
          >
            {loadingAction === 'reset' ? <span className="loader border-2 border-t-2 border-t-white border-white/30 rounded-full w-5 h-5 animate-spin"></span> : <FiRefreshCw size={18} />}
            Reset Semua Suara
          </button>
          <button
            id="export-results"
            className="btn-secondary w-full flex items-center justify-center gap-2 py-2 px-4 font-semibold rounded bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-400 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-60"
            onClick={handleExportResults}
            disabled={loadingAction === 'export'}
            title="Download hasil voting dalam format txt."
          >
            {loadingAction === 'export' ? <span className="loader border-2 border-t-2 border-t-white border-white/30 rounded-full w-5 h-5 animate-spin"></span> : <FiDownload size={18} />}
            Export Hasil
          </button>
          <button
            id="manage-users"
            className="btn-secondary w-full flex items-center justify-center gap-2 py-2 px-4 font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-60"
            onClick={handleManageUsers}
            disabled={loadingAction === 'users'}
            title="Lihat daftar user terdaftar."
          >
            {loadingAction === 'users' ? <span className="loader border-2 border-t-2 border-t-white border-white/30 rounded-full w-5 h-5 animate-spin"></span> : <FiUsers size={18} />}
            Kelola User
          </button>
        </div>

        <div className="candidates-management bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Kelola Kandidat</h3>
          <div id="admin-candidates-list" className="space-y-4">
            {candidates.length > 0 ? candidates.map((candidate) => {
              const colorClass = getValidColor(candidate.color);
              const colorHex = COLOR_MAP[colorClass].hex;
              return (
                <div key={candidate.id} className="result-item flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow">
                  <div className="result-info mb-2 sm:mb-0 flex items-center gap-2">
                    <span className={`inline-block w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600`} style={{ background: colorHex }}></span>
                    <span className="result-name text-lg font-medium text-gray-800 dark:text-gray-100">{candidate.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: colorHex, color: '#fff', marginLeft: 8 }}>{colorClass}</span>
                  </div>
                  <div className="result-visi-misi flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300 max-w-xs sm:max-w-md">
                    <div><span className="font-semibold">Visi:</span> {candidate.vision || '-'}</div>
                    <div><span className="font-semibold">Misi:</span> {candidate.mission || '-'}</div>
                  </div>
                  <button
                    className="btn-danger mt-2 sm:mt-0 sm:ml-4 px-3 py-1.5 text-sm font-semibold rounded bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    onClick={() => handleRemoveCandidate(candidate.id)}
                  >
                    Hapus
                  </button>
                </div>
              )
            }) : <p className="text-gray-600 dark:text-gray-400">Belum ada kandidat.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminPanel 