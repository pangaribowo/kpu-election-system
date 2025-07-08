import React, { useState } from 'react'
import Link from 'next/link'
import { useVoting } from './VotingContext'
import { useRouter } from 'next/router'

const Sidebar: React.FC = () => {
  const { currentUser, setCurrentUser, setActiveTab } = useVoting()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    setCurrentUser(null)
    setActiveTab('voting')
    router.replace('/login')
  }

  const menu = [
    { href: '/', label: 'Dashboard' },
    { href: '/voting', label: 'Voting' },
    { href: '/quickcount', label: 'Quick Count' },
    { href: '/users', label: 'Users' },
    { href: '/about', label: 'About' },
    { href: '/manual', label: 'Manual' },
  ]

  return (
    <>
      {/* Hamburger SELALU tampil */}
      <button className="sidebar-hamburger" onClick={() => setOpen(!open)}>
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>
      {/* Overlay hanya di mobile */}
      {open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)} />
      )}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Tombol close */}
        <button className="sidebar-close" onClick={() => setOpen(false)}>&times;</button>
        <div className="sidebar-header">Sistem Pemilihan Organisasi</div>
        <nav className="sidebar-nav">
          {menu.map((item) => (
            <Link key={item.href} href={item.href} legacyBehavior>
              <a className={router.pathname === item.href ? 'active' : ''} onClick={() => setOpen(false)}>{item.label}</a>
            </Link>
          ))}
          {currentUser?.role === 'admin' && (
            <Link href="/admin" legacyBehavior>
              <a className={router.pathname === '/admin' ? 'active' : ''} onClick={() => setOpen(false)}>Admin</a>
            </Link>
          )}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-user">Selamat datang, {currentUser?.name}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 220px;
          height: 100vh;
          background: #fff;
          box-shadow: 2px 0 8px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform 0.25s cubic-bezier(.4,2,.6,1);
          transform: translateX(-100%);
        }
        .sidebar.open {
          transform: translateX(0);
        }
        .sidebar-header {
          font-weight: bold;
          font-size: 1.2rem;
          padding: 24px 16px 12px 16px;
          color: #2563eb;
        }
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0 16px;
        }
        .sidebar-nav a {
          padding: 10px 12px;
          border-radius: 6px;
          color: #1e293b;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.15s;
        }
        .sidebar-nav a.active, .sidebar-nav a:hover {
          background: #e0e7ff;
          color: #2563eb;
        }
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sidebar-user {
          font-size: 0.95rem;
          color: #64748b;
        }
        .btn-logout {
          background: #dc2626;
          color: #fff;
          border: none;
          padding: 8px 0;
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-logout:hover {
          background: #b91c1c;
        }
        .sidebar-hamburger {
          display: flex;
          position: fixed;
          top: 18px;
          left: 18px;
          z-index: 200;
          background: none;
          border: none;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
        }
        .hamburger-bar {
          width: 28px;
          height: 3px;
          background: #2563eb;
          border-radius: 2px;
        }
        .sidebar-close {
          display: block;
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 2rem;
          color: #2563eb;
          cursor: pointer;
          z-index: 110;
        }
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.25);
          z-index: 99;
          display: none;
        }
        @media (max-width: 900px) {
          .sidebar-overlay {
            display: block;
          }
        }
        @media (max-width: 600px) {
          .sidebar {
            width: 80vw;
            min-width: 180px;
          }
        }
      `}</style>
    </>
  )
}

export default Sidebar
