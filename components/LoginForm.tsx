import React, { useRef, useState, useEffect } from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import { Mail, Lock, Eye, EyeOff, KeyRound, User, Phone } from 'lucide-react'

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

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // Show phone modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  // Cek setelah login Google, apakah user sudah punya phone di tabel users
  useEffect(() => {
    const checkPhone = async () => {
      if (currentUser && currentUser.username && currentUser.email && !currentUser.phone) {
        // Cek ke API users apakah phone sudah ada
        const res = await fetch(`/api/users?email=${encodeURIComponent(currentUser.email)}`)
        const data = await res.json()
        if (data && (!data.phone || data.phone === '-')) {
          setShowPhoneModal(true)
        }
      }
    }
    checkPhone()
  }, [currentUser])

  useEffect(() => {
    const handleGoogleSync = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.app_metadata?.provider === 'google' && !currentUser) {
        // Sinkronisasi ke tabel users custom
        const userMeta = user.user_metadata || {}
        await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: userMeta.full_name || userMeta.name || '-',
            username: userMeta.preferred_username || userMeta.name || user.email,
            phone: user.phone || '-',
            role: 'user',
          })
        })
        // Ambil UUID dari tabel users custom
        const getRes = await fetch(`/api/users/sync?email=${encodeURIComponent(user.email)}`)
        const userDb = await getRes.json()
        if (userDb && userDb.id) {
          setCurrentUser({
            id: userDb.id,
            username: userDb.username,
            role: userDb.role,
            name: userDb.name,
            email: userDb.email,
            phone: userDb.phone,
          })
          setNotification && setNotification({ message: `Selamat datang, ${userDb.name}!`, type: 'success' })
          router.replace('/')
        } else {
          setNotification && setNotification({ message: 'Gagal sinkronisasi user Google.', type: 'error' })
        }
      }
    }
    handleGoogleSync()
    // eslint-disable-next-line
  }, [])

  // Handler submit phone
  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    setPhoneError('')
    const phone = phoneInput.trim()
    const phoneRegex = /^\+\d{10,}$/
    if (!phoneRegex.test(phone)) {
      setPhoneError('Nomor HP tidak valid! Gunakan format internasional, contoh: +6281234567890')
      return
    }
    setPhoneLoading(true)
    try {
      // Cek duplikasi
      const checkRes = await fetch(`/api/users?phone=${encodeURIComponent(phone)}`)
      const checkData = await checkRes.json()
      if (checkData && checkData.exists) {
        setPhoneError('Nomor HP sudah digunakan user lain!')
        setPhoneLoading(false)
        return
      }
      // Update ke tabel users
      const syncRes = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, phone, name: currentUser.name, username: currentUser.username, role: currentUser.role })
      })
      if (!syncRes.ok) {
        const err = await syncRes.json().catch(() => null)
        setPhoneError(err?.error || 'Gagal update nomor HP')
      } else {
        setShowPhoneModal(false)
        setPhoneInput('')
        setNotification({ message: 'Nomor HP berhasil disimpan!', type: 'success' })
        // Reload user state (bisa fetch ulang atau reload page)
        window.location.reload()
      }
    } finally {
      setPhoneLoading(false)
    }
  }

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
          setCurrentUser({ username: userMeta.username, role: userMeta.role, name: userMeta.name, email: data.user.email, phone: userMeta.phone })
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

  // Social login Google
  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
      if (error) setNotification({ message: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }
  // Forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) {
      setNotification({ message: 'Masukkan email untuk reset password!', type: 'error' })
      return
    }
    setForgotLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail)
      if (error) setNotification({ message: error.message, type: 'error' })
      else setNotification({ message: 'Link reset password dikirim ke email Anda.', type: 'success' })
      setShowForgot(false)
    } finally {
      setForgotLoading(false)
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
        {/* Judul besar modern di atas tab */}
        <div className="login-title mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase mb-2 text-blue-600 dark:text-blue-400 text-center font-sans">Sistem Voting KPU</h1>
          <div className="w-20 h-1 rounded bg-blue-600 dark:bg-blue-400 mx-auto mb-2" />
        </div>
        <div className="flex justify-center mb-6 transition-all duration-300">
          <button
            className={`login-tab-btn ${tab === 'login' ? 'active' : ''} px-6 py-2 rounded-t-lg font-semibold text-base focus:outline-none transition-colors duration-200 ${tab === 'login' ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white' : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
            onClick={() => setTab('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={`login-tab-btn ${tab === 'register' ? 'active' : ''} px-6 py-2 rounded-t-lg font-semibold text-base focus:outline-none transition-colors duration-200 ${tab === 'register' ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white' : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
            onClick={() => setTab('register')}
            type="button"
          >
            Register
          </button>
        </div>
        {tab === 'login' ? (
          <>
          <form id="login-form" className="login-form fade-in" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email:</label>
              <div className="input-icon-group">
                <Mail size={18} className="input-icon" />
                <input type="email" id="login-email" ref={emailRef} required placeholder="Masukkan email Anda" />
              </div>
              <small className="input-helper">Contoh: user@email.com</small>
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password:</label>
              <div className="input-icon-group">
                <Lock size={18} className="input-icon" />
                <input type={showLoginPassword ? 'text' : 'password'} id="login-password" ref={passwordRef} required placeholder="Masukkan password Anda" />
                <button type="button" className="show-password-btn" onClick={() => setShowLoginPassword(v => !v)} tabIndex={-1} aria-label="Tampilkan Password">
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <small className="input-helper">Password minimal 8 karakter</small>
            </div>
            <div className="form-group">
              <label htmlFor="login-role">Role:</label>
              <select id="login-role" ref={roleRef} required>
                <option value="">Pilih Role</option>
                <option value="admin">Petugas</option>
                <option value="user">Pemilih</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full flex justify-center items-center" disabled={loading}>{loading ? 'Memproses...' : 'Login'}</button>
            <div className="flex justify-end mt-2">
              <button type="button" className="forgot-link" onClick={() => setShowForgot(true)}>Lupa password?</button>
            </div>
          </form>
          <div className="login-or-separator">
            <span className="login-or-text">atau</span>
          </div>
          <button type="button" className="btn-google w-full mt-2 flex items-center justify-center gap-2" onClick={handleGoogleLogin} disabled={loading} style={{fontWeight:600}}>
            <span className="google-logo" style={{display:'flex',alignItems:'center',marginRight:12}}>
              {/* SVG Google G resmi */}
              <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g>
                  <path d="M19.6 10.23c0-.68-.06-1.36-.18-2.02H10v3.82h5.42c-.23 1.23-.93 2.27-1.98 2.97v2.47h3.2c1.87-1.72 2.96-4.25 2.96-7.24z" fill="#4285F4"/>
                  <path d="M10 20c2.7 0 4.97-.9 6.63-2.44l-3.2-2.47c-.89.6-2.02.96-3.43.96-2.64 0-4.87-1.78-5.67-4.18H1.05v2.62C2.79 17.98 6.13 20 10 20z" fill="#34A853"/>
                  <path d="M4.33 12.87A5.99 5.99 0 0 1 4 10c0-.99.18-1.95.33-2.87V4.51H1.05A9.98 9.98 0 0 0 0 10c0 1.64.39 3.19 1.05 4.49l3.28-2.62z" fill="#FBBC05"/>
                  <path d="M10 3.96c1.47 0 2.78.51 3.81 1.51l2.85-2.85C14.97.9 12.7 0 10 0 6.13 0 2.79 2.02 1.05 5.51l3.28 2.62C5.13 5.74 7.36 3.96 10 3.96z" fill="#EA4335"/>
                </g>
              </svg>
            </span>
            <span>Login dengan Google</span>
          </button>
          <div className="login-or-separator">
            <span className="login-or-text">atau login dengan nomor HP</span>
          </div>
          <form id="otp-login-form" className="login-form fade-in" onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="otp-phone">Nomor HP:</label>
              <div className="input-icon-group">
                <Phone size={18} className="input-icon" />
                <input type="tel" id="otp-phone" value={otpPhone} onChange={e => setOtpPhone(e.target.value)} required placeholder="Contoh: +6281234567890" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full flex justify-center items-center" disabled={otpLoading}>{otpLoading ? 'Mengirim OTP...' : 'Kirim OTP'}</button>
          </form>
          {/* Modal forgot password */}
          {showForgot && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h4>Reset Password</h4>
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label htmlFor="forgot-email">Email:</label>
                    <input type="email" id="forgot-email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="btn-primary" disabled={forgotLoading}>{forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}</button>
                    <button type="button" className="btn-secondary flex justify-center items-center" onClick={() => setShowForgot(false)}>Batal</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </>
        ) : (
          <form id="register-form" className="login-form fade-in" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="reg-username">Username:</label>
              <div className="input-icon-group">
                <User size={18} className="input-icon" />
                <input type="text" id="reg-username" ref={regUsernameRef} required placeholder="Username unik" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reg-name">Nama Lengkap:</label>
              <div className="input-icon-group">
                <User size={18} className="input-icon" />
                <input type="text" id="reg-name" ref={regNameRef} required placeholder="Nama lengkap Anda" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email:</label>
              <div className="input-icon-group">
                <Mail size={18} className="input-icon" />
                <input type="email" id="reg-email" ref={regEmailRef} required placeholder="Email aktif" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reg-phone">Nomor HP:</label>
              <div className="input-icon-group">
                <Phone size={18} className="input-icon" />
                <input type="tel" id="reg-phone" ref={regPhoneRef} required placeholder="Contoh: +6281234567890" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Password:</label>
              <div className="input-icon-group">
                <Lock size={18} className="input-icon" />
                <input type={showRegPassword ? 'text' : 'password'} id="reg-password" ref={regPasswordRef} required placeholder="Password minimal 8 karakter" />
                <button type="button" className="show-password-btn" onClick={() => setShowRegPassword(v => !v)} tabIndex={-1} aria-label="Tampilkan Password">
                  {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reg-confirm-password">Konfirmasi Password:</label>
              <div className="input-icon-group">
                <Lock size={18} className="input-icon" />
                <input type={showRegConfirmPassword ? 'text' : 'password'} id="reg-confirm-password" ref={regConfirmPasswordRef} required placeholder="Ulangi password" />
                <button type="button" className="show-password-btn" onClick={() => setShowRegConfirmPassword(v => !v)} tabIndex={-1} aria-label="Tampilkan Password">
                  {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full flex justify-center items-center" disabled={loading}>{loading ? 'Memproses...' : 'Register'}</button>
          </form>
        )}
        <div className="login-footer">
          <button id="show-manual" className="btn-secondary flex justify-center items-center" type="button" onClick={handleShowManual}>Lihat Manual</button>
        </div>
      </div>
      {/* Modal input nomor telepon untuk user Google */}
      {showPhoneModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Lengkapi Nomor Telepon</h4>
            <form onSubmit={handleSubmitPhone}>
              <div className="form-group">
                <label htmlFor="google-phone">Nomor HP:</label>
                <input type="tel" id="google-phone" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} required placeholder="Contoh: +6281234567890" />
                {phoneError && <div className="text-red-500 text-sm mt-1">{phoneError}</div>}
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" className="btn-primary" disabled={phoneLoading}>{phoneLoading ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginScreen 