import React, { useRef } from 'react'
import { useVoting } from './VotingContext'

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
  const colorRef = useRef<HTMLSelectElement>(null)

  // Tambah kandidat
  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUser?.role !== 'admin') {
      setNotification({ message: 'Akses ditolak! Hanya admin yang dapat menambah kandidat.', type: 'error' })
      return
    }
    const name = nameRef.current?.value.trim() || ''
    const vision = visionRef.current?.value.trim() || ''
    const color = colorRef.current?.value || 'blue'
    if (!name || !vision) {
      setNotification({ message: 'Mohon lengkapi semua field!', type: 'error' })
      return
    }
    const newCandidate = {
      id: candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1,
      name,
      vision,
      color,
      votes: 0,
    }
    setCandidates([...candidates, newCandidate])
    setNotification({ message: 'Kandidat berhasil ditambahkan!', type: 'success' })
    if (nameRef.current) nameRef.current.value = ''
    if (visionRef.current) visionRef.current.value = ''
    if (colorRef.current) colorRef.current.value = 'blue'
  }

  // Hapus kandidat
  const handleRemoveCandidate = (id: number) => {
    if (currentUser?.role !== 'admin') {
      setNotification({ message: 'Akses ditolak! Hanya admin yang dapat menghapus kandidat.', type: 'error' })
      return
    }
    if (window.confirm('Yakin ingin menghapus kandidat ini?')) {
      setCandidates(candidates.filter((c) => c.id !== id))
      const updatedVotes = { ...votes }
      delete updatedVotes[id]
      setVotes(updatedVotes)
      setNotification({ message: 'Kandidat berhasil dihapus!', type: 'success' })
    }
  }

  // Reset suara
  const handleResetVotes = () => {
    if (currentUser?.role !== 'admin') {
      setNotification({ message: 'Akses ditolak! Hanya admin yang dapat mereset suara.', type: 'error' })
      return
    }
    if (window.confirm('Yakin ingin mereset semua suara? Tindakan ini tidak dapat dibatalkan!')) {
      setVotes({})
      setHasVoted(false)
      setCandidates(candidates.map((c) => ({ ...c, votes: 0 })))
      setNotification({ message: 'Semua suara berhasil direset!', type: 'success' })
    }
  }

  // Export hasil
  const handleExportResults = () => {
    if (currentUser?.role !== 'admin') {
      setNotification({ message: 'Akses ditolak! Hanya admin yang dapat export hasil.', type: 'error' })
      return
    }
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
      exportData += `${index + 1}. ${candidate.name}\n   Suara: ${candidateVotes.toLocaleString()} (${percentage}%)\n   Visi: ${candidate.vision}\n\n`
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
  }

  // Kelola user
  const handleManageUsers = () => {
    if (currentUser?.role !== 'admin') {
      setNotification({ message: 'Akses ditolak! Hanya admin yang dapat kelola user.', type: 'error' })
      return
    }
    const userList = Object.keys(users)
      .map((username) => {
        const user = users[username]
        return `${username} (${user.role}) - ${user.name}`
      })
      .join('\n')
    alert(`Daftar User:\n\n${userList}\n\nUntuk mengelola user lebih lanjut, hubungi developer sistem.`)
  }

  return (
    <section id="admin" className="section active">
      <div className="admin-container">
        <h2 className="section-title">PANEL ADMIN</h2>
        <div className="admin-form">
          <h3>Tambah Kandidat Baru</h3>
          <form id="add-candidate-form" onSubmit={handleAddCandidate}>
            <div className="form-group">
              <label htmlFor="candidate-name">Nama Kandidat:</label>
              <input type="text" id="candidate-name" ref={nameRef} required />
            </div>
            <div className="form-group">
              <label htmlFor="candidate-vision">Visi:</label>
              <textarea id="candidate-vision" ref={visionRef} required></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="candidate-color">Warna Tema:</label>
              <select id="candidate-color" ref={colorRef} defaultValue="blue">
                <option value="blue">Biru</option>
                <option value="green">Hijau</option>
                <option value="orange">Orange</option>
                <option value="purple">Ungu</option>
                <option value="red">Merah</option>
                <option value="indigo">Indigo</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Tambah Kandidat</button>
          </form>
        </div>
        <div className="admin-actions">
          <button id="reset-votes" className="btn-danger" onClick={handleResetVotes}>Reset Semua Suara</button>
          <button id="export-results" className="btn-secondary" onClick={handleExportResults}>Export Hasil</button>
          <button id="manage-users" className="btn-secondary" onClick={handleManageUsers}>Kelola User</button>
        </div>
        <div className="candidates-management">
          <h3>Kelola Kandidat</h3>
          <div id="admin-candidates-list">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="result-item">
                <div className="result-info">
                  <div className="result-name">{candidate.name}</div>
                  <div className="result-votes">{candidate.vision}</div>
                </div>
                <button className="btn-danger" onClick={() => handleRemoveCandidate(candidate.id)}>
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminPanel 