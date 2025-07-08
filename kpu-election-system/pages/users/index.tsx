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
    <div className="main-container">
      <section className="section active">
        <h1 className="section-title">Daftar User</h1>
        {loading && <div>Loading...</div>}
        {error && <div style={{color:'red'}}>{error}</div>}
        {!loading && !error && (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.username} className="user-item">
                <Link href={`/users/${user.username}`} legacyBehavior>{user.name} <span className="user-role">({user.role})</span></Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <style jsx>{`
        .main-container {
          max-width: 700px;
          margin: 40px auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          padding: 32px 24px;
        }
        .section-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 18px;
        }
        .user-list {
          list-style: none;
          padding: 0;
        }
        .user-item {
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .user-item:last-child {
          border-bottom: none;
        }
        .user-role {
          color: #64748b;
          font-size: 0.95em;
        }
        a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default UsersPage;
