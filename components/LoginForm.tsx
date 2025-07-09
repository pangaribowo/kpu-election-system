import React, { useRef, useState } from 'react'
import { useVoting } from './VotingContext'

const LoginScreen = () => {
  const {
    setCurrentUser,
    setActiveTab,
    setNotification,
    currentUser,
  } = useVoting()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)

  // Login refs
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLSelectElement>(null)
  const [loading, setLoading] = useState(false)

<<<<<<< Updated upstream
=======
  // Register refs
  const regUsernameRef = useRef<HTMLInputElement>(null)
  const regPasswordRef = useRef<HTMLInputElement>(null)
  const regNameRef = useRef<HTMLInputElement>(null)
  const regRoleRef = useRef<HTMLSelectElement>(null)

  // Handle Login
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    }
=======
    }
  }

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const username = regUsernameRef.current?.value.trim() || ''
    const password = regPasswordRef.current?.value.trim() || ''
    const name = regNameRef.current?.value.trim() || ''
    const role = regRoleRef.current?.value as 'admin' | 'user'
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
>>>>>>> Stashed changes
  }

  const handleShowManual = () => {
    setCurrentUser({ username: 'guest', role: 'user', name: 'Guest' })
    setActiveTab('manual')
  }

  if (currentUser) return null

  return (
    <div id="login-screen" className="login-screen">
      <div className="login-container">
        <div className="flex justify-center mb-6">
          <button
            className={`login-tab-btn ${tab === 'login' ? 'active' : ''}`}
            style={{marginRight: 8, padding: '8px 24px', borderRadius: '8px 8px 0 0', border: 'none', background: tab === 'login' ? 'var(--accent-primary)' : 'var(--primary-bg)', color: tab === 'login' ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: 16, cursor: 'pointer'}}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            className={`login-tab-btn ${tab === 'register' ? 'active' : ''}`}
            style={{padding: '8px 24px', borderRadius: '8px 8px 0 0', border: 'none', background: tab === 'register' ? 'var(--accent-primary)' : 'var(--primary-bg)', color: tab === 'register' ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: 16, cursor: 'pointer'}}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>
        <div className="login-header">
          <h1>Sistem Pemilihan</h1>
          <p>Ketua Organisasi 2026</p>
        </div>
<<<<<<< Updated upstream
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
=======
        {tab === 'login' ? (
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
        ) : (
          <form id="register-form" className="login-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="reg-username">Username:</label>
              <input type="text" id="reg-username" ref={regUsernameRef} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Password:</label>
              <input type="password" id="reg-password" ref={regPasswordRef} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-name">Nama Lengkap:</label>
              <input type="text" id="reg-name" ref={regNameRef} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-role">Daftar sebagai:</label>
              <select id="reg-role" ref={regRoleRef} required>
                <option value="">Pilih Role</option>
                <option value="admin">Administrator</option>
                <option value="user">Pemilih</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Memproses...' : 'Register'}</button>
          </form>
        )}
>>>>>>> Stashed changes
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

export default LoginScreen 