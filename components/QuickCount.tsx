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
    <section id="quickcount" className="section active">
      <div className="quickcount-container">
        <h2 className="section-title">QUICK COUNT REAL-TIME</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number" id="total-votes">{totalVotes.toLocaleString()}</div>
            <div className="stat-label">Total Suara</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" id="participation-rate">{participationRate}%</div>
            <div className="stat-label">Partisipasi</div>
          </div>
        </div>
        <div id="results-chart" className="results-chart">
          <h3>Hasil Sementara</h3>
          {sortedCandidates.map((candidate) => {
            const candidateVotes = votes[candidate.id] || 0
            const percentage = totalVotes > 0 ? ((candidateVotes / totalVotes) * 100).toFixed(1) : 0
            return (
              <div key={candidate.id} className="result-item">
                <div className="result-info">
                  <div className="result-name">{candidate.name}</div>
                  <div className="result-votes">{candidateVotes.toLocaleString()} suara</div>
                </div>
                <div className="result-bar">
                  <div className={`result-fill bg-${candidate.color}`} style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="result-percentage">{percentage}%</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default QuickCount 