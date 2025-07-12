import React, { useEffect, useState, useRef } from 'react'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../components/Header'
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

const Dashboard = () => {
  const { currentUser, isAuthChecked } = useVoting()
  const router = useRouter()
  const [stats, setStats] = useState({ totalVoters: 0, totalVoted: 0, totalCandidates: 0 })
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const firstLoad = useRef(true)

  useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace('/login')
    }
  }, [currentUser, isAuthChecked, router])

  useEffect(() => {
    let polling: NodeJS.Timeout | null = null
    const fetchStats = async () => {
      if (firstLoad.current) setIsLoading(true)
      try {
        const res = await fetch('/api/voting')
        const data = await res.json()
        const newStats = {
          totalVoters: data.totalVoters || 0,
          totalVoted: data.totalVoted || 0,
          totalCandidates: data.hasil ? data.hasil.length : 0,
        }
        // Shallow compare, only update if changed
        if (
          newStats.totalVoters !== stats.totalVoters ||
          newStats.totalVoted !== stats.totalVoted ||
          newStats.totalCandidates !== stats.totalCandidates
        ) {
          setStats(newStats)
        }
      } catch {}
      if (firstLoad.current) setIsLoading(false)
      firstLoad.current = false
    }
    fetchStats()
    polling = setInterval(fetchStats, 5000)
    return () => polling && clearInterval(polling)
    // eslint-disable-next-line
  }, [stats])

  useEffect(() => {
    if (currentUser?.username) {
      fetch(`/api/voting?username=${encodeURIComponent(currentUser.username)}`)
        .then(res => res.json())
        .then(data => setHasVoted(!!data.hasVoted))
        .catch(() => setHasVoted(false))
    }
  }, [currentUser])

  if (!isAuthChecked) return null
  if (!currentUser) return null

  const participation = stats.totalVoters > 0 ? ((stats.totalVoted / stats.totalVoters) * 100).toFixed(1) : '0.0'

  return (
    <>
      <div className="dashboard-container my-10 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg text-center transition-colors duration-300 px-4">
        <h1 className="dashboard-title text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Selamat Datang, {currentUser.name}!</h1>
        <div className="dashboard-role text-slate-500 dark:text-slate-300 mb-6">Role: {currentUser.role === 'user' ? 'Pemilih' : currentUser.role === 'admin' ? 'Petugas KPU' : currentUser.role}</div>
        <div className="dashboard-stats flex flex-wrap gap-5 justify-center mb-8">
          <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
            <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Total Pemilih</div>
            <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{isLoading ? '-' : stats.totalVoters}</div>
          </div>
          <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
            <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Total Kandidat</div>
            <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{isLoading ? '-' : stats.totalCandidates}</div>
          </div>
          <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
            <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Suara Masuk</div>
            <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{isLoading ? '-' : stats.totalVoted}</div>
          </div>
          <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
            <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Partisipasi</div>
            <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{isLoading ? '-' : `${participation}% (${stats.totalVoted}/${stats.totalVoters})`}</div>
          </div>
          <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
            <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Status Voting</div>
            <div className="stat-value text-xl md:text-2xl font-bold flex items-center justify-center gap-2">
              {hasVoted ? (
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold"><FiCheckCircle /> Sudah Voting</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold"><FiAlertCircle /> Belum Voting</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard
