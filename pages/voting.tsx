import VotingPanel from '../components/VotingPanel'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import React from 'react'

const VotingPage = () => {
  const { currentUser, isAuthChecked } = useVoting()
  const router = useRouter()

  React.useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace('/login')
    } else if (isAuthChecked && currentUser?.role === 'guest') {
      router.replace('/manual')
    }
  }, [currentUser, isAuthChecked, router])

  if (!isAuthChecked) return null
  if (!currentUser) return null
  if (currentUser.role === 'guest') return null

  return <VotingPanel />
}

export default VotingPage 