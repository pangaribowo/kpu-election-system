import React from 'react'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../components/Header'

const Dashboard = () => {
  const { currentUser, isAuthChecked } = useVoting()
  const router = useRouter()

  React.useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace('/login')
    }
  }, [currentUser, isAuthChecked, router])

  if (!isAuthChecked) return null
  if (!currentUser) return null

  // Dummy data statistik
  const stats = [
    { label: 'Total Pemilih', value: 120 },
    { label: 'Total Kandidat', value: 3 },
    { label: 'Suara Masuk', value: 87 },
    { label: 'Status Voting', value: 'Aktif' },
  ]

  const quickLinks = [
    { href: '/voting', label: 'Voting' },
    { href: '/quickcount', label: 'Quick Count' },
    { href: '/users', label: 'Users' },
    { href: '/manual', label: 'Manual' },
  ]

  return (
    <>
      <Header />
      <div className="dashboard-container max-w-[700px] mx-auto my-10 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg text-center transition-colors duration-300">
        <h1 className="dashboard-title text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Selamat datang, {currentUser.name}!</h1>
        <div className="dashboard-role text-slate-500 dark:text-slate-300 mb-6">Peran: {currentUser.role}</div>
        <div className="dashboard-stats flex flex-wrap gap-5 justify-center mb-8">
          {stats.map((s) => (
            <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300" key={s.label}>
              <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">{s.label}</div>
              <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard
