import React, { useRef, useState } from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'

const RegisterForm = () => {
  const { setCurrentUser, setActiveTab, setNotification } = useVoting()
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLSelectElement>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = usernameRef.current?.value.trim() || ''
    const password = passwordRef.current?.value.trim() || ''
    const name = nameRef.current?.value.trim() || ''
    const role = roleRef.current?.value as 'admin' | 'user'
    if (!email || !password || !name || !role) {
      setNotification({ message: 'Mohon lengkapi semua field!', type: 'error' })
      return
    }
    setLoading(true)
    try {
      // Register ke Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, username: email }
        }
      })
      if (error) {
        setNotification({ message: error.message || 'Registrasi gagal', type: 'error' })
      } else {
        // Sinkronisasi ke tabel users custom
        await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, username: email, role })
        })
        setNotification({ message: 'Registrasi sukses! Silakan cek email untuk verifikasi.', type: 'success' })
        setActiveTab && setActiveTab('login')
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
        <label htmlFor="reg-email">Email:</label>
        <input type="email" id="reg-email" ref={usernameRef} required />
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