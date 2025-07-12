import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

// Tipe data kandidat, user, dsb
export type Candidate = {
  id: number
  name: string
  vision: string
  color: string
  votes: number
}

export type User = {
  username: string
  password: string
  role: 'admin' | 'user'
  name: string
}

export type CurrentUser = {
  id?: string // UUID user
  username: string
  role: 'admin' | 'user'
  name: string
  email?: string
  phone?: string
} | null

type VotingContextType = {
  candidates: Candidate[]
  setCandidates: (c: Candidate[]) => void
  votes: Record<number, number>
  setVotes: (v: Record<number, number>) => void
  users: Record<string, User>
  setUsers: (u: Record<string, User>) => void
  currentUser: CurrentUser
  setCurrentUser: (u: CurrentUser) => void
  hasVoted: boolean
  setHasVoted: (v: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  notification: { message: string; type: string } | null
  setNotification: (n: { message: string; type: string } | null) => void
  isAuthChecked: boolean
}

const defaultUsers: Record<string, User> = {
  admin: { password: 'admin123', role: 'admin', name: 'Petugas', username: 'admin' },
  user: { password: 'user123', role: 'user', name: 'Pemilih', username: 'user' },
}

const VotingContext = createContext<VotingContextType | undefined>(undefined)

export const VotingProvider = ({ children }: { children: ReactNode }) => {
  // State utama
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [votes, setVotes] = useState<Record<number, number>>({})
  const [users, setUsers] = useState<Record<string, User>>(defaultUsers)
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [activeTab, setActiveTab] = useState('voting')
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null)

  // Load default kandidat jika kosong
  useEffect(() => {
    if (candidates.length === 0) {
      setCandidates([
        {
          id: 1,
          name: 'Ahmad Rizki Pratama',
          vision:
            'Membangun organisasi yang inovatif dan berkelanjutan dengan fokus pada pengembangan SDM dan teknologi digital untuk mencapai visi organisasi yang lebih maju.',
          color: 'blue',
          votes: 0,
        },
        {
          id: 2,
          name: 'Sari Indah Permata',
          vision:
            'Menciptakan lingkungan kerja yang kolaboratif dan inklusif untuk mencapai visi bersama organisasi melalui program-program pemberdayaan anggota.',
          color: 'green',
          votes: 0,
        },
        {
          id: 3,
          name: 'Budi Santoso Wijaya',
          vision:
            'Mengoptimalkan potensi setiap anggota melalui program pelatihan dan pengembangan karir yang berkelanjutan serta meningkatkan kualitas pelayanan organisasi.',
          color: 'orange',
          votes: 0,
        },
      ])
    }
  }, [candidates.length])

  // Ambil currentUser dari localStorage saat mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
    setIsAuthChecked(true)
  }, [])

  // Simpan currentUser ke localStorage setiap kali berubah
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  // Ambil quick count dari backend saat user login
  useEffect(() => {
    async function fetchQuickCount() {
      if (currentUser && currentUser.role === 'user') {
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
    }
    fetchQuickCount()
    // Subscribe ke perubahan tabel voting (realtime)
    const channel = supabase.channel('realtime-voting-context')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voting' }, () => {
        fetchQuickCount()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line
  }, [currentUser])

  // Cek status voting user ke backend saat login
  useEffect(() => {
    async function fetchVotingStatus() {
      if (currentUser && currentUser.role === 'user') {
        try {
          const res = await fetch(`/api/voting?username=${encodeURIComponent(currentUser.username)}`)
          const data = await res.json()
          setHasVoted(!!data.hasVoted)
        } catch (err) {
          setHasVoted(false)
        }
      } else {
        setHasVoted(false)
      }
    }
    fetchVotingStatus()
    // eslint-disable-next-line
  }, [currentUser])

  return (
    <VotingContext.Provider
      value={{
        candidates,
        setCandidates,
        votes,
        setVotes,
        users,
        setUsers,
        currentUser,
        setCurrentUser,
        hasVoted,
        setHasVoted,
        activeTab,
        setActiveTab,
        notification,
        setNotification,
        isAuthChecked,
      }}
    >
      {children}
    </VotingContext.Provider>
  )
}

export const useVoting = () => {
  const ctx = useContext(VotingContext)
  if (!ctx) throw new Error('useVoting must be used within VotingProvider')
  return ctx
} 