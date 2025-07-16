// tailwindcss safelist: w-0 w-64 translate-x-0 -translate-x-full
import React, { useRef, useEffect, useState } from "react";
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

// Komponen AnimatedMarqueeText: teks berjalan jika overflow
function AnimatedMarqueeText({ children, className = "", speed = 60 }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);
  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current || !textRef.current) return;
      setIsOverflow(textRef.current.scrollWidth > containerRef.current.offsetWidth);
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [children]);
  return (
    <span
      ref={containerRef}
      className={`relative block w-full max-w-full overflow-hidden ${className}`}
      style={{ minHeight: 24 }}
    >
      <span
        ref={textRef}
        className={`inline-block whitespace-nowrap transition-all duration-300 ${isOverflow ? "marquee-animate" : ""}`}
        style={isOverflow ? {
          animation: `marquee ${speed * (textRef.current?.scrollWidth || 200) / 200}s linear infinite`,
        } : {}}
        tabIndex={isOverflow ? 0 : undefined}
        aria-label={typeof children === 'string' ? children : undefined}
      >
        {children}
      </span>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-animate {
          will-change: transform;
        }
      `}</style>
    </span>
  );
}

export default function Sidebar({ open, setOpen, isMobile, mode, isDark, toggleDarkMode }: SidebarProps) {
  const router = useRouter();
  const { setCurrentUser, currentUser, isAuthChecked } = useVoting();
  const sidebarRef = React.useRef<HTMLDivElement>(null);

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
    // Hapus router.push('/login') di sini
  };

  // Auto-redirect ke login jika context gagal
  React.useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace('/login');
    }
  }, [isAuthChecked, currentUser, router]);

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
        <div className="flex flex-col items-center justify-center p-6">
          <div className="loader" style={{width:48,height:48,border:'6px solid #eee',borderTop:'6px solid #888',borderRadius:'50%',animation:'spin 1s linear infinite', marginBottom: 16}} />
          <span className="text-gray-600 dark:text-gray-300 font-bold text-center">Mengarahkan ke halaman login...</span>
          <style>{`@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
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
        {/* Tombol close dan logout di kanan atas (z-50, paling atas) */}
        <div className="absolute right-4 top-4 flex gap-3 z-50 items-center">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tutup Sidebar"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-0 rounded-full bg-white/70 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-700 shadow-xl backdrop-blur-md hover:bg-blue-600/90 hover:text-white dark:hover:bg-blue-500/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-95"
            tabIndex={0}
            style={{ boxShadow: '0 4px 24px 0 rgba(59,130,246,0.10)' }}
          >
            <FiX size={24} className="m-0" />
          </button>
          {currentUser && (
            currentUser.role === 'guest' ? (
              <button
                type="button"
                onClick={() => setCurrentUser(null)}
                aria-label="Kembali ke Login"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-0 rounded-full bg-white/70 dark:bg-gray-900/60 border border-red-200 dark:border-red-700 shadow-xl backdrop-blur-md text-red-600 hover:bg-red-600/90 hover:text-white dark:hover:bg-red-500/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 active:scale-95"
                tabIndex={0}
                style={{ boxShadow: '0 4px 24px 0 rgba(239,68,68,0.10)' }}
              >
                <FiLogOut size={24} className="m-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Keluar"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-0 rounded-full bg-white/70 dark:bg-gray-900/60 border border-red-200 dark:border-red-700 shadow-xl backdrop-blur-md text-red-600 hover:bg-red-600/90 hover:text-white dark:hover:bg-red-500/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 active:scale-95"
          tabIndex={0}
                style={{ boxShadow: '0 4px 24px 0 rgba(239,68,68,0.10)' }}
        >
                <FiLogOut size={24} className="m-0" />
        </button>
            )
          )}
        </div>
        <div className="flex items-center gap-2 mt-8">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
            <FiCheckSquare className="text-blue-500 dark:text-blue-400" size={20} />
          </span>
          <AnimatedMarqueeText className="font-bold text-base text-blue-700 dark:text-blue-300 max-w-[120px]">
            Navigasi KPU
          </AnimatedMarqueeText>
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
                    <AnimatedMarqueeText className="transition-all duration-300 ml-1 text-base max-w-[120px]">
                      {item.label}
                    </AnimatedMarqueeText>
                  </Link>
                </li>
              ))}
            </>
          ) : (
            // Menu normal (user/admin)
            <>
              <li className="sidebar-item">
                <Link
                  href="/"
                  className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-blue-100/70 dark:hover:bg-blue-800/70 text-gray-700 dark:text-gray-200 ${router.pathname === '/' ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold" : ""}`}
                  onClick={() => isMobile && setOpen(false)}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8"><FiHome size={22} /></span>
                  <AnimatedMarqueeText className="transition-all duration-300 ml-1 text-base max-w-[120px]">Dashboard</AnimatedMarqueeText>
                </Link>
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
                    <AnimatedMarqueeText className="transition-all duration-300 ml-1 text-base max-w-[120px]">
                      {item.label}
                    </AnimatedMarqueeText>
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
                    <span className="inline-flex items-center justify-center w-8 h-8">
                      {/* Icon gavel (admin panel) */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 13L19 18"/><path d="M13 19L18 14"/><path d="M16 16L22 22"/><path d="M2 2L16 16"/><rect x="3" y="13" width="6" height="2" rx="1"/><rect x="9" y="7" width="6" height="2" rx="1"/><rect x="17" y="3" width="4" height="2" rx="1"/></svg>
                    </span>
                    <AnimatedMarqueeText className="transition-all duration-300 ml-1 text-base max-w-[120px]">Admin Panel</AnimatedMarqueeText>
                  </Link>
                </li>
              )}
              {/*
              <li className="sidebar-item">
                <Link
                  href="/documentation"
                  className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-blue-100/70 dark:hover:bg-blue-800/70 text-gray-700 dark:text-gray-200 ${router.pathname === '/documentation' ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold" : ""}`}
                  onClick={() => isMobile && setOpen(false)}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8"><FiFileText size={22} /></span>
                  <AnimatedMarqueeText className="transition-all duration-300 ml-1 text-base max-w-[120px]">Dokumentasi</AnimatedMarqueeText>
                </Link>
              </li>
              */}
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
                  <AnimatedMarqueeText className="transition-all duration-300 ml-1 text-base max-w-[120px]">Profil Saya</AnimatedMarqueeText>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      {/* Footer modern sticky */}
      {/* HAPUS tombol logout dari footer agar tidak duplikat */}
      {/* <div className="sidebar-footer shrink-0 p-4 bg-white dark:bg-gray-900">
        {currentUser?.role === 'guest' ? (
          <button
            type="button"
            onClick={() => {
              setCurrentUser(null);
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
      </div> */}
    </aside>
  );
}