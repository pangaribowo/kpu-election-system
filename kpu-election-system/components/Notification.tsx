import React, { useEffect } from 'react'
import { useVoting } from './VotingContext'

const Notification = () => {
  const { notification, setNotification } = useVoting()

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification, setNotification])

  if (!notification) return null

  let bg = 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))'
  if (notification.type === 'success') bg = 'linear-gradient(45deg, var(--accent-success), #047857)'
  if (notification.type === 'error') bg = 'linear-gradient(45deg, var(--accent-danger), #b91c1c)'

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        padding: '15px 25px',
        borderRadius: 10,
        color: 'white',
        fontWeight: 'bold',
        zIndex: 1000,
        maxWidth: 300,
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        background: bg,
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      {notification.message}
    </div>
  )
}

export default Notification 