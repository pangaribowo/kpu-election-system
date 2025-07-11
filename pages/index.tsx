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
      <div className="dashboard-container mx-auto my-10 p-8 max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center">
        <h1 className="dashboard-title text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          Selamat datang, {currentUser.name}!
        </h1>
        <div className="dashboard-role text-gray-600 dark:text-gray-300 mb-6">
          Peran: {currentUser.role}
        </div>
        <div className="dashboard-stats grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div
              className="dashboard-stat bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              key={s.label}
            >
              <div className="stat-label text-sm text-gray-500 dark:text-gray-400 mb-1">
                {s.label}
              </div>
              <div className="stat-value text-2xl font-bold text-blue-600 dark:text-blue-400">
                {s.value}
              </div>
            </div>
          ))}
        </div>
        {/* Quick links can be re-added here if needed, styled with Tailwind */}
      </div>
    </>
  );
}

export default Dashboard
