import Link from "next/link";
import React from "react";

const AboutPage = () => {
  return (
    <div className="main-container mx-auto my-10 p-6 sm:p-8 max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <section className="section active">
        <h1 className="section-title text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
          Tentang Aplikasi
        </h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          Aplikasi ini digunakan untuk pemilihan ketua organisasi secara online,
          dilengkapi fitur voting, quick count, panel admin, dan manual
          penggunaan.
        </p>
        <p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150 underline"
          >
            Kembali ke Dashboard
          </Link>
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
