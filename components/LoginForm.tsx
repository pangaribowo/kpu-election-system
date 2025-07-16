import React, { useRef, useState, useEffect } from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import { Mail, Lock, Eye, EyeOff, KeyRound, User, Phone } from 'lucide-react'
import RegisterForm from './RegisterForm'

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
  const [regPhoneError, setRegPhoneError] = useState<string | null>(null)
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
            username: user.email, // PENTING: username = email agar konsisten
            phone: user.phone || '-',
            role: 'user',
          })
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => null)
            setNotification && setNotification({ message: 'Gagal sinkronisasi user Google: ' + (err?.error || 'Unknown error'), type: 'error' })
            return;
          }
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
            phone_verified: false, // default, nanti update setelah login sukses
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
    // const role = roleRef.current?.value as 'admin' | 'user' // Tidak perlu lagi
    if (!email || !password) {
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
        // Logging error detail untuk debugging
        console.error('Login error:', error)
        // Tangani error password salah secara spesifik
        if (error.message && error.message.toLowerCase().includes('invalid login credentials')) {
          // Cek identities dari API
          try {
            const res = await fetch(`/api/auth-user-by-email?email=${encodeURIComponent(email)}`)
            const userData = await res.json()
            const identities = userData.identities || []
            // Cek apakah ada provider email/manual
            const hasEmailProvider = identities.some((id: any) => id.provider === 'email')
            const hasGoogleProvider = identities.some((id: any) => id.provider === 'google')
            if (hasEmailProvider) {
              setNotification({ message: 'Email atau password salah.', type: 'error' })
              setLoading(false)
              return
            } else if (hasGoogleProvider) {
              setNotification({
                message: 'Email atau password salah. Gunakan fitur "Lupa Password" untuk mengatur ulang password.',
                type: 'warning',
              })
              setLoading(false)
              return
            } else {
              setNotification({ message: 'Akun tidak ditemukan.', type: 'error' })
              setLoading(false)
              return
            }
          } catch (err) {
            console.error('Cek identities error:', err)
            setNotification({ message: 'Email atau password salah.', type: 'error' })
            setLoading(false)
            return
          }
        }
        // Jika error lain, baru cek provider (legacy fallback)
        let provider = null
        try {
          // Cek di Supabase Auth
          const res = await fetch(`/api/auth-user-by-email?email=${encodeURIComponent(email)}`)
          const userData = await res.json()
          if (userData && userData.provider) {
            provider = userData.provider
          }
        } catch (err) {
          console.error('Cek provider error:', err)
        }
        if (provider === 'google') {
          setNotification({
            message: 'Akun ini sebelumnya terdaftar menggunakan Google. Silakan login dengan Google atau gunakan fitur "Lupa Password" untuk mengatur ulang password.',
            type: 'warning',
          })
          setLoading(false)
          return
        }
        setNotification({ message: error.message || 'Gagal login. Silakan coba lagi.', type: 'error' })
        setLoading(false)
        return
      } else if (!data.user?.email_confirmed_at) {
        setNotification({ message: 'Akun belum diverifikasi. Silakan cek email Anda.', type: 'error' })
      } else {
        // Ambil data user dari user_metadata
        const userMeta = data.user.user_metadata || {}
        // Ambil data user dari database custom
        let userDb = null
        try {
          const userRes = await fetch(`/api/users/sync?email=${encodeURIComponent(data.user.email)}`)
          userDb = await userRes.json()
        } catch {}
        if (userDb && userDb.id) {
          setCurrentUser({
            id: userDb.id,
            username: userDb.username || '-',
            role: userDb.role,
            name: userDb.name,
            email: userDb.email,
            phone: userDb.phone || '-',
            phone_verified: !!data.user.phone_confirmed_at,
          })
        } else {
          setCurrentUser({
            username: userMeta.username || '-',
            role: userMeta.role,
            name: userMeta.name,
            email: data.user.email,
            phone: userMeta.phone || '-',
            phone_verified: !!data.user.phone_confirmed_at,
          })
        }
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
    } catch (err) {
      setNotification({ message: 'Terjadi kesalahan jaringan', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegPhoneError(null)
    const email = regEmailRef.current?.value.trim() || ''
    const password = regPasswordRef.current?.value.trim() || ''
    const confirmPassword = regConfirmPasswordRef.current?.value.trim() || ''
    const name = regNameRef.current?.value.trim() || ''
    const phoneRaw = regPhoneRef.current?.value.trim() || ''
    if (!email || !password || !confirmPassword || !name) {
      setNotification({ message: 'Mohon lengkapi semua field!', type: 'error' })
      return
    }
    if (password !== confirmPassword) {
      setNotification({ message: 'Password dan konfirmasi password tidak sama!', type: 'error' })
      return
    }
    setLoading(true)
    try {
      // Validasi duplikasi email
      const checkEmailRes = await fetch(`/api/users/sync?email=${encodeURIComponent(email)}`)
      const checkEmailData = await checkEmailRes.json()
      if (checkEmailData && checkEmailData.id) {
        setNotification({ message: 'Email sudah terdaftar!', type: 'error' })
        setLoading(false)
        return
      }
      // Validasi duplikasi phone
      if (phoneRaw && phoneRaw !== '-') {
        const checkPhoneRes = await fetch(`/api/users/sync?phone=${encodeURIComponent(phoneRaw)}`)
        const checkPhoneData = await checkPhoneRes.json()
        if (checkPhoneData && checkPhoneData.exists) {
          setNotification({ message: 'Nomor HP sudah terdaftar!', type: 'error' })
          setLoading(false)
          return
        }
      }
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      // Register ke Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone: phoneRaw, username: email, role: 'user' },
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
          body: JSON.stringify({ email, name, username: email, phone: phoneRaw, role: 'user' })
        })
        if (!syncRes.ok) {
          const err = await syncRes.json().catch(() => null)
          setNotification({ message: err?.error || 'Registrasi gagal sinkronisasi ke database.', type: 'error' })
          setLoading(false)
          return
        }
        setNotification({ message: 'Registrasi sukses! Silakan cek email untuk verifikasi.', type: 'success' })
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

  const handleShowManual = async () => {
    setCurrentUser({ username: 'guest', role: 'guest', name: 'Guest' });
    setTimeout(() => {
      router.push('/manual');
    }, 150);
  };

  if (currentUser) return null;

  const formInputClass = "w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm";
  const formLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const formHelperClass = "text-xs text-gray-500 dark:text-gray-400 mt-1";
  const formButtonClass = "w-full btn-primary py-2.5 text-sm disabled:opacity-70";
  const passwordWrapperClass = "relative";
  const showPasswordButtonClass = "absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-gray-800">
      <div className="login-container bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 text-center">
        {/* Judul besar modern di atas tab */}
        <div className="login-title mb-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase mb-2 text-blue-600 dark:text-blue-400 text-center font-sans">Sistem Voting KPU</h1>
          <div className="w-20 h-1 rounded bg-blue-600 dark:bg-blue-400 mx-auto mb-2 shadow-[0_0_16px_2px_rgba(59,130,246,0.4)] animate-pulse" />
        </div>
        <div className="flex justify-center gap-2 mb-2">
          <button
            className={`login-tab-btn px-6 py-2 sm:px-8 sm:py-3 rounded-t-xl font-semibold text-base sm:text-lg focus:outline-none transition-all duration-300
              ${tab === 'login'
                ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-lg border-b-4 border-blue-600 dark:border-blue-400 z-10'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border-b-4 border-transparent'}
            `}
            style={{ minWidth: 120 }}
            onClick={() => setTab('login')}
            type="button"
            aria-current={tab === 'login' ? 'page' : undefined}
          >
            Login
          </button>
          <button
            className={`login-tab-btn px-6 py-2 sm:px-8 sm:py-3 rounded-t-xl font-semibold text-base sm:text-lg focus:outline-none transition-all duration-300
              ${tab === 'register'
                ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-lg border-b-4 border-blue-600 dark:border-blue-400 z-10'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border-b-4 border-transparent'}
            `}
            style={{ minWidth: 120 }}
            onClick={() => setTab('register')}
            type="button"
            aria-current={tab === 'register' ? 'page' : undefined}
          >
            Register
          </button>
        </div>
        <div className="w-full flex flex-col gap-6">
          {tab === 'login' && (
            <div className="flex flex-col gap-3">
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
                  <div className="input-icon-group relative">
                    <Lock size={18} className="input-icon" />
                    <input type={showLoginPassword ? 'text' : 'password'} id="login-password" ref={passwordRef} required placeholder="Masukkan password Anda" />
                    <button type="button" className="show-password-btn absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowLoginPassword(v => !v)} tabIndex={-1} aria-label="Tampilkan Password">
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <small className="input-helper">Password minimal 8 karakter</small>
                </div>
                <div className="form-group">
                  <label htmlFor="login-role" className="sr-only">Role:</label>
                  {/* Dropdown role dihapus karena tidak digunakan, role diambil dari backend */}
                  {/* <select id="login-role" ref={roleRef} required>
                    <option value="">Pilih Role</option>
                    <option value="admin">Petugas KPU</option>
                    <option value="user">Pemilih</option>
                  </select> */}
                </div>
                <button type="submit" className="btn-primary w-full flex justify-center items-center" disabled={loading}>{loading ? 'Memproses...' : 'Login'}</button>
                <div className="flex justify-end mt-2">
                  <button type="button" className="forgot-link" onClick={() => setShowForgot(true)}>Lupa password?</button>
                </div>
              </form>
              <div className="login-or-separator">
                <span className="login-or-text">atau</span>
              </div>
              <button type="button" className="btn-google w-full flex items-center justify-center gap-2" onClick={handleGoogleLogin} disabled={loading} style={{fontWeight:600}}>
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
              <button
                type="button"
                className="w-full py-2 rounded-lg border border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                tabIndex={0}
                aria-label="Lihat Manual/Panduan sebagai Guest"
                onClick={() => { handleShowManual(); }}
              >
                Lihat Manual/Panduan Tanpa Login
              </button>
              <div className="login-or-separator">
                <span className="login-or-text">atau login dengan nomor HP</span>
              </div>
              <form id="otp-login-form" className="login-form fade-in">
                <div className="form-group">
                  <label htmlFor="otp-phone">Nomor HP:</label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md rounded-r-none border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                      +62
                    </span>
                    <input
                      type="tel"
                      id="otp-phone"
                      value={otpPhone}
                      disabled
                      className="rounded-none rounded-r-md border border-gray-300 dark:border-gray-700 flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="Contoh: 821xxxxxxx"
                    />
                  </div>
                  <div className="text-yellow-600 text-sm mt-1">Verifikasi dengan nomor HP akan segera hadir (Coming Soon)</div>
                </div>
                <button type="button" className="btn-primary w-full flex justify-center items-center rounded-full" disabled>Coming Soon</button>
              </form>
            </div>
          )}
          {tab === 'register' && (
            <>
              <RegisterForm />
            </>
          )}
        </div>
          {/* Modal forgot password */}
          {showForgot && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h4>Reset Password</h4>
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label htmlFor="forgot-email">Email:</label>
                    <input type="email" id="forgot-email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required placeholder="Masukkan email Anda" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="btn-primary" disabled={forgotLoading}>{forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}</button>
                    <button type="button" className="btn-secondary flex justify-center items-center" onClick={() => setShowForgot(false)}>Batal</button>
                  </div>
                </form>
              </div>
            </div>
          )}
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