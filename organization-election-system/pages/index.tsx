import Header from '../components/Header'
import Navigation from '../components/Navigation'
import VotingPanel from '../components/VotingPanel'
import QuickCount from '../components/QuickCount'
import AdminPanel from '../components/AdminPanel'
import ManualSection from '../components/ManualSection'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import React from 'react'

const HomePage = () => {
  const { activeTab, currentUser, isAuthChecked } = useVoting()
  const router = useRouter()

  // Redirect ke /login jika sudah dicek dan belum login
  React.useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace('/login')
    }
  }, [currentUser, isAuthChecked, router])

  if (!isAuthChecked) return null // Atau tampilkan loading spinner
  if (!currentUser) return null

  return (
    <div id="main-app" className="container" style={{ display: 'block' }}>
      <section className="section active">
        <Header />
        <Navigation />
        {activeTab === 'voting' && <VotingPanel />}
        {activeTab === 'quickcount' && <QuickCount />}
        {activeTab === 'admin' && currentUser.role === 'admin' && <AdminPanel />}
        {activeTab === 'manual' && <ManualSection />}
      </section>
    </div>
  )
}

export default HomePage
