import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useVoting } from "../../components/VotingContext";
import { useRouter } from "next/router";

// Fungsi masking nama: F********* A*** P**********
function maskName(name: string) {
  if (!name) return '';
  return name.split(' ').map(kata => {
    if (kata.length === 0) return '';
    if (kata.length === 1) return kata;
    return kata[0] + '*'.repeat(kata.length - 1);
  }).join(' ');
}

const UsersPage = () => {
  const { currentUser, isAuthChecked } = useVoting();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace("/login");
      return;
    }
    if (!isAuthChecked) return;
    setLoading(true);
    fetch("/api/users", {
      headers: { "x-user-auth": currentUser?.username || "demo" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data user");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentUser, isAuthChecked, router]);

  if (!isAuthChecked) return null;
  if (!currentUser) return null;

  return (
    <div className="main-container mx-auto my-10 p-6 sm:p-8 max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <section className="section active rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300">
        <h1 className="section-title text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">Daftar User</h1>
        {loading && <div className="text-gray-600 dark:text-gray-300">Loading...</div>}
        {error && <div className="text-red-500 dark:text-red-400">{error}</div>}
        {!loading && !error && (
          <ul className="user-list list-none p-0">
            {users
              .filter(user => currentUser.role === 'admin' || user.role === 'user')
              .map((user) => {
                const isAdmin = currentUser.role === 'admin';
                const displayName = isAdmin ? user.name : maskName(user.name);
                const statusVote = user.hasVoted ? '(sudah vote)' : '(belum vote)';
                return (
                  <li
                    key={user.username}
                    className="user-item py-3 px-4 mb-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 rounded-xl shadow-sm flex items-center justify-between transition-all duration-200"
                  >
                    {isAdmin ? (
                      <Link
                        href={`/users/${user.username}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150"
                      >
                        {user.name}{' '}
                        <span className="user-role text-sm text-gray-500 dark:text-gray-400">
                          ({user.role})
                        </span>
                      </Link>
                    ) : (
                      <span className="text-gray-800 dark:text-gray-100">{displayName}</span>
                    )}
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{statusVote}</span>
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default UsersPage;
