import { useRouter } from 'next/router'
import { useVoting } from '../../components/VotingContext'
import React from 'react'

const UserProfile = () => {
  const router = useRouter()
  const { currentUser } = useVoting()
  const { id } = router.query

  if (!currentUser || currentUser.username !== id) {
    return <div style={{ padding: 32 }}>Akses ditolak. Anda tidak berhak melihat profile ini.</div>
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 32 }}>
      <h2 style={{ marginBottom: 24 }}>Profil Saya</h2>
      <div style={{ marginBottom: 16 }}><b>Username:</b> {currentUser.username}</div>
      <div style={{ marginBottom: 16 }}><b>Nama Lengkap:</b> {currentUser.name}</div>
      <div style={{ marginBottom: 16 }}><b>Email:</b> {'email' in currentUser ? (currentUser as any).email || '-' : '-'}</div>
      <div style={{ marginBottom: 16 }}><b>Nomor HP:</b> {'phone' in currentUser ? (currentUser as any).phone || '-' : '-'}</div>
      <div style={{ marginBottom: 16 }}><b>Role:</b> {currentUser.role}</div>
      <button className="btn-primary" style={{ marginTop: 24 }} disabled>Edit Profil (coming soon)</button>
    </div>
  )
}

export default UserProfile
