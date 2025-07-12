import React, { useEffect, useState } from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'

const QuickCount = () => {
  const { candidates, votes, setVotes, setCandidates } = useVoting()
  const totalVoters = 1000
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null
    let isUnmounted = false

    const fetchQuickCount = async () => {
      setIsLoading(true)
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
        } else if (!res.ok) {
          setError(data.error || 'Gagal mengambil data quick count')
        }
      } catch (err) {
        setError('Gagal mengambil data quick count')
      } finally {
        if (!isUnmounted) setIsLoading(false)
      }
    }

    fetchQuickCount()
    pollingInterval = setInterval(fetchQuickCount, 5000)

    return () => {
      isUnmounted = true
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [])

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0)
  const participationRate = ((totalVotes / totalVoters) * 100).toFixed(1)
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

  return (
    <section id="quickcount" className="section active py-8 px-4">
      <div className="quickcount-container container mx-auto">
        <h2 className="section-title text-3xl font-bold text-center text-blue-700 dark:text-blue-300 mb-8">
          QUICK COUNT REALTIME
        </h2>
        {isLoading && (
          <div className="text-center text-gray-500 dark:text-gray-300 mb-4">Memuat data quick count...</div>
        )}
        {error && (
          <div className="text-center text-red-500 mb-4">{error}</div>
        )}
        <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="stat-card bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center">
            <div className="stat-number text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1" id="total-votes">
              {totalVotes.toLocaleString()}
            </div>
            <div className="stat-label text-gray-600 dark:text-gray-300">Total Suara</div>
          </div>
          <div className="stat-card bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center">
            <div className="stat-number text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1" id="participation-rate">
              {participationRate}%
            </div>
            <div className="stat-label text-gray-600 dark:text-gray-300">Partisipasi</div>
          </div>
        </div>
        <div id="results-chart" className="results-chart bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">Hasil Sementara</h3>
          {sortedCandidates.map((candidate, idx) => {
            const candidateVotes = votes[candidate.id] || 0;
            const percentObj = percentages.find(p => p.id === candidate.id)
            const percentage = percentObj ? percentObj.value.toFixed(1) : "0.0";
            return (
              <div key={candidate.id} className="result-item mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
                <div className="result-info flex justify-between items-center mb-2">
                  <div className="result-name text-lg font-medium text-gray-700 dark:text-gray-200">{candidate.name}</div>
                  <div className="result-percentage text-lg font-semibold text-blue-600 dark:text-blue-400">{percentage}%</div>
                </div>
                <div className="result-bar w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                  <div
                    className={`result-fill h-full rounded-full bg-${candidate.color}-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="result-votes text-sm text-gray-500 dark:text-gray-400 mt-1 text-right">
                  {candidateVotes.toLocaleString()} suara
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default QuickCount 