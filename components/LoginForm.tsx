import React, { useRef, useState } from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

const LoginScreen = () => {
  const {
    setCurrentUser,
    setActiveTab,
    setNotification,
    currentUser,
  } = useVoting()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Login refs
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLSelectElement>(null)

  // Register refs
  const regUsernameRef = useRef<HTMLInputElement>(null)
  const regPasswordRef = useRef<HTMLInputElement>(null)
  const regNameRef = useRef<HTMLInputElement>(null)
  const regEmailRef = useRef<HTMLInputElement>(null)
  const regPhoneRef = useRef<HTMLInputElement>(null)

  // OTP/Phone login state
  const [otpPhone, setOtpPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = emailRef.current?.value.trim() || ''
    const password = passwordRef.current?.value.trim() || ''
    const role = roleRef.current?.value as 'admin' | 'user'
    if (!email || !password || !role) {
      setNotification({ message: 'Mohon lengkapi semua field!', type: 'error' })
      return
    }
    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setNotification({ message: 'Format email tidak valid!', type: 'error' })
      return
    }
    setLoading(true)
    try {
      // Supabase Auth signIn
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setNotification({ message: error.message || 'Login gagal', type: 'error' })
      } else if (!data.user?.email_confirmed_at) {
        setNotification({ message: 'Akun belum diverifikasi. Silakan cek email Anda.', type: 'error' })
      } else {
        // Ambil data user dari user_metadata
        const userMeta = data.user.user_metadata || {}
        if (userMeta.role !== role) {
          setNotification({ message: 'Role tidak sesuai!', type: 'error' })
        } else {
          setCurrentUser({ username: userMeta.username, role: userMeta.role, name: userMeta.name })
          setActiveTab('voting')
          setNotification({ message: `Selamat datang, ${userMeta.name}!`, type: 'success' })
        }
      }
    } catch (err) {
      setNotification({ message: 'Terjadi kesalahan jaringan', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const username = regUsernameRef.current?.value.trim() || ''
    const password = regPasswordRef.current?.value.trim() || ''
    const name = regNameRef.current?.value.trim() || ''
    const email = regEmailRef.current?.value.trim() || ''
    const phone = regPhoneRef.current?.value.trim() || ''
    // Validasi input
    if (!username || !password || !name || !email || !phone) {
      setNotification({ message: 'Mohon lengkapi semua field!', type: 'error' })
      return
    }
    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setNotification({ message: 'Format email tidak valid!', type: 'error' })
      return
    }
    // Validasi nomor HP (minimal 10 digit)
    const phoneRegex = /^\d{10,}$/
    if (!phoneRegex.test(phone)) {
      setNotification({ message: 'Nomor HP tidak valid!', type: 'error' })
      return
    }
    setLoading(true)
    try {
      // Supabase Auth signUp (email & phone)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            name,
            phone,
            role: 'user',
          },
          emailRedirectTo: window.location.origin + '/login',
        },
      })
      if (error) {
        setNotification({ message: error.message || 'Registrasi gagal', type: 'error' })
      } else {
        setNotification({ message: 'Registrasi berhasil! Silakan cek email untuk verifikasi.', type: 'success' })
        setTab('login')
      }
    } catch (err) {
      setNotification({ message: 'Terjadi kesalahan jaringan', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Handle send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpPhone) {
      setNotification({ message: 'Masukkan nomor HP!', type: 'error' })
      return
    }
    setOtpLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: otpPhone })
      if (error) {
        setNotification({ message: error.message || 'Gagal mengirim OTP', type: 'error' })
      } else {
        setOtpSent(true)
        setNotification({ message: 'OTP dikirim! Silakan cek SMS Anda.', type: 'success' })
        router.push(`/verify-otp?phone=${encodeURIComponent(otpPhone)}`)
      }
    } catch (err) {
      setNotification({ message: 'Terjadi kesalahan jaringan', type: 'error' })
    } finally {
      setOtpLoading(false)
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
        {tab === 'login' ? (
          <>
          <form id="login-form" className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email:</label>
              <input type="email" id="login-email" ref={emailRef} required placeholder="Masukkan email Anda" />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password:</label>
              <input type="password" id="login-password" ref={passwordRef} required placeholder="Masukkan password Anda" />
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
          <div style={{ margin: '24px 0', textAlign: 'center', fontWeight: 600 }}>atau</div>
          <form id="otp-login-form" className="login-form" onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="otp-phone">Login via Nomor HP (OTP):</label>
              <input type="tel" id="otp-phone" value={otpPhone} onChange={e => setOtpPhone(e.target.value)} required placeholder="08xxxxxxxxxx" />
            </div>
            <button type="submit" className="btn-primary" disabled={otpLoading}>{otpLoading ? 'Mengirim OTP...' : 'Kirim OTP'}</button>
          </form>
          </>
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
              <label htmlFor="reg-email">Email:</label>
              <input type="email" id="reg-email" ref={regEmailRef} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-phone">Nomor HP:</label>
              <input type="tel" id="reg-phone" ref={regPhoneRef} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Memproses...' : 'Register'}</button>
          </form>
        )}
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