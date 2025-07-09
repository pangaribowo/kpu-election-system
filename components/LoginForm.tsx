import React, { useRef, useState } from 'react'
import { useVoting } from './VotingContext'

const LoginForm = () => {
  const {
    setCurrentUser,
    setActiveTab,
    setNotification,
    currentUser,
  } = useVoting()
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLSelectElement>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const username = usernameRef.current?.value.trim() || ''
    const password = passwordRef.current?.value.trim() || ''
    const role = roleRef.current?.value as 'admin' | 'user'
    if (!username || !password || !role) {
      setNotification({ message: 'Mohon lengkapi semua field!', type: 'error' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const result = await res.json()
      if (!res.ok) {
        setNotification({ message: result.error || 'Login gagal', type: 'error' })
      } else if (result.user.role !== role) {
        setNotification({ message: 'Role tidak sesuai!', type: 'error' })
      } else {
        setCurrentUser({ username: result.user.username, role: result.user.role, name: result.user.name })
        setActiveTab('voting')
        setNotification({ message: `Selamat datang, ${result.user.name}!`, type: 'success' })
      }
    } catch (err) {
      setNotification({ message: 'Terjadi kesalahan jaringan', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleShowManual = () => {
    setCurrentUser({ username: 'guest', role: 'user', name: 'Guest' })
    setActiveTab('manual')
  }

  if (currentUser) return null

  return (
    <div id="login-screen" className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1>Sistem Pemilihan</h1>
          <p>Ketua Organisasi 2026</p>
        </div>
        <form id="login-form" className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" ref={usernameRef} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" ref={passwordRef} required />
          </div>
          <div className="form-group">
            <label htmlFor="role">Login sebagai:</label>
            <select id="role" ref={roleRef} required>
              <option value="">Pilih Role</option>
              <option value="admin">Administrator</option>
              <option value="user">Pemilih</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Memproses...' : 'Login'}</button>
        </form>
        <div className="login-info">
          <h4>Akun Demo:</h4>
          <p><strong>Admin:</strong> admin / admin123</p>
          <p><strong>User:</strong> user / user123</p>
        </div>
        <div className="login-footer">
          <button id="show-manual" className="btn-secondary" type="button" onClick={handleShowManual}>Lihat Manual</button>
        </div>
      </div>
    </div>
  )
}

export default LoginForm 