// tailwindcss safelist: w-0 w-64 translate-x-0 -translate-x-full
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiHome, FiCheckSquare, FiBarChart, FiUsers, FiInfo, FiBookOpen, FiLogOut, FiX } from "react-icons/fi";
import { supabase } from '../lib/supabaseClient';
import { useVoting } from './VotingContext';
import { Moon, Sun } from 'lucide-react';

const menuItems = [
  { href: "/", label: "Dashboard" },
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
  const { setCurrentUser } = useVoting();
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Handler logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.clear();
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

  return (
    <aside
      ref={sidebarRef}
      className={sidebarClass + ' overflow-auto'}
      style={{ transitionProperty: 'width, box-shadow, background, transform', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15)' }}
    >
      {/* Tombol close di kanan atas (z-50, paling atas) */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Tutup Sidebar"
        className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-red-600/90 hover:bg-red-700/90 dark:bg-red-500/90 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 hover:scale-110 active:scale-95 min-w-[32px] min-h-[32px] text-white"
        tabIndex={0}
      >
        <FiX size={18} className="text-red-200" color="#ef4444" />
      </button>
      {/* Tombol dark mode di kiri atas (z-40, di bawah close) */}
      <button
        type="button"
        onClick={toggleDarkMode}
        aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
        title={isDark ? 'Mode Terang' : 'Mode Gelap'}
        className="absolute top-3 left-3 z-40 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow hover:scale-110 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 min-w-[32px] min-h-[32px]"
        style={{ lineHeight: 0 }}
      >
        {isDark
          ? <Sun size={18} className="text-yellow-400" color="#facc15" />
          : <Moon size={18} className="text-yellow-400" color="#facc15" />
        }
      </button>
      {/* Header modern */}
      <div className="sidebar-header flex flex-col items-center pt-16 pb-6 relative">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
            <FiCheckSquare className="text-blue-500 dark:text-blue-400" size={24} />
          </span>
          <span className="font-bold text-xl text-blue-700 dark:text-blue-300 transition-all duration-300 overflow-hidden whitespace-nowrap opacity-100 w-auto">
            Sistem Voting KPU
          </span>
        </div>
      </div>
      {/* Menu modern */}
      <nav className="sidebar-nav flex-1">
        <ul className="sidebar-menu flex flex-col gap-2 px-2">
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
        </ul>
      </nav>
      {/* Footer modern */}
      <div className="sidebar-footer mt-auto mb-6 flex flex-col items-center gap-3 px-2">
        <button
          type="button"
          onClick={handleLogout}
          className="group w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 text-red-600 dark:text-red-300 font-bold text-base shadow-sm transition-all duration-200 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800 dark:hover:to-red-700 hover:text-red-700 dark:hover:text-red-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 no-underline border-0"
          style={{ border: 'none', textDecoration: 'none' }}
        >
          <FiLogOut size={22} className="transition-transform duration-200 group-hover:-rotate-12 text-red-600 dark:text-red-300" color="#ef4444" />
          <span className="ml-1 no-underline !text-red-600 !dark:!text-red-300" style={{ textDecoration: 'none', color: '#dc2626' }}>Keluar</span>
        </button>
      </div>
    </aside>
  );
}