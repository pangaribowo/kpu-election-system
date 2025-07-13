import React, { useRef, useState } from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'

const RegisterForm = () => {
  const { setCurrentUser, setActiveTab, setNotification } = useVoting()
  const usernameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLSelectElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = emailRef.current?.value.trim() || ''
    const username = usernameRef.current?.value.trim() || ''
    const password = passwordRef.current?.value.trim() || ''
    const name = nameRef.current?.value.trim() || ''
    const role = roleRef.current?.value as 'admin' | 'user'
    const phone = phoneRef.current?.value.trim() || ''
    if (!email || !password || !name || !role) {
      setNotification({ message: 'Mohon lengkapi semua field!', type: 'error' })
      return
    }
    setLoading(true)
    try {
      // Validasi duplikasi username
      const checkUsernameRes = await fetch(`/api/users/sync?username=${encodeURIComponent(username)}`)
      const checkUsernameData = await checkUsernameRes.json()
      if (checkUsernameData && checkUsernameData.id) {
        setNotification({ message: 'Username sudah terdaftar!', type: 'error' })
        setLoading(false)
        return
      }
      // Validasi duplikasi email
      if (email && email !== '-') {
        const checkEmailRes = await fetch(`/api/users/sync?email=${encodeURIComponent(email)}`)
        const checkEmailData = await checkEmailRes.json()
        if (checkEmailData && checkEmailData.id) {
          setNotification({ message: 'Email sudah terdaftar!', type: 'error' })
          setLoading(false)
          return
        }
      }
      // Validasi duplikasi phone
      if (phone && phone !== '-') {
        const checkPhoneRes = await fetch(`/api/users/sync?phone=${encodeURIComponent(phone)}`)
        const checkPhoneData = await checkPhoneRes.json()
        if (checkPhoneData && checkPhoneData.exists) {
          setNotification({ message: 'Nomor HP sudah terdaftar!', type: 'error' })
          setLoading(false)
          return
        }
      }
      // Register ke Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, username, phone },
          emailRedirectTo: baseUrl + '/login',
        }
      })
      if (error) {
        setNotification({ message: error.message || 'Registrasi gagal', type: 'error' })
        setLoading(false)
        return
      } else {
        // Sinkronisasi ke tabel users custom
        const syncRes = await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, username, phone, role })
        })
        if (!syncRes.ok) {
          const err = await syncRes.json().catch(() => null)
          setNotification({ message: err?.error || 'Registrasi gagal sinkronisasi ke database.', type: 'error' })
          setLoading(false)
          return
        }
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
        <label htmlFor="reg-username">Username:</label>
        <input type="text" id="reg-username" ref={usernameRef} required placeholder="Username unik" />
      </div>
      <div className="form-group">
        <label htmlFor="reg-email">Email:</label>
        <input type="email" id="reg-email" ref={emailRef} required />
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
        <label htmlFor="reg-phone">Nomor HP:</label>
        <input type="tel" id="reg-phone" ref={phoneRef} required placeholder="Contoh: +6281234567890" />
      </div>
      <div className="form-group">
        <label htmlFor="reg-role">Daftar sebagai:</label>
        <select id="reg-role" ref={roleRef} required>
          <option value="">Pilih Role</option>
          <option value="admin">Petugas KPU</option>
          <option value="user">Pemilih</option>
        </select>
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Memproses...' : 'Register'}</button>
    </form>
  )
}

export default RegisterForm 