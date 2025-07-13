import React from 'react'
import Link from 'next/link'
import { FiBookOpen, FiDownload, FiTerminal, FiSettings, FiCloud, FiFolder, FiUsers, FiShield, FiArrowLeft } from 'react-icons/fi'

const DocumentationPage = () => {
  return (
    <div className="main-container mx-auto my-10 p-6 sm:p-8 max-w-2xl w-full bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl ring-1 ring-slate-200/60 dark:ring-gray-700/60 transition-all duration-300">
      <section className="section active rounded-2xl bg-transparent p-0 px-6 sm:px-10">
        <h1 className="section-title text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2 text-center justify-center"><FiBookOpen /> DOKUMENTASI TEKNIS</h1>
        <div className="mb-8 text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
          <b>Sistem Voting KPU</b> adalah aplikasi open source berbasis web untuk pemilihan umum, organisasi, atau internal. Halaman ini berisi panduan instalasi, konfigurasi, dan kontribusi.
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300 mb-2 flex items-center gap-2"><FiDownload /> Instalasi</h2>
          <ol className="list-decimal ml-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Pastikan <b>Node.js &gt;= 18</b> dan <b>npm</b> sudah terpasang.</li>
            <li>Clone repo: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">git clone https://github.com/pangaribowo/kpu-election-system.git</code></li>
            <li>Masuk folder: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">cd kpu-election-system</code></li>
            <li>Install depedensi: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">npm install</code></li>
          </ol>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2"><FiTerminal /> Menjalankan Lokal</h2>
          <ol className="list-decimal ml-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Copy file env: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">cp .env.example .env.local</code></li>
            <li>Edit <b>.env.local</b> sesuai konfigurasi Anda.</li>
            <li>Jalankan: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">npm run dev</code></li>
            <li>Buka <b>http://localhost:3000</b> di browser.</li>
          </ol>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2"><FiSettings /> Konfigurasi</h2>
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Atur variabel <b>ENV</b> di <b>.env.local</b>.</li>
            <li>Konfigurasi email (reset password) di dashboard server penyedia.</li>
            <li>Opsi: sesuaikan <b>tailwind.config.js</b> dan <b>styles/globals.css</b> untuk branding.</li>
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2"><FiCloud /> Deployment</h2>
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Deploy ke <b>layanan penyedia server</b>, atau server Node.js lain.</li>
            <li>Pastikan variabel environment sudah diatur di platform deployment.</li>
            <li>Ikuti petunjuk deploy Next.js di <a href="https://nextjs.org/docs/deployment" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">Next.js Docs</a>.</li>
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2"><FiFolder /> Struktur Folder</h2>
          <pre className="bg-slate-100 dark:bg-slate-800 rounded p-4 text-xs overflow-x-auto mb-2"><code>{`kpu-election-system/
  components/
  interfaces/
  lib/
  pages/
  rules/
  styles/
  utils/
  package.json
  README.md
  `}</code></pre>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-pink-600 dark:text-pink-400 mb-2 flex items-center gap-2"><FiUsers /> Kontribusi</h2>
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Fork repo, buat branch baru, lakukan perubahan, lalu pull request.</li>
            <li>Ikuti <b>DEVELOPMENT_GUIDE.md</b> untuk standar kontribusi.</li>
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2"><FiShield /> Lisensi</h2>
          <p className="text-gray-700 dark:text-gray-300">Proyek ini open source dengan lisensi MIT. Silakan gunakan, modifikasi, dan distribusikan sesuai kebutuhan.</p>
        </div>
        <div className="flex justify-center mt-8">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
            <FiArrowLeft size={20} className="-ml-1" />
            Kembali ke Dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}

export default DocumentationPage 