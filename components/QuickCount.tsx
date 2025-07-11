import React, { useEffect } from 'react'
import { useVoting } from './VotingContext'
import { supabase } from '../lib/supabaseClient'

const QuickCount = () => {
  const { candidates, votes, setVotes, setCandidates } = useVoting()
  const totalVoters = 1000

  // Ambil quick count dari backend dan subscribe realtime
  useEffect(() => {
    const fetchQuickCount = async () => {
      try {
        const res = await fetch('/api/voting')
        const data = await res.json()
        if (res.ok && data.hasil) {
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
        }
      } catch (err) {
        // Biarkan silent error
      }
    }
    fetchQuickCount()
    // Subscribe ke perubahan tabel voting
    const channel = supabase.channel('realtime-voting')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voting' }, () => {
        fetchQuickCount()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line
  }, [])

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0)
  const participationRate = ((totalVotes / totalVoters) * 100).toFixed(1)
  const sortedCandidates = [...candidates].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0))

  return (
    <section id="quickcount" className="section active py-8 px-4">
      <div className="quickcount-container container mx-auto">
        <h2 className="section-title text-3xl font-bold text-center text-blue-700 dark:text-blue-300 mb-8">
          QUICK COUNT REAL-TIME
        </h2>
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
          {sortedCandidates.map((candidate) => {
            const candidateVotes = votes[candidate.id] || 0;
            const percentage = totalVotes > 0 ? ((candidateVotes / totalVotes) * 100).toFixed(1) : "0.0";
            return (
              <div key={candidate.id} className="result-item mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
                <div className="result-info flex justify-between items-center mb-2">
                  <div className="result-name text-lg font-medium text-gray-700 dark:text-gray-200">{candidate.name}</div>
                  <div className="result-percentage text-lg font-semibold text-blue-600 dark:text-blue-400">{percentage}%</div>
                </div>
                <div className="result-bar w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                  <div
                    className={`result-fill h-full rounded-full bg-${candidate.color}-500`} // Assuming theme colors are set up eg. bg-blue-500
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