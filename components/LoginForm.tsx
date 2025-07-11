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
  const regConfirmPasswordRef = useRef<HTMLInputElement>(null)
  const regNameRef = useRef<HTMLInputElement>(null)
  const regEmailRef = useRef<HTMLInputElement>(null)
  const regPhoneRef = useRef<HTMLInputElement>(null)
  // Show/hide password state
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

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
    const emailRegex = /^[^\s@]+@[^-\s@]+\.[^\s@]+$/
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
          // Sinkronisasi ke tabel users
          const syncRes = await fetch('/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phone: userMeta.phone, name: userMeta.name, username: userMeta.username, role: userMeta.role })
          })
          if (!syncRes.ok) {
            const err = await syncRes.json().catch(() => null)
            setNotification({ message: err?.error || 'Login berhasil, tapi gagal sinkronisasi user ke database.', type: 'warning' })
          }
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
    const confirmPassword = regConfirmPasswordRef.current?.value.trim() || ''
    const name = regNameRef.current?.value.trim() || ''
    const email = regEmailRef.current?.value.trim() || ''
    const phone = regPhoneRef.current?.value.trim() || ''
    // Validasi input
    if (!username || !password || !confirmPassword || !name || !email || !phone) {
      setNotification({ message: 'Mohon lengkapi semua field!', type: 'error' })
      return
    }
    if (password !== confirmPassword) {
      setNotification({ message: 'Password dan konfirmasi password tidak sama!', type: 'error' })
      return
    }
    // Validasi email
    const emailRegex = /^[^\s@]+@[^-\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setNotification({ message: 'Format email tidak valid!', type: 'error' })
      return
    }
    // Validasi nomor HP (format internasional)
    const phoneRegex = /^\+\d{10,}$/
    if (!phoneRegex.test(phone)) {
      setNotification({ message: 'Nomor HP tidak valid! Gunakan format internasional, contoh: +6281234567890', type: 'error' })
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
        // Sinkronisasi ke tabel users
        const syncRes = await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone, name, username, role: 'user' })
        })
        if (!syncRes.ok) {
          const err = await syncRes.json().catch(() => null)
          setNotification({ message: err?.error || 'Registrasi berhasil, tapi gagal sinkronisasi user ke database.', type: 'warning' })
        } else {
          setNotification({ message: 'Registrasi berhasil! Silakan cek email untuk verifikasi.', type: 'success' })
        }
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
    // Validasi nomor HP (format internasional)
    const phoneRegex = /^\+\d{10,}$/
    if (!phoneRegex.test(otpPhone)) {
      setNotification({ message: 'Nomor HP tidak valid! Gunakan format internasional, contoh: +6281234567890', type: 'error' })
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
        // Sinkronisasi ke tabel users (minimal phone)
        const syncRes = await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: otpPhone, name: '-', username: '-', role: 'user', email: '-' })
        })
        if (!syncRes.ok) {
          const err = await syncRes.json().catch(() => null)
          setNotification({ message: err?.error || 'OTP dikirim, tapi gagal sinkronisasi user ke database.', type: 'warning' })
        }
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

  if (currentUser) return null;

  const formInputClass = "w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm";
  const formLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const formHelperClass = "text-xs text-gray-500 dark:text-gray-400 mt-1";
  const formButtonClass = "w-full btn-primary py-2.5 text-sm disabled:opacity-70";
  const passwordWrapperClass = "relative";
  const showPasswordButtonClass = "absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none";

  return (
    <div id="login-screen" className="login-screen">
      <div className="login-container">
        <div className="flex justify-center mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-6 py-3 text-sm font-medium transition-colors duration-150 focus:outline-none
              ${tab === 'login'
                ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium transition-colors duration-150 focus:outline-none
              ${tab === 'register'
                ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
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
            <form id="login-form" className="login-form space-y-5" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-email" className={formLabelClass}>Email:</label>
                <input type="email" id="login-email" ref={emailRef} required placeholder="Masukkan email Anda" className={formInputClass} />
                <small className={formHelperClass}>Contoh: user@email.com</small>
              </div>
              <div className="form-group">
                <label htmlFor="login-password" className={formLabelClass}>Password:</label>
                <div className={passwordWrapperClass}>
                  <input type={showLoginPassword ? 'text' : 'password'} id="login-password" ref={passwordRef} required placeholder="Masukkan password Anda" className={formInputClass} />
                  <button type="button" className={showPasswordButtonClass} onClick={() => setShowLoginPassword(v => !v)} tabIndex={-1} aria-label="Tampilkan Password">
                    {showLoginPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <small className={formHelperClass}>Password minimal 8 karakter</small>
              </div>
              <div className="form-group">
                <label htmlFor="role" className={formLabelClass}>Login sebagai:</label>
                <select id="role" ref={roleRef} required className={formInputClass}>
                  <option value="">Pilih Role</option>
                  <option value="admin">Administrator</option>
                  <option value="user">Pemilih</option>
                </select>
              </div>
              <button type="submit" className={formButtonClass} disabled={loading}>{loading ? 'Memproses...' : 'Login'}</button>
            </form>
            <div className="my-6 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">atau</div>
            <form id="otp-login-form" className="login-form space-y-5" onSubmit={handleSendOtp}>
              <div className="form-group">
                <label htmlFor="otp-phone" className={formLabelClass}>Login via Nomor HP (OTP):</label>
                <input type="tel" id="otp-phone" value={otpPhone} onChange={e => setOtpPhone(e.target.value)} required placeholder="+628xxxxxxxxxx" className={formInputClass} />
                <small className={formHelperClass}>Masukkan nomor HP format internasional, contoh: <b>+6281234567890</b></small>
              </div>
              <button type="submit" className={formButtonClass} disabled={otpLoading}>{otpLoading ? 'Mengirim OTP...' : 'Kirim OTP'}</button>
            </form>
          </>
        ) : (
          <form id="register-form" className="login-form space-y-5" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="reg-username" className={formLabelClass}>Username:</label>
              <input type="text" id="reg-username" ref={regUsernameRef} required placeholder="Masukkan username unik" className={formInputClass} />
              <small className={formHelperClass}>Hanya huruf/angka, tanpa spasi. Contoh: user123</small>
            </div>
            <div className="form-group">
              <label htmlFor="reg-password" className={formLabelClass}>Password:</label>
              <div className={passwordWrapperClass}>
                <input type={showRegPassword ? 'text' : 'password'} id="reg-password" ref={regPasswordRef} required placeholder="Min. 8 karakter" className={formInputClass} />
                <button type="button" className={showPasswordButtonClass} onClick={() => setShowRegPassword(v => !v)} tabIndex={-1} aria-label="Tampilkan Password">
                  {showRegPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <small className={formHelperClass}>Password minimal 8 karakter</small>
            </div>
            <div className="form-group">
              <label htmlFor="reg-confirm-password" className={formLabelClass}>Konfirmasi Password:</label>
              <div className={passwordWrapperClass}>
                <input type={showRegConfirmPassword ? 'text' : 'password'} id="reg-confirm-password" ref={regConfirmPasswordRef} required placeholder="Ulangi password" className={formInputClass} />
                <button type="button" className={showPasswordButtonClass} onClick={() => setShowRegConfirmPassword(v => !v)} tabIndex={-1} aria-label="Tampilkan Password">
                  {showRegConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <small className={formHelperClass}>Ulangi password yang sama</small>
            </div>
            <div className="form-group">
              <label htmlFor="reg-name" className={formLabelClass}>Nama Lengkap:</label>
              <input type="text" id="reg-name" ref={regNameRef} required placeholder="Masukkan nama lengkap Anda" className={formInputClass} />
              <small className={formHelperClass}>Contoh: Budi Santoso</small>
            </div>
            <div className="form-group">
              <label htmlFor="reg-email" className={formLabelClass}>Email:</label>
              <input type="email" id="reg-email" ref={regEmailRef} required placeholder="Masukkan email aktif" className={formInputClass} />
              <small className={formHelperClass}>Contoh: user@email.com</small>
            </div>
            <div className="form-group">
              <label htmlFor="reg-phone" className={formLabelClass}>Nomor HP:</label>
              <input type="tel" id="reg-phone" ref={regPhoneRef} required placeholder="+628xxxxxxxxxx" className={formInputClass} />
              <small className={formHelperClass}>Format internasional, contoh: <b>+6281234567890</b></small>
            </div>
            <button type="submit" className={formButtonClass} disabled={loading}>{loading ? 'Memproses...' : 'Register'}</button>
          </form>
        )}
        <div className="login-info mt-8">
          <h4>Akun Demo:</h4>
          <p><strong>Admin:</strong> admin@example.com / admin123</p>
          <p><strong>User:</strong> user@example.com / user123</p>
        </div>
        <div className="login-footer mt-6">
          <button id="show-manual" className="btn-secondary bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white py-2 px-4 rounded-lg text-sm" type="button" onClick={handleShowManual}>Lihat Manual</button>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen 