import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useVoting } from "../../components/VotingContext";
import { useRouter } from "next/router";
import { supabase } from '../../lib/supabaseClient'
import { FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight, FiSearch, FiX, FiChevronsLeft, FiChevronsRight, FiUsers } from 'react-icons/fi'

// Fungsi masking nama: F********* A*** P**********
function maskName(name: string) {
  if (!name) return '';
  return name.split(' ').map(kata => {
    if (kata.length === 0) return '';
    if (kata.length === 1) return kata;
    return kata[0] + '*'.repeat(kata.length - 1);
  }).join(' ');
}

const USERS_PER_PAGE = 15

const UsersPage = () => {
  const { currentUser, isAuthChecked } = useVoting();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<any[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace("/login");
      return;
    }
    if (!isAuthChecked) return;
    setLoading(true);
    const fetchUsers = () => {
      fetch(`/api/users?limit=${USERS_PER_PAGE}&offset=${(page - 1) * USERS_PER_PAGE}`, {
        headers: { "x-user-auth": currentUser?.username || "demo" },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Gagal mengambil data user");
          return res.json();
        })
        .then((data) => {
          console.log('API /api/users response:', data)
          setUsers(data.users);
          setTotalPages(Math.ceil(data.total / USERS_PER_PAGE));
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    };
    fetchUsers();
    // Subscribe ke channel realtime
    const channel = supabase.channel('kpu-election')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voting' }, fetchUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAuthChecked, currentUser, page])

  if (!isAuthChecked) return null;
  if (!currentUser) return null;

  // Handler search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const query = search.trim()
    if (!query) {
      setSearchResult(null)
      setSearchError(null)
      return
    }
    setSearchLoading(true)
    setSearchError(null)
    fetch(`/api/users?search=${encodeURIComponent(query)}`, {
      headers: {
        "x-user-auth": currentUser?.username || "demo",
        "x-user-role": currentUser?.role || "user"
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Gagal mencari user")
        return res.json()
      })
      .then(data => {
        setSearchResult(data.users)
        setSearchLoading(false)
      })
      .catch(err => {
        setSearchError(err.message)
        setSearchLoading(false)
      })
  }

  // Pagination bar
  const renderPagination = () => (
    <div className="flex justify-center items-center gap-2 mt-6 select-none">
      <button
        className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => setPage(1)}
        disabled={page === 1}
        aria-label="Halaman pertama"
      >
        <FiChevronsLeft size={18} />
      </button>
      <button
        className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        aria-label="Sebelumnya"
      >
        <FiChevronLeft size={18} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={`px-3 py-1 rounded-lg border text-sm font-semibold transition-all duration-150 mx-0.5
            ${page === i + 1
              ? 'bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900 border-blue-600 dark:border-blue-400 shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
          onClick={() => setPage(i + 1)}
          aria-label={`Halaman ${i + 1}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Berikutnya"
      >
        <FiChevronRight size={18} />
      </button>
      <button
        className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => setPage(totalPages)}
        disabled={page === totalPages}
        aria-label="Halaman terakhir"
      >
        <FiChevronsRight size={18} />
      </button>
    </div>
  )

  return (
    <div className="main-container mx-auto my-10 p-6 sm:p-8 max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <section className="section active rounded-2xl bg-white dark:bg-gray-800 shadow-none dark:shadow-lg transition-all duration-300">
        <h1 className="section-title text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center flex items-center justify-center gap-2">
          <FiUsers className="inline-block" size={28} />
          DAFTAR USER
        </h1>
        {/* Search bar modern */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6 max-w-md mx-auto">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              <FiSearch size={20} />
            </span>
            <input
              type="text"
              className="pl-10 pr-10 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all duration-200 w-full"
              placeholder="Cari nama lengkap user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
            {search.length > 0 && (
              <button
                type="button"
                aria-label="Bersihkan input pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900 dark:hover:text-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => { setSearch(''); setSearchResult(null); setSearchError(null); }}
                tabIndex={0}
              >
                <FiX size={18} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-95"
            style={{ minWidth: 48 }}
          >
            <FiSearch size={18} className="sm:hidden" />
            <span className="hidden sm:inline">Cari</span>
          </button>
        </form>
        {/* Hasil search */}
        {searchLoading ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 animate-pulse">Mencari user...</div>
        ) : searchResult !== null ? (
          searchResult.length > 0 ? (
            <ul className="user-list list-none p-0">
              {(currentUser.role === 'admin' ? searchResult : searchResult.filter(u => u.role === 'user')).map((user, idx) => {
                const statusVote = user.hasVoted ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold animate-pulse">
                    <FiCheckCircle className="text-green-500 dark:text-green-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" size={18} />
                    <span className="hidden sm:inline">Sudah Vote</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-semibold animate-pulse">
                    <FiXCircle className="text-red-500 dark:text-red-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" size={18} />
                    <span className="hidden sm:inline">Belum Vote</span>
                  </span>
                )
                const isAdmin = currentUser.role === 'admin';
                const displayName = isAdmin
                  ? (user.name || user.username)
                  : maskName(user.name || user.username);
                return (
                  <li key={user.id} className="user-item py-3 px-4 mb-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 rounded-xl shadow-sm flex items-center justify-between transition-all duration-200 group">
                    <span className="text-gray-800 dark:text-gray-100 font-medium truncate max-w-[60%]">{displayName}</span>
                    {statusVote}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              User tidak ditemukan.<br />
              <span className="text-xs text-gray-400 dark:text-gray-500 block mt-2">Pastikan Anda memasukkan <b>nama lengkap</b> dengan benar sesuai data yang terdaftar. Sistem hanya akan menampilkan user jika nama lengkap yang dimasukkan benar dan sesuai.</span>
            </div>
          )
        ) : (
          <>
            <ul className="user-list list-none p-0">
              {(currentUser.role === 'admin' ? users : users.filter(u => u.role === 'user')).map((user, idx) => {
                const statusVote = user.hasVoted ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold animate-pulse">
                    <FiCheckCircle className="text-green-500 dark:text-green-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" size={18} />
                    <span className="hidden sm:inline">Sudah Vote</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-semibold animate-pulse">
                    <FiXCircle className="text-red-500 dark:text-red-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" size={18} />
                    <span className="hidden sm:inline">Belum Vote</span>
                  </span>
                )
                // Masking nama jika bukan admin
                const isAdmin = currentUser.role === 'admin';
                const displayName = isAdmin
                  ? (user.name || user.username)
                  : maskName(user.name || user.username);
                return (
                  <li key={user.id} className="user-item py-3 px-4 mb-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 rounded-xl shadow-sm flex items-center justify-between transition-all duration-200 group">
                    <span className="text-gray-800 dark:text-gray-100 font-medium truncate max-w-[60%]">{displayName}</span>
                    {statusVote}
                  </li>
                )
              })}
            </ul>
            {renderPagination()}
          </>
        )}
      </section>
    </div>
  );
};

export default UsersPage;
