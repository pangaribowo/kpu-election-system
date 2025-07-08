import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useVoting } from "../../components/VotingContext";

const UserDetailPage = () => {
  const { currentUser, isAuthChecked } = useVoting();
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace("/login");
      return;
    }
    if (!isAuthChecked || !id) return;
    setLoading(true);
    fetch("/api/users", {
      headers: { "x-user-auth": currentUser?.username || "demo" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data user");
        return res.json();
      })
      .then((data) => {
        const found = data.find((u: any) => u.username === id);
        if (!found) throw new Error("User tidak ditemukan");
        setUser(found);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentUser, isAuthChecked, id, router]);

  if (!isAuthChecked) return null;
  if (!currentUser) return null;

    return (
    <div className="main-container">
      <section className="section active">
        <h1 className="section-title">Detail User</h1>
        {loading && <div>Loading...</div>}
        {error && <div style={{color:'red'}}>{error}</div>}
        {!loading && !error && user && (
          <div className="user-detail">
            <div><b>Username:</b> {user.username}</div>
            <div><b>Nama:</b> {user.name}</div>
            <div><b>Role:</b> {user.role}</div>
          </div>
        )}
        <p style={{marginTop:24}}>
          <Link href="/users">Kembali ke Daftar User</Link>
        </p>
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
        .user-detail {
          font-size: 1.1rem;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 18px 20px;
          margin-bottom: 16px;
        }
        a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default UserDetailPage;
