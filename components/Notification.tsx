import React, { useEffect } from 'react'
import { useVoting } from './VotingContext'

const iconMap: Record<string, string> = {
  success: '✔️',
  error: '❌',
  warning: '⚠️',
}

const Notification = () => {
  const { notification, setNotification } = useVoting()
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 7000)
      return () => clearTimeout(timer)
    }
  }, [notification, setNotification])
  if (!notification) return null
  let bgClass = 'bg-blue-600/90 dark:bg-blue-700/90';
  if (notification.type === 'success') bgClass = 'bg-green-600/90 dark:bg-green-700/90';
  if (notification.type === 'error') bgClass = 'bg-red-600/90 dark:bg-red-700/90';
  if (notification.type === 'warning') bgClass = 'bg-yellow-400/90 dark:bg-yellow-600/90 text-gray-900 dark:text-yellow-100';
  try {
    return (
      <div className={`notification-fade-in ${bgClass} text-white fixed top-6 right-6 z-[9999] min-w-[260px] rounded-lg shadow-lg flex items-center px-5 py-3 text-base gap-3`} style={{animation: 'notif-fade-in 0.3s'}}>
        <span style={{ fontSize: 22 }}>{iconMap[notification.type] || 'ℹ️'}</span>
        <span>{notification.message}</span>
      </div>
    )
  } catch (err) {
    // Jika error render (misal: node sudah tidak ada), jangan crash
    return null
  }
}

export default Notification

// Tambahkan CSS animasi (bisa di global.css):
/*
@keyframes notif-fade-in {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}
.notification-fade-in {
  animation: notif-fade-in 0.3s;
}
*/ 