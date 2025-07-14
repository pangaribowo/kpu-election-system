import Link from "next/link";
import React from "react";
import { FiHome } from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";
import { useVoting } from '../components/VotingContext'
import { FiInfo } from 'react-icons/fi'

const AboutPage = () => {
  const { currentUser, isAuthChecked } = useVoting();
  return (
    <div className="main-container mx-auto my-10 p-6 sm:p-8 max-w-2xl w-full
      bg-white/90 dark:bg-gray-900/90
      rounded-3xl shadow-2xl
      ring-1 ring-slate-200/60 dark:ring-gray-700/60
      transition-all duration-300">
      <section className="section active rounded-2xl bg-transparent p-0 px-6 sm:px-10">
        <h1 className="section-title text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 flex items-center justify-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 mr-1">
            <FiInfo className="text-blue-500 dark:text-blue-400" size={24} />
          </span>
          <span className="drop-shadow-sm">TENTANG SISTEM VOTING KPU</span>
        </h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
          Website ini adalah platform <b>Sistem Voting Komisi Pemilihan Umum (KPU)</b> digital yang dirancang untuk mendukung proses pemilihan secara <b>aman, transparan, dan efisien</b>. Sistem ini dapat digunakan untuk berbagai jenis pemilihan, baik pemilihan umum, pemilihan ketua organisasi, maupun pemilihan internal lainnya. Dilengkapi fitur <b>voting online, quick count realtime, panel khusus admin, dan manual penggunaan</b> untuk memastikan pengalaman pemilihan yang modern dan terpercaya.
        </p>
        <div className="flex justify-center mt-6">
          {isAuthChecked && (
            (!currentUser || currentUser.role === 'guest') ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                <FiArrowLeft size={20} className="-ml-1" />
                Kembali ke Halaman Login
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                <FiHome size={20} className="-ml-1" />
                Kembali ke Dashboard
              </Link>
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
