import QuickCount from '../components/QuickCount'
import { useVoting } from '../components/VotingContext'
import { useRouter } from 'next/router'
import React from 'react'
import { FiBarChart } from 'react-icons/fi'

const QuickCountPage = () => {
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

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-6 py-4">
      <h2 className="section-title text-3xl font-bold text-center text-blue-700 dark:text-blue-300 mb-8 flex items-center justify-center gap-2">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 mr-1">
          <FiBarChart className="text-blue-500 dark:text-blue-400" size={24} />
        </span>
        <span className="drop-shadow-sm">QUICK COUNT REALTIME</span>
      </h2>
      <div className="w-full">
        <QuickCount />
      </div>
    </div>
  )
}

export default QuickCountPage 