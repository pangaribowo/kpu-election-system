import React, { useState } from 'react'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'

const ProfilePage = () => {
  const { currentUser, setCurrentUser, setNotification } = useVoting()
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    password: '',
    newPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  React.useEffect(() => {
    if (!currentUser) router.replace('/login')
  }, [currentUser, router])

  if (!currentUser) return null

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      let userId = (currentUser as any).id
      if (!userId) {
        // Fetch UUID dari backend
        let resUser
        if (currentUser?.email) {
          resUser = await fetch(`/api/users/sync?email=${encodeURIComponent(currentUser.email)}`)
        } else {
          resUser = await fetch(`/api/users/sync?username=${encodeURIComponent(currentUser.username)}`)
        }
        const dataUser = await resUser.json()
        if (!resUser.ok || !dataUser.id) throw new Error('Gagal ambil UUID user')
        userId = dataUser.id
        setCurrentUser && setCurrentUser({ ...currentUser, id: userId })
      }
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          name: form.name,
          phone: form.phone,
          password: form.password,
          newPassword: form.newPassword,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal update profil')
      setSuccess('Profil berhasil diupdate!')
      setNotification && setNotification({ message: 'Profil berhasil diupdate!', type: 'success' })
      setCurrentUser && setCurrentUser(data.user)
      setEditMode(false)
    } catch (err: any) {
      setError(err.message || 'Gagal update profil')
      setNotification && setNotification({ message: err.message || 'Gagal update profil', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto my-10 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">Profil Saya</h2>
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
          <div className="mb-2"><b>Role:</b> {currentUser.role}</div>
          <button className="btn-primary mt-4" onClick={() => setEditMode(true)}>Edit Profil</button>
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
          <div>
            <label className="block mb-1 font-medium">Password Lama</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="input-modern w-full dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-600" placeholder="Isi jika ingin ganti password" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password Baru</label>
            <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} className="input-modern w-full dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-600" placeholder="Isi jika ingin ganti password" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}
          <div className="flex gap-3 mt-2">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
            <button type="button" className="btn-secondary" onClick={() => setEditMode(false)} disabled={loading}>Batal</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ProfilePage
