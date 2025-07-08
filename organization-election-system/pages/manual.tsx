import ManualSection from '../components/ManualSection'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import React from 'react'

const ManualPage = () => {
  const { currentUser, isAuthChecked } = useVoting()
  const router = useRouter()

  React.useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace('/login')
    }
  }, [currentUser, isAuthChecked, router])

  if (!isAuthChecked) return null
  if (!currentUser) return null

  return <ManualSection />
}

export default ManualPage 