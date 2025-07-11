import React, { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const DarkModeToggle = () => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Cek preferensi dari localStorage
    const theme = localStorage.getItem('theme')
    const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDark = () => {
    const newDark = !dark
    setDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={toggleDark}
      className={`darkmode-toggle-btn${dark ? ' active' : ''}`}
      title="Ganti mode gelap/terang"
      type="button"
    >
      {dark ? <Sun size={22} /> : <Moon size={22} />}
    </button>
  )
}

export default DarkModeToggle 