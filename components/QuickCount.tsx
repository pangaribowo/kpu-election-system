import React, { useEffect, useState } from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'
import CountUp from 'react-countup'
import { getValidColor, getCandidateBg, getCandidateTextColor } from '../utils/colors';

const QuickCount = () => {
  const { candidates, votes, setVotes, setCandidates } = useVoting()
  const [totalVoters, setTotalVoters] = useState<number>(0)
  const [totalVoted, setTotalVoted] = useState<number>(0)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevStats = React.useRef({ totalVotes: 0, totalVoted: 0, totalVoters: 0, votes: {} })
  const isFirstLoad = React.useRef(true)
  const isRealtimeActive = React.useRef(false)

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null
    let isUnmounted = false
    const fetchQuickCount = async (isInitial = false) => {
      if (isInitial) setIsInitialLoading(true)
      else setIsUpdating(true)
      setError(null)
      try {
        const res = await fetch('/api/voting')
        const data = await res.json()
        if (res.ok && data.hasil && !isUnmounted) {
          const newVotes: Record<number, number> = {}
          const newCandidates = data.hasil.map((k: any) => {
            newVotes[k.id] = k.suara
            return {
              id: k.id,
              name: k.nama,
              vision: k.visi,
              color: candidates.find((c) => c.id === k.id)?.color || 'blue',
              votes: k.suara,
            }
          })
          setVotes(newVotes)
          setCandidates(newCandidates)
          setTotalVoters(data.totalVoters || 0)
          setTotalVoted(data.totalVoted || 0)
          prevStats.current = {
            totalVotes: Object.values(newVotes).reduce((sum, v) => sum + v, 0),
            totalVoted: data.totalVoted || 0,
            totalVoters: data.totalVoters || 0,
            votes: newVotes,
          }
        } else if (!res.ok) {
          setError(data.error || 'Gagal mengambil data quick count')
        }
      } catch (err) {
        setError('Gagal mengambil data quick count')
      } finally {
        if (!isUnmounted) {
          if (isInitial) setIsInitialLoading(false)
          else setIsUpdating(false)
        }
      }
    }
    fetchQuickCount(true)
    // Subscribe ke channel realtime
    const channel = supabase.channel('kpu-election')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voting' }, () => {
        isRealtimeActive.current = true;
        fetchQuickCount(false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        isRealtimeActive.current = true;
        fetchQuickCount(false)
      })
      .subscribe();
    // Polling fallback jika realtime tidak aktif
    pollingInterval = setInterval(() => {
      if (!isRealtimeActive.current) fetchQuickCount(false)
    }, 30000)
    return () => {
      isUnmounted = true
      pollingInterval && clearInterval(pollingInterval)
      supabase.removeChannel(channel)
    }
  }, [])

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0)
  const participationRate = totalVoters > 0 ? ((totalVoted / totalVoters) * 100).toFixed(1) : '0.0'
  const sortedCandidates = [...candidates].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0))

  // Algoritma Largest Remainder Method untuk persentase
  let percentages: { id: any, value: number, raw: number, remainder: number }[] = []
  if (totalVotes > 0) {
    let totalPercent = 0
    percentages = sortedCandidates.map((candidate) => {
      const candidateVotes = votes[candidate.id] || 0
      const raw = (candidateVotes / totalVotes) * 100
      const value = Math.floor(raw * 10) / 10 // bulatkan ke bawah 1 desimal
      const remainder = raw - value
      totalPercent += value
      return { id: candidate.id, value, raw, remainder }
    })
    // Sisa persen yang harus didistribusikan
    let sisa = +(100 - totalPercent).toFixed(1)
    // Urutkan kandidat berdasarkan sisa desimal terbesar (untuk tambah), terkecil (untuk kurang)
    if (sisa > 0) {
      percentages.sort((a, b) => b.remainder - a.remainder)
      for (let i = 0; sisa > 0.0001 && i < percentages.length; i++) {
        percentages[i].value += 0.1
        sisa = +(sisa - 0.1).toFixed(1)
      }
    } else if (sisa < 0) {
      percentages.sort((a, b) => a.remainder - b.remainder)
      for (let i = 0; sisa < -0.0001 && i < percentages.length; i++) {
        if (percentages[i].value >= 0.1) {
          percentages[i].value -= 0.1
          sisa = +(sisa + 0.1).toFixed(1)
        }
      }
    }
    // Kembalikan urutan ke kandidat semula
    percentages.sort((a, b) => sortedCandidates.findIndex(c => c.id === a.id) - sortedCandidates.findIndex(c => c.id === b.id))
  } else {
    percentages = sortedCandidates.map((candidate) => ({ id: candidate.id, value: 0, raw: 0, remainder: 0 }))
  }

  // Daftar warna yang didukung
  const SUPPORTED_COLORS = ['blue', 'green', 'orange', 'purple', 'red', 'indigo'] as const;
  type SupportedColor = typeof SUPPORTED_COLORS[number];
  function getValidColorClass(color: string | undefined): SupportedColor {
    return SUPPORTED_COLORS.includes((color || '').toLowerCase() as SupportedColor)
      ? (color || 'blue').toLowerCase() as SupportedColor
      : 'blue';
  }

  // Komponen skeleton loader untuk quick count
  const SkeletonQuickCount = () => (
    <div className="quickcount-container container mx-auto">
      <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {[1,2].map(i => (
          <div key={i} className="stat-card bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center">
            <div className="stat-number text-4xl font-bold mb-1">
              <div className="h-8 w-20 mx-auto bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="stat-label h-4 w-24 mx-auto bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="results-chart bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 overflow-x-auto w-full max-w-screen-sm mx-auto">
        <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">
          <div className="h-6 w-32 mx-auto bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
        </h3>
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="result-item mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow min-h-[72px] flex flex-col gap-2">
              <div className="result-name h-5 w-32 bg-slate-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
              <div className="result-bar w-full bg-slate-200 dark:bg-gray-700 rounded-full h-4 sm:h-5 shadow-inner overflow-hidden flex items-center">
                <div className="h-full rounded-full animate-pulse" style={{ width: `${30 + Math.random()*40}%`, background: '#60a5fa' }} />
              </div>
              <div className="result-votes h-4 w-16 bg-slate-200 dark:bg-gray-600 rounded animate-pulse mt-1 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <section id="quickcount" className="section active py-8 px-4">
      {isInitialLoading ? (
        <SkeletonQuickCount />
      ) : (
        <div className="quickcount-container container mx-auto">
          {error && (
            <div className="text-center text-red-500 mb-4">{error}</div>
          )}
          <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="stat-card bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center">
              <div className="stat-number text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1" id="total-votes">
                <CountUp
                  start={prevStats.current.totalVotes}
                  end={totalVotes}
                  duration={isUpdating ? 0.7 : 0.2}
                  separator="," />
              </div>
              <div className="stat-label text-gray-600 dark:text-gray-300">Total Suara</div>
            </div>
            <div className="stat-card bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center">
              <div className="stat-number text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1" id="participation-rate">
                <CountUp
                  start={prevStats.current.totalVoted && prevStats.current.totalVoters ? ((prevStats.current.totalVoted / prevStats.current.totalVoters) * 100) : 0}
                  end={parseFloat(participationRate)}
                  duration={isUpdating ? 0.7 : 0.2}
                  decimals={1}
                  suffix="%"
                />
              </div>
              <div className="stat-label text-gray-600 dark:text-gray-300">Partisipasi</div>
            </div>
          </div>
          <div id="results-chart" className="results-chart bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 overflow-x-auto w-full max-w-screen-sm mx-auto">
            <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">Hasil Sementara</h3>
            <div className="flex flex-col gap-3">
              {candidates.map((candidate, idx) => {
                const percentObj = percentages.find(p => p.id === candidate.id);
                let percentage = percentObj ? percentObj.value : 0;
                if (typeof percentage !== 'number' || isNaN(percentage)) percentage = 0;
                const percentStr = percentage.toFixed(1);
                const colorClass = getValidColor(candidate.color);
                const rowBg = getCandidateBg(candidate.color);
                const textColor = getCandidateTextColor(candidate.color);
                return (
                  <div key={candidate.id} className="result-item mb-4 p-4 rounded-lg shadow min-h-[72px] flex flex-col gap-2" style={{background: rowBg, color: textColor}}>
                    <div className="result-info flex flex-col xs:flex-row xs:justify-between xs:items-center mb-2 gap-1 xs:gap-0">
                      <div className="result-name text-lg font-medium truncate" style={{color: textColor}}>{candidate.name}</div>
                    </div>
                    <div
                      className="result-bar w-full min-w-[80px] bg-slate-200/80 dark:bg-gray-700/80 rounded-full h-4 sm:h-5 shadow-inner overflow-hidden flex items-center"
                      role="progressbar"
                      aria-valuenow={percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={`result-fill h-full rounded-full transition-all duration-700 ease-in-out flex items-center pl-2 bg-${colorClass}-500`}
                        style={{
                          width: `${percentStr}%`,
                          minWidth: percentage > 0 ? '8px' : '0px',
                          color: percentage > 20 ? '#fff' : textColor,
                          fontWeight: 600,
                          fontSize: '0.95rem',
                        }}
                      >
                        {percentage > 20 && (
                          <CountUp
                            start={prevStats.current.votes[candidate.id] || 0}
                            end={votes[candidate.id] || 0}
                            duration={isUpdating ? 0.7 : 0.2}
                            suffix={` suara (${percentStr}%)`}
                          />
                        )}
                      </div>
                      {percentage <= 20 && (
                        <span className="ml-2 font-semibold" style={{color: textColor}}>
                          <CountUp
                            start={prevStats.current.votes[candidate.id] || 0}
                            end={votes[candidate.id] || 0}
                            duration={isUpdating ? 0.7 : 0.2}
                          /> suara ({percentStr}% )
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default QuickCount 