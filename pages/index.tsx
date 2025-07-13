import React, { useEffect, useState, useRef } from 'react'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../components/Header'
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { supabase } from '../lib/supabaseClient';

// Komponen Skeleton Loader untuk Dashboard Stats
const SkeletonDashboardStats = () => (
  <div className="dashboard-stats flex flex-wrap gap-5 justify-center mb-8">
    {[1,2,3,4,5].map(i => (
      <div key={i} className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
        <div className="stat-label h-4 w-24 mb-2 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="stat-value h-8 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    ))}
  </div>
)

const Dashboard = () => {
  const { currentUser, isAuthChecked, fetchVotingStats, hasVoted } = useVoting()
  const router = useRouter()
  const [stats, setStats] = useState({ totalVoters: 0, totalVoted: 0, totalCandidates: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const firstLoad = useRef(true)
  const isRealtimeActive = useRef(false)

  useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace('/login')
    }
  }, [currentUser, isAuthChecked, router])

  useEffect(() => {
    let polling: NodeJS.Timeout | null = null
    let isUnmounted = false
    const isRealtimeActive = { current: false }

    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const data = await fetchVotingStats()
        if (!isUnmounted) setStats({
          totalVoters: data.totalVoters || 0,
          totalVoted: data.totalVoted || 0,
          totalCandidates: data.totalCandidates || 0,
        })
      } catch {
        if (!isUnmounted) setStats({ totalVoters: 0, totalVoted: 0, totalCandidates: 0 })
      } finally {
        if (!isUnmounted) setIsLoading(false)
      }
    }

    // Hanya fetch jika sudah auth checked dan user ada
    if (isAuthChecked && currentUser) {
      fetchStats()
    }
    const channel = supabase.channel('kpu-election')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voting' }, () => {
        isRealtimeActive.current = true
        fetchStats()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        isRealtimeActive.current = true
        fetchStats()
      })
      .subscribe()

    polling = setInterval(() => {
      if (!isRealtimeActive.current && isAuthChecked && currentUser) fetchStats()
    }, 5000)

    // Listener perubahan route ke dashboard
    const handleRouteChange = (url: string) => {
      if (url === '/' && isAuthChecked && currentUser) fetchStats()
    }
    router.events?.on('routeChangeComplete', handleRouteChange)

    return () => {
      isUnmounted = true
      polling && clearInterval(polling)
      supabase.removeChannel(channel)
      router.events?.off('routeChangeComplete', handleRouteChange)
    }
  }, [isAuthChecked, currentUser, router.pathname])

  if (!isAuthChecked) return null
  if (!currentUser) return null

  const participation = stats.totalVoters > 0 ? ((stats.totalVoted / stats.totalVoters) * 100).toFixed(1) : '0.0'

  return (
    <>
      <div className="dashboard-container my-10 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg text-center transition-colors duration-300 px-4">
        <h1 className="dashboard-title text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Selamat Datang, {currentUser.name}!</h1>
        <div className="dashboard-role text-slate-500 dark:text-slate-300 mb-6">Role: {currentUser.role === 'user' ? 'Pemilih' : currentUser.role === 'admin' ? 'Petugas KPU' : currentUser.role}</div>
        {isLoading ? (
          <SkeletonDashboardStats />
        ) : (
          <div className="dashboard-stats flex flex-wrap gap-5 justify-center mb-8">
            <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
              <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Total Pemilih</div>
              <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalVoters}</div>
            </div>
            <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
              <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Total Kandidat</div>
              <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCandidates}</div>
            </div>
            <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
              <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Suara Masuk</div>
              <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalVoted}</div>
            </div>
            <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
              <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Partisipasi</div>
              <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{`${participation}% (${stats.totalVoted}/${stats.totalVoters})`}</div>
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
        )}
      </div>
    </>
  );
}

export default Dashboard
