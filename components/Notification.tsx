import React, { useEffect, useRef, useState } from 'react'
import { useVoting } from './VotingContext'

const iconMap: Record<string, string> = {
  success: '✔️',
  error: '❌',
  warning: '⚠️',
}

const Notification = () => {
  const { notification, setNotification } = useVoting()
  const [closing, setClosing] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => handleClose(), 7000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => setNotification(null), 300);
  };

  if (!notification) return null
  let bgClass = 'bg-blue-600/90 dark:bg-blue-700/90';
  if (notification.type === 'success') bgClass = 'bg-green-600/90 dark:bg-green-700/90';
  if (notification.type === 'error') bgClass = 'bg-red-600/90 dark:bg-red-700/90';
  if (notification.type === 'warning') bgClass = 'bg-yellow-400/90 dark:bg-yellow-600/90 text-gray-900 dark:text-yellow-100';
  try {
    return (
      <div
        ref={notifRef}
        className={`notification-fade-in ${bgClass} text-white fixed top-6 right-6 z-[60] min-w-[260px] rounded-lg shadow-lg flex items-center px-5 py-3 text-base gap-3 pointer-events-auto transition-all duration-300 ${closing ? 'opacity-0 translate-y-[-16px]' : 'opacity-100 translate-y-0'}`}
        style={{animation: 'notif-fade-in 0.3s'}}
      >
        <span style={{ fontSize: 22 }}>{iconMap[notification.type] || 'ℹ️'}</span>
        <span className="flex-1 break-words">{notification.message}</span>
        <button
          aria-label="Tutup Notifikasi"
          className="ml-2 text-lg font-bold text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60 rounded-full px-2 py-1"
          onClick={handleClose}
          tabIndex={0}
        >
          ×
        </button>
      </div>
    )
  } catch (err) {
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