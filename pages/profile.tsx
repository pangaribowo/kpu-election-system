import React, { useState } from 'react'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { FiUser } from 'react-icons/fi'
import InputWithClear from '../components/InputWithClear'

const ProfilePage = () => {
  const { currentUser, setCurrentUser, setNotification, isAuthChecked } = useVoting()
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  React.useEffect(() => {
    // Tunggu auth check selesai sebelum redirect
    if (!isAuthChecked) return;
    if (isAuthChecked && (typeof currentUser === 'undefined' || currentUser === null)) {
      router.replace('/login')
    } else if (currentUser && currentUser.role === 'guest') {
      router.replace('/manual')
    }
    setResetMsg('')
  }, [currentUser, router, isAuthChecked])

  // Auto-dismiss resetMsg setelah 5 detik
  React.useEffect(() => {
    if (resetMsg) {
      const timer = setTimeout(() => setResetMsg(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [resetMsg])

  // Sinkronkan form dengan currentUser setiap kali currentUser berubah
  React.useEffect(() => {
    setForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone?.replace(/^\+62/, '') || '', // trim +62 saat masuk edit mode
    })
  }, [currentUser])

  // Validasi khusus nomor HP
  const [phoneError, setPhoneError] = useState('');
  const handlePhoneChange = e => {
    let val = e.target.value;
    // Validasi: tidak boleh diawali +, 62, atau 0
    if (/^(\+|62|0)/.test(val)) {
      setPhoneError('Nomor tidak boleh diawali +, 62, atau 0');
    } else if (!/^\d*$/.test(val)) {
      setPhoneError('Nomor hanya boleh berisi angka');
    } else if (val.length > 0 && (val.length < 9 || val.length > 13)) {
      setPhoneError('Nomor HP minimal 9 digit dan maksimal 13 digit');
    } else {
      setPhoneError('');
    }
    setForm({ ...form, phone: val });
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleEditProfile = () => {
    setEditMode(true)
    setResetMsg('') // Reset pesan reset password saat masuk edit mode
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      let userId = (currentUser as any).id
      // Cek apakah id sudah UUID (string, panjang 36, ada '-')
      const isUUID = typeof userId === 'string' && userId.length === 36 && userId.includes('-')
      if (!isUUID) {
        // Fetch UUID dari backend
        let resUser
        if (currentUser?.email) {
          resUser = await fetch(`/api/users/sync?email=${encodeURIComponent(currentUser.email)}`)
        } else {
          resUser = await fetch(`/api/users/sync?username=${encodeURIComponent(currentUser.username)}`)
        }
        const dataUser = await resUser.json()
        if (!resUser.ok || !dataUser.id) throw new Error('Gagal ambil UUID user, silakan login ulang')
        userId = dataUser.id
        setCurrentUser && setCurrentUser({ ...currentUser, ...dataUser })
      }
      // Gabungkan +62 dengan input sebelum submit
      let phone = form.phone.trim()
      if (!/^[0-9]{9,13}$/.test(phone)) throw new Error('Nomor HP minimal 9 digit dan maksimal 13 digit, hanya angka.')
      phone = '+62' + phone
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          name: form.name,
          phone,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal update profil')
      setSuccess('Profil berhasil diupdate!')
      setNotification && setNotification({ message: 'Profil berhasil diupdate!', type: 'success' })
      // Fetch ulang data user terbaru dari backend agar context dan UI sinkron
      const resUserNew = await fetch(`/api/users/sync?email=${encodeURIComponent(form.email)}`)
      const userDbNew = await resUserNew.json()
      if (userDbNew && userDbNew.id) {
        setCurrentUser && setCurrentUser(userDbNew)
      }
      setEditMode(false)
    } catch (err: any) {
      setError(err.message || 'Gagal update profil')
      setNotification && setNotification({ message: err.message || 'Gagal update profil', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setResetLoading(true)
    setResetMsg('')
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
        redirectTo: baseUrl + '/login'
      })
      if (error) throw new Error(error.message || 'Gagal mengirim email reset password')
      setResetMsg('Email reset password telah dikirim! Silakan cek inbox/spam email Anda.')
    } catch (err: any) {
      setResetMsg(err.message || 'Gagal mengirim email reset password')
    } finally {
      setResetLoading(false)
    }
  }

  // Setelah semua hook, baru boleh return
  if (!isAuthChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="loader" style={{width:48,height:48,border:'6px solid #eee',borderTop:'6px solid #888',borderRadius:'50%',animation:'spin 1s linear infinite', marginBottom: 16}} />
        <span className="text-gray-600 dark:text-gray-300 font-bold text-center">Memeriksa sesi login...</span>
        <style>{`@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  if (!currentUser) return null
  if (currentUser.role === 'guest') return null

  return (
    <div className="max-w-xl mx-auto my-10 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
      <h1 className="section-title text-3xl font-bold text-blue-700 dark:text-blue-300 mb-8 flex items-center justify-center gap-2">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 mr-1">
          <FiUser className="text-blue-500 dark:text-blue-400" size={24} />
        </span>
        <span className="drop-shadow-sm">PROFIL SAYA</span>
      </h1>
      <div className="flex items-center gap-4 mb-6">
        {currentUser && currentUser.name && (
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-3xl text-blue-500 font-bold">
            {currentUser.name?.[0] || '?'}
          </div>
        )}
        <div>
          <div className="font-semibold text-lg">{currentUser.name}</div>
          <div className="text-slate-500 dark:text-slate-300 text-sm">{currentUser.email}</div>
        </div>
      </div>
      {!editMode ? (
        <>
          <div className="mb-2"><b>Nomor HP:</b> {currentUser.phone ? currentUser.phone : <span className="text-red-500">Belum diisi</span>}</div>
          <div className="mb-2"><b>Role:</b> {currentUser.role === 'admin' ? 'Petugas KPU' : currentUser.role === 'user' ? 'Pemilih' : currentUser.role}</div>
          <div className="flex justify-center mt-4">
            <button className="btn-primary w-full max-w-xs flex justify-center items-center" onClick={handleEditProfile}>Edit Profil</button>
          </div>
          <div className="mt-8 border-t pt-6">
            <div className="mb-2 text-sm text-gray-600 dark:text-gray-300 text-center">Ingin ganti password?</div>
            <div className="flex justify-center">
              <button className="btn-secondary w-full max-w-xs flex justify-center items-center" onClick={handleResetPassword} disabled={resetLoading}>{resetLoading ? 'Mengirim...' : 'Reset Password via Email'}</button>
            </div>
            {resetMsg && <div className="mt-2 text-sm text-green-500 dark:text-green-400 text-center">{resetMsg}</div>}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">Password hanya bisa diganti melalui email reset. Klik tombol di atas, lalu cek inbox/spam email Anda.</div>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block mb-1.5 font-medium text-gray-700 dark:text-gray-200">Nama Lengkap</label>
            <div className="relative">
              <InputWithClear
                name="name"
                value={form.name}
                onChange={handleChange}
                onClear={() => setForm({ ...form, name: '' })}
                className="w-full rounded-xl py-3 px-4 text-base bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                required
                placeholder="Nama lengkap"
                autoComplete="name"
              />
            </div>
          </div>
          {/* Email */}
          <div>
            <label className="block mb-1.5 font-medium text-gray-700 dark:text-gray-200">Email</label>
            <div className="relative">
              <InputWithClear
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl py-3 px-4 text-base bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                required
                placeholder="Email"
                autoComplete="email"
                disabled
              />
            </div>
          </div>
          {/* Nomor HP */}
          <div>
            <label className="block mb-1.5 font-medium text-gray-700 dark:text-gray-200">Nomor HP</label>
            <div className="relative">
              <div className="flex w-full">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-base h-12">
                  +62
                </span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  className={`flex-1 min-w-0 rounded-none rounded-r-xl border border-gray-300 dark:border-gray-600 h-12 text-base py-3 px-4 bg-white dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 border-l-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-400' : ''}`}
                  required
                  placeholder="Contoh: 895xxxxxxx"
                  autoComplete="tel"
                  style={{ borderLeft: 'none' }}
                />
              </div>
              <small className="input-helper text-gray-500 dark:text-gray-400">Masukkan nomor tanpa 0, 62, atau + di depan, contoh: 895xxxxxxx</small>
              {phoneError && <div className="text-red-500 text-xs mt-1">{phoneError}</div>}
            </div>
          </div>
          {/* Error & Success */}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}
          {/* Tombol */}
          <div className="flex gap-3 mt-2">
            <button type="submit" className="btn-primary w-full focus:ring-2 focus:ring-blue-400" disabled={loading || !!phoneError}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
            <button type="button" className="btn-secondary w-full focus:ring-2 focus:ring-blue-400" onClick={() => setEditMode(false)} disabled={loading}>Batal</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ProfilePage
