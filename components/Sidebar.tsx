// tailwindcss safelist: w-0 w-64 translate-x-0 -translate-x-full
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiHome, FiCheckSquare, FiBarChart, FiUsers, FiInfo, FiBookOpen, FiLogOut, FiX, FiUser, FiFileText } from "react-icons/fi";
import { supabase } from '../lib/supabaseClient';
import { useVoting } from './VotingContext';
import { Moon, Sun } from 'lucide-react';

const menuItems = [
  // { href: "/", label: "Dashboard" }, // Dihapus agar tidak duplikat
  { href: "/voting", label: "Voting" },
  { href: "/quickcount", label: "Quick Count" },
  { href: "/users", label: "Users" },
  { href: "/about", label: "About" },
  { href: "/manual", label: "Manual" },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  mode: 'drawer' | 'fixed';
  isDark: boolean;
  toggleDarkMode: () => void;
}

export default function Sidebar({ open, setOpen, isMobile, mode, isDark, toggleDarkMode }: SidebarProps) {
  const router = useRouter();
  const { setCurrentUser, currentUser, isAuthChecked } = useVoting();
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // DEBUG: log currentUser dan role
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[Sidebar] currentUser:', currentUser)
  }

  // Handler logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      // Hapus hanya data user/token, JANGAN hapus localStorage.clear()
      localStorage.removeItem('currentUser');
      localStorage.removeItem('users');
      localStorage.removeItem('votes');
      // Biarkan localStorage 'theme' tetap ada
      document.cookie = 'token=; Max-Age=0; path=/;';
    }
    setCurrentUser?.(null);
    router.push('/login');
  };

  // Mobile: klik di luar sidebar menutup
  React.useEffect(() => {
    if (!isMobile || !open) return;
    const handleClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMobile, open, setOpen]);

  // Tambahkan handler keyboard untuk close ESC
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Tombol close modern, proporsional, warna utama aplikasi
  const ToggleButton = () => (
    <button
      type="button"
      className={
        `p-1.5 rounded-full bg-blue-600/90 hover:bg-blue-700/90 dark:bg-blue-500/90
        shadow-md hover:shadow-lg
        transition-all duration-200
        flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        hover:scale-110 active:scale-95`
      }
      onClick={() => setOpen(false)}
      aria-label="Tutup Sidebar"
      tabIndex={0}
      style={{ minWidth: 32, minHeight: 32 }}
    >
      <FiX size={18} className="text-white" />
    </button>
  );

  // Logic class: sidebar off-canvas di mobile (pakai .open), fixed di desktop (pakai Tailwind)
  const sidebarClass = `sidebar${open ? ' open' : ''} md:translate-x-0 relative`;

  // Menu khusus guest
  const guestMenu = [
    { href: '/about', label: 'About', icon: <FiInfo size={22} /> },
    { href: '/manual', label: 'Manual', icon: <FiBookOpen size={22} /> },
    { href: '/documentation', label: 'Dokumentasi', icon: <FiFileText size={22} /> },
  ];

  // Loading/skeleton sidebar jika context belum siap
  if (!isAuthChecked) {
    return (
      <aside className="sidebar overflow-auto z-[300] bg-white dark:bg-gray-900 animate-pulse" style={{ minWidth: 220, minHeight: 400 }}>
        <div className="sidebar-header flex flex-col items-center pt-16 pb-6 relative bg-white dark:bg-gray-900">
          <div className="h-8 w-32 bg-slate-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <nav className="sidebar-nav flex-1 flex flex-col gap-2 mt-2">
          <ul className="sidebar-menu flex flex-col gap-2 px-2">
            {[1,2,3].map(i => (
              <li key={i} className="h-10 w-full bg-slate-100 dark:bg-gray-800 rounded-lg animate-pulse mb-2" />
            ))}
          </ul>
        </nav>
      </aside>
    )
  }

  if (isAuthChecked && !currentUser) {
    return (
      <aside className="sidebar overflow-auto z-[300] bg-white dark:bg-gray-900 flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-red-600 dark:text-red-300 font-bold text-center p-6">
          <span>Gagal memuat context user.<br />Silakan refresh halaman atau login ulang.</span>
        </div>
      </aside>
    )
  }

  return (
    <aside
      ref={sidebarRef}
      className={sidebarClass + ' flex flex-col h-screen min-h-0 overflow-hidden z-[300] bg-white dark:bg-gray-900'}
      style={{ transitionProperty: 'width, box-shadow, background, transform', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15)', zIndex: 300 }}
    >
      {/* Header modern */}
      <div className="sidebar-header flex flex-col items-center pt-16 pb-6 relative bg-white dark:bg-gray-900">
        {/* Tombol close di kanan atas (z-50, paling atas) */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tutup Sidebar"
          className="btn-close-modern"
          tabIndex={0}
        >
          <FiX size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
            <FiCheckSquare className="text-blue-500 dark:text-blue-400" size={20} />
          </span>
          <span className="font-bold text-base text-blue-700 dark:text-blue-300 transition-all duration-300 overflow-hidden whitespace-nowrap opacity-100 w-auto max-w-[120px] truncate">
            Navigasi KPU
          </span>
        </div>
        {/* Badge Guest Mode */}
        {currentUser?.role === 'guest' && (
          <span className="mt-2 px-3 py-1 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold tracking-wide shadow-sm">
            Guest Mode
          </span>
        )}
      </div>
      {/* Menu modern */}
      <nav className="sidebar-nav flex-1 overflow-y-auto flex flex-col gap-2 mt-2">
        <ul className="sidebar-menu flex flex-col gap-2 px-2">
          {currentUser?.role === 'guest' ? (
            // Menu khusus guest
            <>
              {guestMenu.map(item => (
                <li className="sidebar-item" key={item.href}>
                  <Link
                    href={item.href}
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                      ${router.pathname === item.href ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold" : "hover:bg-blue-100/70 dark:hover:bg-blue-800/70 text-gray-700 dark:text-gray-200"}
                    `}
                    onClick={() => isMobile && setOpen(false)}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8">{item.icon}</span>
                    <span className="transition-all duration-300 overflow-hidden whitespace-nowrap opacity-100 w-auto ml-1 text-base">{item.label}</span>
                  </Link>
                </li>
              ))}
            </>
          ) : (
            // Menu normal (user/admin)
            <>
              <li className="sidebar-item">
                <a
                  className="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-blue-100/70 dark:hover:bg-blue-800/70 text-gray-700 dark:text-gray-200"
                  href="/"
                  onClick={e => {
                    e.preventDefault()
                    if (router.pathname === '/') {
                      window.location.reload()
                    } else {
                      router.push('/')
                    }
                  }}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8"><FiHome size={22} /></span>
                  <span className="transition-all duration-300 overflow-hidden whitespace-nowrap opacity-100 w-auto ml-1 text-base">Dashboard</span>
                </a>
              </li>
              {menuItems.map((item) => (
                <li className="sidebar-item" key={item.href}>
                  <Link
                    href={item.href}
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                      ${router.pathname === item.href ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold" : "hover:bg-blue-100/70 dark:hover:bg-blue-800/70 text-gray-700 dark:text-gray-200"}
                    `}
                    onClick={() => isMobile && setOpen(false)}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8">
                      {item.label === "Dashboard" && <FiHome size={22} />}
                      {item.label === "Voting" && <FiCheckSquare size={22} />}
                      {item.label === "Quick Count" && <FiBarChart size={22} />}
                      {item.label === "Users" && <FiUsers size={22} />}
                      {item.label === "About" && <FiInfo size={22} />}
                      {item.label === "Manual" && <FiBookOpen size={22} />}
                    </span>
                    <span className="transition-all duration-300 overflow-hidden whitespace-nowrap opacity-100 w-auto ml-1 text-base">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
              {/* Menu Admin: hanya tampil jika role admin */}
              {currentUser?.role === 'admin' && (
                <li className="sidebar-item">
                  <Link
                    href="/admin"
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                      ${router.pathname === '/admin' ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold" : "hover:bg-blue-100/70 dark:hover:bg-blue-800/70 text-gray-700 dark:text-gray-200"}
                    `}
                    onClick={() => isMobile && setOpen(false)}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8"><FiUsers size={22} /></span>
                    <span className="transition-all duration-300 overflow-hidden whitespace-nowrap opacity-100 w-auto ml-1 text-base">Admin Panel</span>
                  </Link>
                </li>
              )}
              <li className="sidebar-item">
                <a className="sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-blue-100/70 dark:hover:bg-blue-800/70 text-gray-700 dark:text-gray-200" href="/documentation">
                  <span className="inline-flex items-center justify-center w-8 h-8"><FiFileText size={22} /></span>
                  <span className="transition-all duration-300 overflow-hidden whitespace-nowrap opacity-100 w-auto ml-1 text-base">Dokumentasi</span>
                </a>
              </li>
              <li className="sidebar-item">
                <Link
                  href="/profile"
                  className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                    ${router.pathname === '/profile' ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold" : "hover:bg-blue-100/70 dark:hover:bg-blue-800/70 text-gray-700 dark:text-gray-200"}
                  `}
                  onClick={() => isMobile && setOpen(false)}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8">
                    <FiUser size={22} />
                  </span>
                  <span className="transition-all duration-300 overflow-hidden whitespace-nowrap opacity-100 w-auto ml-1 text-base">
                    Profil Saya
                  </span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      {/* Footer modern sticky */}
      <div className="sidebar-footer shrink-0 p-4 bg-white dark:bg-gray-900">
        {currentUser?.role === 'guest' ? (
          <button
            type="button"
            onClick={() => {
              setCurrentUser(null);
              router.push('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white dark:bg-blue-500 dark:text-white font-semibold shadow-md border border-blue-600 dark:border-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-95 text-base"
          >
            <FiLogOut size={24} />
            <span>Kembali ke Login</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="btn-logout-modern"
          >
            <FiLogOut size={22} />
            <span>Keluar</span>
          </button>
        )}
      </div>
    </aside>
  );
}