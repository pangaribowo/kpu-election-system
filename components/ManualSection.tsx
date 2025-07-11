import React, { useState } from 'react'

const manualContent = {
  overview: (
    <div id="manual-overview" className="manual-section active">
      <h3>📋 Overview Sistem</h3>
      <p>Sistem Pemilihan Ketua Organisasi adalah aplikasi web yang dirancang untuk memfasilitasi proses pemilihan secara digital dengan fitur-fitur berikut:</p>
      <div className="feature-grid">
        <div className="feature-card">
          <h4>🗳️ Sistem Voting</h4>
          <p>Pemilihan kandidat yang aman dan mudah digunakan</p>
        </div>
        <div className="feature-card">
          <h4>📊 Quick Count</h4>
          <p>Perhitungan suara real-time dengan visualisasi grafik</p>
        </div>
        <div className="feature-card">
          <h4>👨‍💼 Panel Admin</h4>
          <p>Kelola kandidat, reset data, dan export hasil</p>
        </div>
        <div className="feature-card">
          <h4>🔐 Sistem Login</h4>
          <p>Autentikasi user dengan role Admin dan Pemilih</p>
        </div>
      </div>
      <h4>Keunggulan Sistem:</h4>
      <ul>
        <li>✅ Interface yang user-friendly dan responsif</li>
        <li>✅ Keamanan data dengan sistem login</li>
        <li>✅ Real-time counting dan reporting</li>
        <li>✅ Export hasil dalam format text</li>
        <li>✅ Dapat digunakan di desktop dan mobile</li>
      </ul>
    </div>
  ),
  login: (
    <div id="manual-login" className="manual-section active">
      <h3>🔐 Panduan Login</h3>
      <h4>Langkah-langkah Login:</h4>
      <ol>
        <li>Buka aplikasi di browser</li>
        <li>Masukkan username dan password</li>
        <li>Pilih role (Administrator atau Pemilih)</li>
        <li>Klik tombol "Login"</li>
      </ol>
      <h4>Akun Demo yang Tersedia:</h4>
      <div className="demo-accounts">
        <div className="account-card">
          <h5>👨‍💼 Administrator</h5>
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> admin123</p>
          <p><strong>Akses:</strong> Semua fitur termasuk panel admin</p>
        </div>
        <div className="account-card">
          <h5>👤 Pemilih</h5>
          <p><strong>Username:</strong> user</p>
          <p><strong>Password:</strong> user123</p>
          <p><strong>Akses:</strong> Voting dan Quick Count</p>
        </div>
      </div>
      <div className="warning-box">
        <h5>⚠️ Catatan Penting:</h5>
        <p>Pastikan memilih role yang sesuai saat login. Admin memiliki akses penuh, sedangkan Pemilih hanya dapat melakukan voting dan melihat hasil.</p>
      </div>
    </div>
  ),
  voting: (
    <div id="manual-voting" className="manual-section active">
      <h3>🗳️ Panduan Voting</h3>
      <h4>Cara Melakukan Voting:</h4>
      <ol>
        <li>Login sebagai Pemilih</li>
        <li>Pilih tab "VOTING"</li>
        <li>Baca profil dan visi setiap kandidat</li>
        <li>Klik tombol "PILIH" pada kandidat pilihan Anda</li>
        <li>Konfirmasi pilihan Anda</li>
        <li>Sistem akan menampilkan notifikasi berhasil</li>
      </ol>
      <h4>Informasi Kandidat:</h4>
      <p>Setiap kartu kandidat menampilkan:</p>
      <ul>
        <li>Nomor urut kandidat</li>
        <li>Nama lengkap kandidat</li>
        <li>Visi dan misi kandidat</li>
        <li>Tombol untuk memilih</li>
      </ul>
      <div className="info-box">
        <h5>ℹ️ Informasi Penting:</h5>
        <ul>
          <li>Setiap user hanya dapat memilih satu kali</li>
          <li>Pilihan tidak dapat diubah setelah dikonfirmasi</li>
          <li>Status voting akan ditampilkan di bagian bawah</li>
        </ul>
      </div>
    </div>
  ),
  quickcount: (
    <div id="manual-quickcount" className="manual-section active">
      <h3>📊 Panduan Quick Count</h3>
      <h4>Fitur Quick Count:</h4>
      <p>Quick Count menampilkan hasil pemilihan secara real-time dengan informasi:</p>
      <h5>Statistik Umum:</h5>
      <ul>
        <li><strong>Total Suara:</strong> Jumlah total suara yang masuk</li>
        <li><strong>Partisipasi:</strong> Persentase partisipasi pemilih</li>
      </ul>
      <h5>Grafik Hasil:</h5>
      <ul>
        <li>Nama kandidat dan jumlah suara</li>
        <li>Bar chart dengan persentase</li>
        <li>Urutan berdasarkan perolehan suara tertinggi</li>
      </ul>
      <h4>Cara Mengakses:</h4>
      <ol>
        <li>Login dengan akun Admin atau Pemilih</li>
        <li>Klik tab "QUICK COUNT"</li>
        <li>Data akan ter-update otomatis setiap 5 detik</li>
      </ol>
      <div className="tip-box">
        <h5>💡 Tips:</h5>
        <p>Halaman Quick Count akan refresh otomatis untuk menampilkan data terbaru. Anda juga dapat refresh manual dengan berganti tab.</p>
      </div>
    </div>
  ),
  admin: (
    <div id="manual-admin" className="manual-section active">
      <h3>👨‍💼 Panduan Admin</h3>
      <h4>Akses Panel Admin:</h4>
      <p>Panel Admin hanya dapat diakses oleh user dengan role Administrator.</p>
      <h4>Fitur-fitur Admin:</h4>
      <h5>1. Tambah Kandidat Baru</h5>
      <ul>
        <li>Isi nama kandidat</li>
        <li>Masukkan visi dan misi</li>
        <li>Pilih warna tema</li>
        <li>Klik "Tambah Kandidat"</li>
      </ul>
      <h5>2. Kelola Kandidat</h5>
      <ul>
        <li>Lihat daftar semua kandidat</li>
        <li>Hapus kandidat yang tidak diinginkan</li>
        <li>Edit informasi kandidat</li>
      </ul>
      <h5>3. Reset Semua Suara</h5>
      <ul>
        <li>Menghapus semua data voting</li>
        <li>Reset status pemilih</li>
        <li>Memulai pemilihan dari awal</li>
      </ul>
      <h5>4. Export Hasil</h5>
      <ul>
        <li>Download laporan dalam format text</li>
        <li>Berisi statistik lengkap</li>
        <li>Timestamp export</li>
      </ul>
      <div className="warning-box">
        <h5>⚠️ Peringatan:</h5>
        <p>Fitur Reset Semua Suara akan menghapus semua data voting secara permanen. Pastikan untuk export hasil terlebih dahulu jika diperlukan.</p>
      </div>
    </div>
  ),
  faq: (
    <div id="manual-faq" className="manual-section active">
      <h3>❓ Frequently Asked Questions</h3>
      <div className="faq-item">
        <h4>Q: Bagaimana jika lupa password?</h4>
        <p>A: Untuk demo ini, gunakan akun yang tersedia (admin/admin123 atau user/user123). Pada implementasi nyata, hubungi administrator sistem.</p>
      </div>
      <div className="faq-item">
        <h4>Q: Bisakah mengubah pilihan setelah voting?</h4>
        <p>A: Tidak, setiap user hanya dapat memilih satu kali dan tidak dapat mengubah pilihan.</p>
      </div>
      <div className="faq-item">
        <h4>Q: Apakah data aman?</h4>
        <p>A: Data disimpan secara lokal di browser. Untuk keamanan maksimal, gunakan HTTPS dan database server.</p>
      </div>
      <div className="faq-item">
        <h4>Q: Bagaimana cara menambah kandidat?</h4>
        <p>A: Login sebagai Admin, masuk ke panel Admin, dan gunakan form "Tambah Kandidat Baru".</p>
      </div>
      <div className="faq-item">
        <h4>Q: Apakah bisa digunakan di mobile?</h4>
        <p>A: Ya, sistem ini responsive dan dapat digunakan di smartphone dan tablet.</p>
      </div>
      <div className="faq-item">
        <h4>Q: Bagaimana cara export hasil?</h4>
        <p>A: Login sebagai Admin, masuk ke panel Admin, dan klik tombol "Export Hasil".</p>
      </div>
      <h4>🛠️ Troubleshooting</h4>
      <div className="troubleshooting">
        <h5>Masalah: Tidak bisa login</h5>
        <p><strong>Solusi:</strong> Pastikan username, password, dan role sudah benar. Coba refresh halaman.</p>
        <h5>Masalah: Data tidak tersimpan</h5>
        <p><strong>Solusi:</strong> Pastikan browser mendukung localStorage dan tidak dalam mode incognito.</p>
        <h5>Masalah: Quick Count tidak update</h5>
        <p><strong>Solusi:</strong> Refresh halaman atau ganti tab untuk memperbarui data.</p>
      </div>
      <div className="contact-box">
        <h5>📞 Butuh Bantuan?</h5>
        <p>Jika mengalami masalah teknis, hubungi administrator sistem atau tim IT organisasi Anda.</p>
      </div>
    </div>
  ),
}

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'login', label: 'Login' },
  { key: 'voting', label: 'Voting' },
  { key: 'quickcount', label: 'Quick Count' },
  { key: 'admin', label: 'Admin' },
  { key: 'faq', label: 'FAQ' },
]

const ManualSection = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // It's better to move manualContent and tabs outside if they don't depend on component's state/props
  // For brevity, keeping them here but applying dark mode classes directly.

  // Helper function to add dark mode classes to children of manualContent
  // This is a simplified example. A more robust solution might involve traversing the React elements
  // or ensuring all styled components within manualContent use Tailwind classes.
  const applyDarkModeToContent = (content: JSX.Element): JSX.Element => {
    // This is a placeholder for a more complex transformation if needed.
    // For now, we assume the content itself will use Tailwind dark: classes.
    // The main containers are handled below.
    return content;
  };

  return (
    <section id="manual" className="section active py-8 px-4">
      <div className="manual-container container mx-auto">
        <h2 className="section-title text-3xl font-bold text-center text-blue-700 dark:text-blue-300 mb-8">
          MANUAL PENGGUNAAN
        </h2>
        <div className="manual-content bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="manual-nav flex flex-wrap sm:flex-nowrap overflow-x-auto bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`manual-nav-btn px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-medium whitespace-nowrap transition-colors duration-150 focus:outline-none
                  ${
                    activeTab === tab.key
                      ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-blue-500 dark:hover:text-blue-300"
                  }`}
                data-manual={tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="manual-sections p-6 sm:p-8 text-gray-700 dark:text-gray-300">
            {/* Apply dark mode to typography within each section */}
            {/* This requires manualContent's JSX to use dark:text-gray-300 etc. or global styles for h3,p,li */}
            <div className="prose dark:prose-invert max-w-none">
                 {manualContent[activeTab as keyof typeof manualContent]}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ManualSection 