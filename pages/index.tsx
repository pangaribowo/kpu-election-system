import React, { useEffect, useState, useRef } from 'react'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../components/Header'
import { FiCheckCircle, FiAlertCircle, FiHome } from 'react-icons/fi'
import { supabase } from '../lib/supabaseClient';
import CountUp from 'react-countup'

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
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const prevStats = useRef(stats)
  const isFirstLoad = useRef(true)
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

    const fetchStats = async (isFirst = false) => {
      if (isFirst) {
        setIsInitialLoading(true)
        setIsUpdating(false)
      } else {
        setIsUpdating(true)
      }
      try {
        const data = await fetchVotingStats()
        if (!isUnmounted) {
          prevStats.current = stats
          setStats({
            totalVoters: data.totalVoters || 0,
            totalVoted: data.totalVoted || 0,
            totalCandidates: data.totalCandidates || 0,
          })
        }
      } catch {
        if (!isUnmounted) setStats({ totalVoters: 0, totalVoted: 0, totalCandidates: 0 })
      } finally {
        if (!isUnmounted) {
          if (isFirst) setIsInitialLoading(false)
          setIsUpdating(false)
        }
      }
    }

    // Hanya fetch jika sudah auth checked dan user ada
    if (isAuthChecked && currentUser) {
      fetchStats(true)
    }
    const channel = supabase.channel('kpu-election')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voting' }, () => {
        isRealtimeActive.current = true
        fetchStats(false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        isRealtimeActive.current = true
        fetchStats(false)
      })
      .subscribe()

    polling = setInterval(() => {
      if (!isRealtimeActive.current && isAuthChecked && currentUser) fetchStats(false)
    }, 5000)

    // Listener perubahan route ke dashboard
    const handleRouteChange = (url: string) => {
      if (url === '/' && isAuthChecked && currentUser) fetchStats(false)
    }
    router.events?.on('routeChangeComplete', handleRouteChange)

    return () => {
      isUnmounted = true
      polling && clearInterval(polling)
      supabase.removeChannel(channel)
      router.events?.off('routeChangeComplete', handleRouteChange)
    }
  }, [isAuthChecked, currentUser, router.pathname])

  if (!isAuthChecked) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="loader" style={{width:48,height:48,border:'6px solid #eee',borderTop:'6px solid #888',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
      <style>{`@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
    </div>
  )
  if (!currentUser) return null

  const participation = stats.totalVoters > 0 ? ((stats.totalVoted / stats.totalVoters) * 100).toFixed(1) : '0.0'

  return (
    <>
      <div className="dashboard-container my-10 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg text-center transition-colors duration-300 px-4">
        <h1 className="dashboard-title text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center justify-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 mr-1">
            <FiHome className="text-blue-500 dark:text-blue-400" size={24} />
          </span>
          <span className="drop-shadow-sm">DASHBOARD REALTIME</span>
        </h1>
        <div className="text-base md:text-lg font-semibold text-blue-500 dark:text-blue-300 mb-1">Selamat Datang, {currentUser.name}! <span role="img" aria-label="wave">👋</span></div>
        <div className="dashboard-role text-slate-500 dark:text-slate-300 mb-6">Role: {currentUser.role === 'user' ? 'Pemilih' : currentUser.role === 'admin' ? 'Petugas KPU' : currentUser.role}</div>
        {isInitialLoading ? (
          <SkeletonDashboardStats />
        ) : (
          <div className="dashboard-stats flex flex-wrap gap-5 justify-center mb-8">
            <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
              <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Total Pemilih</div>
              <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                <CountUp end={stats.totalVoters} start={prevStats.current.totalVoters} duration={0.7} separator="," />
              </div>
            </div>
            <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
              <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Total Kandidat</div>
              <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                <CountUp end={stats.totalCandidates} start={prevStats.current.totalCandidates} duration={0.7} separator="," />
              </div>
            </div>
            <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
              <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Suara Masuk</div>
              <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                <CountUp end={stats.totalVoted} start={prevStats.current.totalVoted} duration={0.7} separator="," />
              </div>
            </div>
            <div className="dashboard-stat bg-slate-100 dark:bg-gray-800 rounded-xl px-7 py-5 min-w-[120px] shadow transition-colors duration-300">
              <div className="stat-label text-slate-500 dark:text-slate-300 text-base mb-1">Partisipasi</div>
              <div className="stat-value text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                <CountUp end={Number(participation)} start={Number(((prevStats.current.totalVoted / (prevStats.current.totalVoters || 1)) * 100).toFixed(1))} duration={0.7} decimals={1} suffix={`% (${stats.totalVoted}/${stats.totalVoters})`} />
              </div>
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
