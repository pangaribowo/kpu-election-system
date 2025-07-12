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

  if (!isAuthChecked) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="loader" style={{width:48,height:48,border:'6px solid #eee',borderTop:'6px solid #888',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
      <style>{`@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
    </div>
  )
  if (currentUser) {
    // Sudah login, redirect ke dashboard
    router.replace('/')
    return null
  }

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