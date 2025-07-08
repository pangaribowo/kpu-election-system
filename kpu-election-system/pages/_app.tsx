import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { VotingProvider } from '../components/VotingContext'
import Sidebar from '../components/Sidebar'
import { useRouter } from 'next/router'
import React from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isLoginPage = router.pathname === '/login'
  return (
    <VotingProvider>
      {!isLoginPage && <Sidebar />}
      <Component {...pageProps} />
    </VotingProvider>
  )
}

export default MyApp 