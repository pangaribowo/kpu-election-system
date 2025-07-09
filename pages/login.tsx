import LoginScreen from '../components/LoginForm'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import React from 'react'

const LoginPage = () => {
  const { currentUser, isAuthChecked } = useVoting()
  const router = useRouter()

  React.useEffect(() => {
    if (isAuthChecked && currentUser) {
      router.replace('/')
    }
  }, [currentUser, isAuthChecked, router])

  if (!isAuthChecked) return null
  if (currentUser) return null

  return <LoginScreen />
}

export default LoginPage 