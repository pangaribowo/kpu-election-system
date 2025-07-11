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
      <div className="dashboard-container">
        <h1 className="dashboard-title">Selamat datang, {currentUser.name}!</h1>
        <div className="dashboard-role">Peran: {currentUser.role}</div>
        <div className="dashboard-stats">
          {stats.map((s) => (
            <div className="dashboard-stat" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>
        {/* Hapus quicklinks navigasi di luar Sidebar */}
        {/* <div className="dashboard-quicklinks">
          {quickLinks.map((l) => (
            <Link href={l.href} key={l.href} className="dashboard-link" legacyBehavior>{l.label}</Link>
          ))}
        </div> */}
        <style jsx>{`
          .dashboard-container {
            max-width: 700px;
            margin: 40px auto;
            padding: 32px 24px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 2px 16px rgba(0,0,0,0.07);
            text-align: center;
          }
          .dashboard-title {
            font-size: 2rem;
            color: #2563eb;
            margin-bottom: 8px;
          }
          .dashboard-role {
            color: #64748b;
            margin-bottom: 24px;
          }
          .dashboard-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 18px;
            justify-content: center;
            margin-bottom: 32px;
          }
          .dashboard-stat {
            background: #f1f5f9;
            border-radius: 10px;
            padding: 18px 28px;
            min-width: 120px;
            box-shadow: 0 1px 4px rgba(59,130,246,0.07);
          }
          .stat-label {
            color: #64748b;
            font-size: 1rem;
            margin-bottom: 6px;
          }
          .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2563eb;
          }
          .dashboard-quicklinks {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            justify-content: center;
          }
          .dashboard-link {
            background: #2563eb;
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: background 0.15s;
          }
          .dashboard-link:hover {
            background: #1d4ed8;
          }
        `}</style>
      </div>
    </>
  );
}

export default Dashboard
