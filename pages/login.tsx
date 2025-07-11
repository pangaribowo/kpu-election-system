import LoginScreen from '../components/LoginForm'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import React from 'react'
import DarkModeToggle from '../components/DarkModeToggle'

export default function LoginPage() {
  const { currentUser, isAuthChecked } = useVoting()
  const router = useRouter()

  React.useEffect(() => {
    if (isAuthChecked && currentUser) {
      router.replace('/')
    }
  }, [currentUser, isAuthChecked, router])

  if (!isAuthChecked) return null
  if (currentUser) return null

  return (
    <div className="login-screen" style={{ minHeight: '100vh' }}>
      {/* Toggle dark mode fixed di pojok kanan atas */}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000 }}>
        <DarkModeToggle />
      </div>
      <LoginScreen />
    </div>
  )
} 