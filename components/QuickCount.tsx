import React, { useEffect } from 'react'
import { useVoting } from './VotingContext'

const QuickCount = () => {
  const { candidates, votes, setVotes, setCandidates } = useVoting()
  const totalVoters = 1000

  // Simulasi suara masuk otomatis (20% chance setiap 5 detik)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.2 && candidates.length > 0) {
        const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)]
        const updatedVotes = { ...votes }
        updatedVotes[randomCandidate.id] = (updatedVotes[randomCandidate.id] || 0) + 1
        setVotes(updatedVotes)
        setCandidates(
          candidates.map((c) =>
            c.id === randomCandidate.id ? { ...c, votes: (updatedVotes[randomCandidate.id] || 0) } : c
          )
        )
      }
    }, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line
  }, [candidates, votes])

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