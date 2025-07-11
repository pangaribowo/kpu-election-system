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
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification, setNotification])
  if (!notification) return null
  let bg = 'linear-gradient(45deg, var(--accent), #2563eb)'
  if (notification.type === 'success') bg = 'linear-gradient(45deg, var(--accent-success), #047857)'
  if (notification.type === 'error') bg = 'linear-gradient(45deg, var(--accent-danger), #b91c1c)'
  if (notification.type === 'warning') bg = 'linear-gradient(45deg, #fbbf24, #b45309)'
  // Animasi fade/slide
  return (
    <div className="notification-fade-in" style={{ background: bg, color: '#fff', position: 'fixed', top: 24, right: 24, zIndex: 9999, minWidth: 260, borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', padding: '12px 20px', fontSize: 16, gap: 12, animation: 'notif-fade-in 0.3s' }}>
      <span style={{ fontSize: 22 }}>{iconMap[notification.type] || 'ℹ️'}</span>
      <span>{notification.message}</span>
    </div>
  )
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