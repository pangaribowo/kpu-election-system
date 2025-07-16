import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useVoting } from "../../components/VotingContext";
import { useRouter } from "next/router";
import { supabase } from '../../lib/supabaseClient'
import { FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight, FiSearch, FiX, FiChevronsLeft, FiChevronsRight, FiUsers, FiChevronDown, FiChevronUp, FiArrowDown, FiArrowUp, FiClock } from 'react-icons/fi'

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
  const [voteFilter, setVoteFilter] = useState<'all' | 'voted' | 'notvoted'>('all')
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'register-newest' | 'register-oldest'>('name-asc');

  // Filter user sesuai voteFilter (pindahkan ke atas sebelum filteredUsers)
  const filterUsers = (list: any[]) => {
    if (voteFilter === 'voted') return list.filter(u => u.hasVoted)
    if (voteFilter === 'notvoted') return list.filter(u => !u.hasVoted)
    return list
  }

  // Variabel hasil filter+sort (tanpa slice)
  const filteredUsers = React.useMemo(() => {
    let filtered = filterUsers(users);
    if (searchResult !== null || voteFilter !== 'all') {
      if (sortBy === 'name-asc') filtered = filtered.sort((a, b) => (a.name || a.username).localeCompare(b.name || b.username));
      if (sortBy === 'name-desc') filtered = filtered.sort((a, b) => (b.name || b.username).localeCompare(a.name || a.username));
      if (sortBy === 'register-newest') filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      if (sortBy === 'register-oldest') filtered = filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    console.log('filteredUsers:', filtered.length, filtered);
    return filtered;
  }, [users, voteFilter, sortBy, searchResult]);

  // Hitung totalPages dari filteredUsers
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
    setTotalPages(newTotalPages);
    if (page > newTotalPages) setPage(newTotalPages);
  }, [filteredUsers, page]);

  // Reset page ke 1 setiap kali filter vote atau search berubah
  useEffect(() => {
    setPage(1)
  }, [voteFilter, search])

  // Ambil semua user jika filter vote bukan 'all', agar filter + pagination bisa dihandle di frontend
  useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace('/login');
      return;
    }
    if (isAuthChecked && currentUser?.role === 'guest') {
      router.replace('/manual');
      return;
    }
    if (!isAuthChecked) return;
    setLoading(true);
    let sort = 'name';
    let direction = 'asc';
    if (sortBy === 'name-asc') { sort = 'name'; direction = 'asc'; }
    if (sortBy === 'name-desc') { sort = 'name'; direction = 'desc'; }
    if (sortBy === 'register-newest') { sort = 'created_at'; direction = 'desc'; }
    if (sortBy === 'register-oldest') { sort = 'created_at'; direction = 'asc'; }
    // Jika filter vote bukan 'all', ambil semua user (tanpa limit/offset)
    const url = voteFilter === 'all'
      ? `/api/users?limit=${USERS_PER_PAGE}&offset=${(page - 1) * USERS_PER_PAGE}&sort=${sort}&direction=${direction}&voteFilter=all`
      : `/api/users?sort=${sort}&direction=${direction}&voteFilter=${voteFilter}`;
    const fetchUsers = () => {
      fetch(url, {
        headers: { "x-user-auth": currentUser?.username || "demo" },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Gagal mengambil data user");
          return res.json();
        })
        .then((data) => {
          setUsers(data.users);
          setLoading(false);
          console.log('Jumlah user dari backend:', data.users.length, 'voteFilter:', voteFilter);
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
  }, [isAuthChecked, currentUser, page, sortBy, voteFilter])

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

  // Gabungkan filter, sort, dan pagination
  const processUsers = (list: any[]) => {
    let filtered = filterUsers(list);
    // Sort hanya untuk hasil search atau filter, karena data utama sudah diurutkan backend
    if (searchResult !== null || voteFilter !== 'all') {
      if (sortBy === 'name-asc') filtered = filtered.sort((a, b) => (a.name || a.username).localeCompare(b.name || b.username));
      if (sortBy === 'name-desc') filtered = filtered.sort((a, b) => (b.name || b.username).localeCompare(a.name || a.username));
      if (sortBy === 'register-newest') filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      if (sortBy === 'register-oldest') filtered = filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    // Pagination manual jika filter vote bukan 'all'
    if (voteFilter !== 'all') {
      const start = (page - 1) * USERS_PER_PAGE;
      const end = start + USERS_PER_PAGE;
      return filtered.slice(start, end);
    }
    return filtered;
  }

  // Saat render list user, lakukan slice sesuai page
  const pagedUsers = filteredUsers.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  // Setelah semua hook, baru pengecekan dan return null jika perlu
  if (!isAuthChecked) return null;
  if (!currentUser) return null;
  if (currentUser.role === 'guest') return null;

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
        {/* Filter vote & Dropdown sort modern dalam satu baris */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 w-full max-w-2xl mx-auto px-2">
          <div className="flex flex-1 justify-center sm:justify-start gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
              div[style]::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          <button
            type="button"
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
              ${voteFilter === 'all'
                ? 'bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900 border-blue-600 dark:border-blue-400 shadow-lg scale-105'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
            onClick={() => setVoteFilter('all')}
          >
            Semua
          </button>
          <button
            type="button"
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
              ${voteFilter === 'voted'
                ? 'bg-green-600 dark:bg-green-400 text-white dark:text-gray-900 border-green-600 dark:border-green-400 shadow-lg scale-105'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900'}`}
            onClick={() => setVoteFilter('voted')}
          >
            Sudah Vote
          </button>
          <button
            type="button"
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
              ${voteFilter === 'notvoted'
                ? 'bg-red-600 dark:bg-red-400 text-white dark:text-gray-900 border-red-600 dark:border-red-400 shadow-lg scale-105'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900'}`}
            onClick={() => setVoteFilter('notvoted')}
          >
            Belum Vote
          </button>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-end mt-1 sm:mt-0">
            <label className="mr-2 text-sm font-medium text-gray-600 dark:text-gray-300">Urutkan:</label>
            <select
              className="rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all duration-200"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              aria-label="Urutkan user"
            >
              <option value="name-asc">Nama A-Z</option>
              <option value="name-desc">Nama Z-A</option>
              <option value="register-newest">Register Terbaru</option>
              <option value="register-oldest">Register Terlama</option>
            </select>
          </div>
        </div>
        {/* Hasil search */}
        {searchLoading ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 animate-pulse">Mencari user...</div>
        ) : searchResult !== null ? (
          searchResult.length > 0 ? (
            <>
            <ul className="user-list list-none p-0">
                {(currentUser.role === 'admin' ? pagedUsers : pagedUsers.filter(u => u.role === 'user')).map((user, idx) => {
                const statusVote = user.role === 'admin' ? (
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-900 px-3 py-1 rounded-full text-xs shadow-sm">
                    <FiUsers className="text-blue-500 dark:text-blue-300" size={16} />
                    <span className="hidden sm:inline">Admin</span>
                  </span>
                ) : user.hasVoted ? (
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
              {totalPages >= 1 && renderPagination()}
            </>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              User tidak ditemukan.<br />
              <span className="text-xs text-gray-400 dark:text-gray-500 block mt-2">Pastikan Anda memasukkan <b>nama lengkap</b> dengan benar sesuai data yang terdaftar. Sistem hanya akan menampilkan user jika nama lengkap yang dimasukkan benar dan sesuai.</span>
            </div>
          )
        ) : (
          <>
            <ul className="user-list list-none p-0">
              {(currentUser.role === 'admin' ? pagedUsers : pagedUsers.filter(u => u.role === 'user')).map((user, idx) => {
                const statusVote = user.role === 'admin' ? (
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-900 px-3 py-1 rounded-full text-xs shadow-sm">
                    <FiUsers className="text-blue-500 dark:text-blue-300" size={16} />
                    <span className="hidden sm:inline">Admin</span>
                  </span>
                ) : user.hasVoted ? (
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
            {totalPages >= 1 && renderPagination()}
          </>
        )}
      </section>
    </div>
  );
};

export default UsersPage;
