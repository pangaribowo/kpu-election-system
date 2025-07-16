import AdminPanel from '../components/AdminPanel'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import React from 'react'

const AdminPage = () => {
  const { currentUser, isAuthChecked } = useVoting()
  const router = useRouter()

  React.useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace('/login')
      return
    }
    if (isAuthChecked && currentUser?.role === 'guest') {
      router.replace('/manual')
      return
    }
    if (isAuthChecked && currentUser && currentUser.role !== 'admin') {
      router.replace('/')
    }
  }, [currentUser, isAuthChecked, router])

  if (!isAuthChecked) return null
  if (!currentUser) return null
  if (currentUser.role === 'guest') return null
  if (currentUser.role !== 'admin') return null

  return <AdminPanel />
}

export default AdminPage 