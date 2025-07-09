import AdminPanel from '../components/AdminPanel'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import React from 'react'

const AdminPage = () => {
  const { currentUser, isAuthChecked } = useVoting()
  const router = useRouter()

  React.useEffect(() => {
    if (isAuthChecked && (!currentUser || currentUser.role !== 'admin')) {
      router.replace('/')
    }
  }, [currentUser, isAuthChecked, router])

  if (!isAuthChecked) return null
  if (!currentUser || currentUser.role !== 'admin') return null

  return <AdminPanel />
}

export default AdminPage 