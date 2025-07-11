import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useVoting } from "../../components/VotingContext";
import { useRouter } from "next/router";

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
      <section className="section active">
        <h1 className="section-title text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
          Daftar User
        </h1>
        {loading && <div className="text-gray-600 dark:text-gray-300">Loading...</div>}
        {error && <div className="text-red-500 dark:text-red-400">{error}</div>}
        {!loading && !error && (
          <ul className="user-list list-none p-0">
            {users.map((user) => (
              <li
                key={user.username}
                className="user-item py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <Link
                  href={`/users/${user.username}`}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150"
                >
                  {user.name}{" "}
                  <span className="user-role text-sm text-gray-500 dark:text-gray-400">
                    ({user.role})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default UsersPage;
