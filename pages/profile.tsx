import React, { useState } from 'react'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { FiUser } from 'react-icons/fi'

const ProfilePage = () => {
  const { currentUser, setCurrentUser, setNotification } = useVoting()
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
    if (!currentUser) router.replace('/login')
    // Reset pesan reset password saat halaman dimount
    setResetMsg('')
  }, [currentUser, router])

  // Auto-dismiss resetMsg setelah 5 detik
  React.useEffect(() => {
    if (resetMsg) {
      const timer = setTimeout(() => setResetMsg(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [resetMsg])

  if (!currentUser) return null

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
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          name: form.name,
          phone: form.phone,
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
          <div className="mb-2"><b>Nomor HP:</b> {currentUser.phone || <span className="text-red-500">Belum diisi</span>}</div>
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div>
            <label className="block mb-1 font-medium">Nama Lengkap</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="input-modern w-full dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-600" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="input-modern w-full dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-600" required disabled />
          </div>
          <div>
            <label className="block mb-1 font-medium">Nomor HP</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="input-modern w-full dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-600" required placeholder="Format: +6281234567890" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}
          <div className="flex gap-3 mt-2">
            <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
            <button type="button" className="btn-secondary w-full" onClick={() => setEditMode(false)} disabled={loading}>Batal</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ProfilePage
