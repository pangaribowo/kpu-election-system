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
      className={sidebarClass + ' overflow-auto z-[300] bg-white dark:bg-gray-900'}
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
      <div className="sidebar-footer mt-auto mb-6 flex flex-col items-center gap-3 px-2 bg-white dark:bg-gray-900">
        <button
          type="button"
          onClick={handleLogout}
          className="btn-logout-modern"
        >
          <FiLogOut size={22} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}