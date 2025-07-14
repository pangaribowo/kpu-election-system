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
    }
  }, [currentUser, isAuthChecked, router])

  if (!isAuthChecked) return null
  if (!currentUser) return null

  return (
    <div className="container mx-auto p-4">
      <h2 className="section-title text-3xl font-bold text-center text-blue-700 dark:text-blue-300 mb-8 flex items-center justify-center gap-2">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 mr-1">
          <FiBarChart className="text-blue-500 dark:text-blue-400" size={24} />
        </span>
        <span className="drop-shadow-sm">QUICK COUNT REALTIME</span>
      </h2>
      <QuickCount />
    </div>
  )
}

export default QuickCountPage 