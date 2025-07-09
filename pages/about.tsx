import Link from "next/link";
import React from "react";

const AboutPage = () => {
  return (
    <div className="main-container">
      <section className="section active">
        <h1 className="section-title">Tentang Aplikasi</h1>
        <p style={{marginBottom: 16}}>
          Aplikasi ini digunakan untuk pemilihan ketua organisasi secara online, dilengkapi fitur voting, quick count, panel admin, dan manual penggunaan.
        </p>
    <p>
          <Link href="/" legacyBehavior>Kembali ke Dashboard</Link>
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
        a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
