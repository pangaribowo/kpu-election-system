import React, { useRef, useState } from 'react'
import { useVoting } from './VotingContext'

const RegisterForm = () => {
  const { setCurrentUser, setActiveTab, setNotification } = useVoting()
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLSelectElement>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const username = usernameRef.current?.value.trim() || ''
    const password = passwordRef.current?.value.trim() || ''
    const name = nameRef.current?.value.trim() || ''
    const role = roleRef.current?.value as 'admin' | 'user'
    if (!username || !password || !name || !role) {
      setNotification({ message: 'Mohon lengkapi semua field!', type: 'error' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, role })
      })
      const result = await res.json()
      if (!res.ok) {
        setNotification({ message: result.error || 'Registrasi gagal', type: 'error' })
      } else {
        setCurrentUser({ username: result.user.username, role: result.user.role, name: result.user.name })
        setActiveTab('voting')
        setNotification({ message: `Registrasi & login sukses! Selamat datang, ${result.user.name}!`, type: 'success' })
      }
    } catch (err) {
      setNotification({ message: 'Terjadi kesalahan jaringan', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form id="register-form" className="login-form" onSubmit={handleRegister}>
      <div className="form-group">
        <label htmlFor="reg-username">Username:</label>
        <input type="text" id="reg-username" ref={usernameRef} required />
      </div>
      <div className="form-group">
        <label htmlFor="reg-password">Password:</label>
        <input type="password" id="reg-password" ref={passwordRef} required />
      </div>
      <div className="form-group">
        <label htmlFor="reg-name">Nama Lengkap:</label>
        <input type="text" id="reg-name" ref={nameRef} required />
      </div>
      <div className="form-group">
        <label htmlFor="reg-role">Daftar sebagai:</label>
        <select id="reg-role" ref={roleRef} required>
          <option value="">Pilih Role</option>
          <option value="admin">Petugas</option>
          <option value="user">Pemilih</option>
        </select>
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Memproses...' : 'Register'}</button>
    </form>
  )
}

export default RegisterForm 