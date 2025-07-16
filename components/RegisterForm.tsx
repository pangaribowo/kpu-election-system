import React, { useRef, useState, useEffect } from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'
import { User, Mail, Lock, Eye, Phone } from 'lucide-react'
import { useRouter } from 'next/router'

const RegisterForm = () => {
  const { setCurrentUser, setActiveTab, setNotification } = useVoting()
  const router = useRouter()
  const usernameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [showPasswordError, setShowPasswordError] = useState(false)

  // Real-time password match validation (best practice 2025)
  useEffect(() => {
    if (confirmPasswordValue.length === 0) {
      setShowPasswordError(false)
      return
    }
    if (passwordValue !== confirmPasswordValue) {
      setShowPasswordError(true)
    } else {
      setShowPasswordError(false)
    }
  }, [passwordValue, confirmPasswordValue])

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPhoneError(null)
    const email = emailRef.current?.value.trim() || ''
    const username = usernameRef.current?.value.trim() || ''
    const password = passwordRef.current?.value.trim() || ''
    const confirmPassword = confirmPasswordRef.current?.value.trim() || ''
    const name = nameRef.current?.value.trim() || ''
    const role = 'user'
    let phone = phoneRef.current?.value.trim() || ''
    // Validasi: hanya angka, tidak boleh diawali 0, 62, atau +
    if (!/^[0-9]+$/.test(phone)) {
      setPhoneError('Nomor HP hanya boleh berisi angka, tanpa spasi atau karakter lain.')
      return
    }
    if (phone.startsWith('0')) {
      setPhoneError('Nomor HP tidak boleh diawali 0. Masukkan tanpa 0 di depan.')
      return
    }
    if (phone.startsWith('62')) {
      setPhoneError('Nomor HP tidak boleh diawali 62. Masukkan tanpa 62 di depan, cukup angka setelah +62.')
      return
    }
    if (phone.startsWith('+')) {
      setPhoneError('Nomor HP tidak boleh diawali +. Masukkan tanpa +62, cukup angka setelah +62.')
      return
    }
    // Gabungkan dengan +62
    phone = '+62' + phone
    if (!email || !password || !name) {
      setNotification({ message: 'Mohon lengkapi semua field!', type: 'error' })
      return
    }
    if (password !== confirmPassword) {
      setPasswordError('Password dan konfirmasi password tidak sama!')
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
        const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email)
        if (userData && userData.user) {
          // Cek provider
          const provider = userData.user.app_metadata?.provider
          if (provider === 'google') {
            setNotification({ message: 'Email ini sudah pernah digunakan untuk login dengan Google. Silakan login dengan Google.', type: 'error' })
            setLoading(false)
            return
          }
        }
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
        <div className="input-icon-group">
          <User size={18} className="input-icon" />
          <input type="text" id="reg-username" ref={usernameRef} required placeholder="Username unik" />
        </div>
        <small className="input-helper">Contoh: budi123</small>
      </div>
      <div className="form-group">
        <label htmlFor="reg-name">Nama Lengkap:</label>
        <div className="input-icon-group">
          <User size={18} className="input-icon" />
          <input type="text" id="reg-name" ref={nameRef} required placeholder="Budi Santoso" />
        </div>
        <small className="input-helper">Contoh: Budi Santoso</small>
      </div>
      <div className="form-group">
        <label htmlFor="reg-phone">Nomor HP:</label>
        <div className="flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md rounded-r-none border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
            +62
          </span>
          <input
            type="tel"
            id="reg-phone"
            ref={phoneRef}
            required
            className="rounded-none rounded-r-md border border-gray-300 dark:border-gray-700 flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="Contoh: 821xxxxxxx"
            pattern="^[1-9][0-9]{8,12}$"
            maxLength={13}
            inputMode="numeric"
            autoComplete="tel"
            onInput={e => {
              let value = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
              if (/^(0|62|\+62|\+)/.test(value)) {
                setPhoneError('Nomor HP tidak boleh diawali 0, 62, atau +. Masukkan hanya angka setelah +62.')
              } else {
                setPhoneError(null)
              }
            }}
          />
        </div>
        <small className="input-helper">Masukkan nomor tanpa 0, 62, atau + di depan, contoh: 821xxxxxxx</small>
        {phoneError && <small className="input-helper text-red-500 dark:text-red-400 font-semibold mt-2 block" role="alert">{phoneError}</small>}
      </div>
      <div className="form-group">
        <label htmlFor="reg-email">Email:</label>
        <div className="input-icon-group">
          <Mail size={18} className="input-icon" />
          <input type="email" id="reg-email" ref={emailRef} required placeholder="user@email.com" />
        </div>
        <small className="input-helper">Contoh: user@email.com</small>
      </div>
      <div className="form-group">
        <label htmlFor="reg-password">Password:</label>
        <div className="input-icon-group relative">
          <Lock size={18} className="input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="reg-password"
            ref={passwordRef}
            required
            placeholder="Minimal 8 karakter"
            onChange={e => setPasswordValue(e.target.value)}
          />
          <button type="button" className="show-password-btn absolute right-2 top-1/2 -translate-y-1/2" tabIndex={-1} aria-label="Tampilkan Password" onClick={() => setShowPassword(!showPassword)}>
            <Eye size={18} />
          </button>
        </div>
        <small className="input-helper">Password minimal 8 karakter</small>
      </div>
      <div className="form-group">
        <label htmlFor="reg-confirm-password">Konfirmasi Password:</label>
        <div className="input-icon-group relative">
          <Lock size={18} className="input-icon" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="reg-confirm-password"
            ref={confirmPasswordRef}
            required
            placeholder="Ulangi password Anda"
            onChange={e => setConfirmPasswordValue(e.target.value)}
          />
          <button type="button" className="show-password-btn absolute right-2 top-1/2 -translate-y-1/2" tabIndex={-1} aria-label="Tampilkan Password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Eye size={18} />
          </button>
      </div>
        <small className="input-helper">Ketik ulang password yang sama</small>
        {showPasswordError && (
          <small className="input-helper text-red-500 dark:text-red-400 font-semibold mt-2 block" role="alert">
            Password dan konfirmasi password tidak sama!
          </small>
        )}
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Memproses...' : 'Register'}</button>
      {/* Tombol akses manual guest */}
      <button
        type="button"
        className="w-full mt-2 py-2 rounded-lg border border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        onClick={async () => {
          setCurrentUser({ username: 'guest', role: 'guest', name: 'Guest' })
          setTimeout(() => {
            router.push('/manual')
          }, 150)
        }}
        tabIndex={0}
        aria-label="Lihat Manual/Panduan sebagai Guest"
      >
        Lihat Manual/Panduan Tanpa Login
      </button>
      <div className="text-center mt-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">Sudah punya akun? </span>
        <button type="button" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-sm" onClick={() => {
          if (typeof window !== 'undefined') {
            // Jika ada tab login, trigger tab, jika tidak redirect ke /login
            if (window.location.pathname === '/login') {
              const tabBtn = document.querySelector('.login-tab-btn');
              if (tabBtn) (tabBtn as HTMLElement).click();
            } else {
              window.location.href = '/login';
            }
          }
        }}>Login di sini</button>
      </div>
    </form>
  )
}

export default RegisterForm 