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
  role: 'admin' | 'user' | 'guest'
  name: string
}

export type CurrentUser = {
  id?: string // UUID user
  username: string
  role: 'admin' | 'user' | 'guest'
  name: string
  email?: string
  phone?: string
  phone_verified?: boolean // status verifikasi nomor HP
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
  fetchVotingStats: () => Promise<any>
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

  // Ambil kandidat dari backend untuk SEMUA role (user & admin)
  useEffect(() => {
    async function fetchCandidates() {
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
              color: k.color || 'blue',
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
    fetchCandidates()
    // Subscribe ke perubahan tabel kandidat & voting (realtime)
    const channel = supabase.channel('realtime-voting-context')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kandidat' }, () => {
        fetchCandidates()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voting' }, () => {
        fetchCandidates()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line
  }, [currentUser])

  // Ambil currentUser dari localStorage dan Supabase session saat mount
  useEffect(() => {
    async function initUser() {
      // 1. Cek localStorage
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        setCurrentUser(parsed)
        // Jika guest, JANGAN cek Supabase Auth
        if (parsed.role === 'guest') {
          setIsAuthChecked(true)
          return
        }
      }
      // 2. Cek Supabase session (hanya jika bukan guest)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Ambil data user dari Supabase dan set ke context
        const userMeta = user.user_metadata || {}
        // BEST PRACTICE 2025: username harus selalu email
        setCurrentUser({
          id: user.id,
          username: user.email, // username = email
          role: userMeta.role || 'user',
          name: userMeta.full_name || userMeta.name || '-',
          email: user.email,
          phone: user.phone || '-',
          phone_verified: !!user.phone_confirmed_at,
        })
      }
      setIsAuthChecked(true)
    }
    initUser()
  }, [])

  // Simpan currentUser ke localStorage setiap kali berubah
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
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

  // Utility function untuk fetch statistik voting
  const fetchVotingStats = async () => {
    const res = await fetch('/api/voting', { cache: 'no-store' })
    if (!res.ok) throw new Error('Gagal mengambil data voting')
    return await res.json()
  }

  useEffect(() => {
    // eslint-disable-next-line no-console
  }, [currentUser])
  useEffect(() => {
    // eslint-disable-next-line no-console
  }, [isAuthChecked])

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
        fetchVotingStats,
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