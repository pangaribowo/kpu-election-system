import * as React from 'react'
import { FiChevronDown } from 'react-icons/fi'

const manualContent = {
  overview: (
    <div id="manual-overview" className="manual-section active">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2"><span>📋</span> Overview Sistem</h3>
        <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          <b>Sistem Voting Komisi Pemilihan Umum (KPU)</b> adalah aplikasi web modern yang dirancang untuk mendukung proses pemilihan secara <b>aman, transparan, dan efisien</b>. Sistem ini dapat digunakan untuk berbagai kebutuhan pemilihan, baik pemilihan umum, organisasi, maupun internal institusi. Dengan fitur <b>voting online, quick count realtime, panel admin, dan dokumentasi manual</b>, platform ini memastikan pengalaman pemilihan yang profesional dan terpercaya.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="feature-card flex items-start gap-3 bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <span className="text-2xl">🗳️</span>
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Sistem Voting</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Proses pemilihan kandidat yang aman, transparan, dan mudah digunakan.</p>
            </div>
          </div>
          <div className="feature-card flex items-start gap-3 bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <span className="text-2xl">📊</span>
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Quick Count</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Perhitungan suara real-time dengan visualisasi grafik interaktif.</p>
            </div>
          </div>
          <div className="feature-card flex items-start gap-3 bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <span className="text-2xl">👨‍💼</span>
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Panel Admin</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Kelola kandidat, reset data, dan ekspor hasil pemilihan secara terpusat.</p>
            </div>
          </div>
          <div className="feature-card flex items-start gap-3 bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <span className="text-2xl">🔐</span>
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Sistem Login</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Autentikasi pengguna dengan peran Admin dan Pemilih untuk keamanan data.</p>
            </div>
          </div>
        </div>
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Keunggulan Sistem:</h4>
        <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
          <li>✅ Antarmuka modern, responsif, dan ramah pengguna</li>
          <li>✅ Keamanan data dengan autentikasi dan otorisasi</li>
          <li>✅ Perhitungan suara real-time dan pelaporan instan</li>
          <li>✅ Ekspor hasil pemilihan dalam format teks</li>
          <li>✅ Dukungan multi-perangkat: desktop & mobile</li>
        </ul>
      </div>
    </div>
  ),
  login: (
    <div id="manual-login" className="manual-section active">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2"><span>🔐</span> Panduan Login</h3>
        <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Langkah-langkah Login:</h4>
        <ol className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-1 text-sm">
          <li>Buka aplikasi melalui browser perangkat Anda.</li>
          <li>Masukkan username dan password yang telah dibuat.</li>
          <li>Pilih peran sesuai hak akses (Admin atau Pemilih).</li>
          <li>Klik tombol <b>Login</b> untuk masuk ke sistem.</li>
        </ol>
        <div className="info-box bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-3">
          <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-2"><span>ℹ️</span> Informasi:</h5>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Setiap pengguna memiliki hak akses berbeda sesuai peran. Admin dapat mengelola sistem, sedangkan Pemilih hanya dapat melakukan voting dan melihat hasil.</p>
        </div>
        <div className="warning-box bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 border-l-4 border-yellow-400 dark:border-yellow-600">
          <h5 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1 flex items-center gap-2"><span>⚠️</span> Catatan Penting:</h5>
          <p className="text-gray-700 dark:text-gray-200 text-sm">Pastikan menjaga kerahasiaan akun Anda. Jika mengalami kendala login, silakan hubungi administrator sistem.</p>
        </div>
      </div>
    </div>
  ),
  voting: (
    <div id="manual-voting" className="manual-section active">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2"><span>🗳️</span> Panduan Voting</h3>
        <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Cara Melakukan Voting:</h4>
        <ol className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-1 text-sm">
          <li>Login sebagai Pemilih.</li>
          <li>Pilih tab <b>VOTING</b> pada menu utama.</li>
          <li>Baca profil dan visi-misi setiap kandidat.</li>
          <li>Klik tombol <b>PILIH</b> pada kandidat pilihan Anda.</li>
          <li>Konfirmasi pilihan Anda pada dialog yang muncul.</li>
          <li>Sistem akan menampilkan notifikasi keberhasilan voting.</li>
        </ol>
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Informasi Kandidat:</h4>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-1 text-sm">
          <li>Nomor urut kandidat</li>
          <li>Nama lengkap kandidat</li>
          <li>Visi dan misi kandidat</li>
          <li>Tombol untuk memilih</li>
        </ul>
        <div className="info-box bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
          <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-2"><span>ℹ️</span> Informasi Penting:</h5>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 text-sm space-y-1">
            <li>Setiap pemilih hanya dapat memberikan suara satu kali.</li>
            <li>Pilihan tidak dapat diubah setelah dikonfirmasi.</li>
            <li>Status voting akan ditampilkan di bagian bawah halaman.</li>
          </ul>
        </div>
      </div>
    </div>
  ),
  quickcount: (
    <div id="manual-quickcount" className="manual-section active">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2"><span>📊</span> Panduan Quick Count</h3>
        <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Fitur Quick Count:</h4>
        <p className="mb-3 text-gray-700 dark:text-gray-300 text-sm">Quick Count menampilkan hasil pemilihan secara real-time dengan informasi berikut:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl">📈</span>
            <div>
              <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Statistik Umum</h5>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                <li><b>Total Suara:</b> Jumlah total suara yang masuk</li>
                <li><b>Partisipasi:</b> Persentase partisipasi pemilih</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl">📊</span>
            <div>
              <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Grafik Hasil</h5>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                <li>Nama kandidat dan jumlah suara</li>
                <li>Bar chart dengan persentase suara</li>
                <li>Urutan berdasarkan perolehan suara tertinggi</li>
              </ul>
            </div>
          </div>
        </div>
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Cara Mengakses:</h4>
        <ol className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-1 text-sm">
          <li>Login sebagai Admin atau Pemilih.</li>
          <li>Klik tab <b>QUICK COUNT</b> pada menu utama.</li>
          <li>Data akan ter-update otomatis setiap beberapa detik.</li>
        </ol>
        <div className="tip-box bg-green-50 dark:bg-green-950 rounded-lg p-4">
          <h5 className="font-semibold text-green-700 dark:text-green-300 mb-1 flex items-center gap-2"><span>💡</span> Tips:</h5>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Halaman Quick Count akan memperbarui data secara otomatis. Anda juga dapat melakukan refresh manual dengan berpindah tab.</p>
        </div>
      </div>
    </div>
  ),
  admin: (
    <div id="manual-admin" className="manual-section active">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2"><span>👨‍💼</span> Panduan Admin</h3>
        <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Akses Panel Admin:</h4>
        <p className="mb-4 text-gray-700 dark:text-gray-300 text-sm">Panel Admin hanya dapat diakses oleh pengguna dengan peran Admin (Petugas KPU).</p>
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Fitur-fitur Admin:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">1. Tambah Kandidat Baru</h5>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
              <li>Isi nama kandidat</li>
              <li>Masukkan visi dan misi</li>
              <li>Pilih warna tema kandidat</li>
              <li>Klik <b>Tambah Kandidat</b></li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">2. Kelola Kandidat</h5>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
              <li>Lihat daftar seluruh kandidat</li>
              <li>Edit atau hapus kandidat sesuai kebutuhan</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">3. Reset Semua Suara</h5>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
              <li>Menghapus seluruh data voting</li>
              <li>Reset status pemilih</li>
              <li>Memulai ulang proses pemilihan</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">4. Ekspor Hasil</h5>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
              <li>Unduh laporan hasil voting dalam format teks</li>
              <li>Berisi statistik lengkap dan timestamp</li>
            </ul>
          </div>
        </div>
        <div className="warning-box bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 border-l-4 border-yellow-400 dark:border-yellow-600">
          <h5 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1 flex items-center gap-2"><span>⚠️</span> Peringatan:</h5>
          <p className="text-gray-700 dark:text-gray-200 text-sm">Fitur <b>Reset Semua Suara</b> akan menghapus seluruh data voting secara permanen. Pastikan melakukan ekspor hasil terlebih dahulu jika diperlukan.</p>
        </div>
      </div>
    </div>
  ),
  faq: (
    <div id="manual-faq" className="manual-section active">
      <h3 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300 text-center">❓ Frequently Asked Questions</h3>
      <FAQAccordion />
      <h4 className="mt-10 mb-2 text-lg font-semibold text-blue-600 dark:text-blue-400">🛠️ Troubleshooting</h4>
      <div className="troubleshooting bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Masalah: Tidak bisa login</h5>
        <p className="mb-2 text-gray-700 dark:text-gray-300"><b>Solusi:</b> Pastikan username, password, dan peran sudah benar. Jika masih gagal, hubungi administrator.</p>
        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Masalah: Data tidak tersimpan</h5>
        <p className="mb-2 text-gray-700 dark:text-gray-300"><b>Solusi:</b> Pastikan browser mendukung localStorage dan tidak dalam mode incognito.</p>
        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Masalah: Quick Count tidak update</h5>
        <p className="mb-2 text-gray-700 dark:text-gray-300"><b>Solusi:</b> Refresh halaman atau ganti tab untuk memperbarui data.</p>
      </div>
      <div className="contact-box bg-blue-50 dark:bg-blue-950 rounded-lg p-4 flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white dark:bg-blue-400 dark:text-blue-950 text-lg">📞</span>
        <div>
          <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Butuh Bantuan?</h5>
          <p className="text-gray-700 dark:text-gray-300">Jika mengalami kendala teknis, silakan hubungi administrator sistem atau tim IT di institusi Anda.</p>
        </div>
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

// Daftar FAQ dalam bentuk array agar mudah di-render sebagai accordion
const faqList = [
  {
    q: 'Bagaimana jika lupa password?',
    a: 'Silakan hubungi administrator sistem untuk reset password atau bantuan lebih lanjut.'
  },
  {
    q: 'Bisakah mengubah pilihan setelah voting?',
    a: 'Tidak, setiap pemilih hanya dapat memberikan suara satu kali dan tidak dapat mengubah pilihan setelah dikonfirmasi.'
  },
  {
    q: 'Apakah data aman?',
    a: 'Data disimpan secara aman di server dan/atau browser. Untuk keamanan maksimal, gunakan koneksi HTTPS dan akun yang valid.'
  },
  {
    q: 'Bagaimana cara menambah kandidat?',
    a: 'Login sebagai Admin, masuk ke panel Admin, dan gunakan form Tambah Kandidat Baru.'
  },
  {
    q: 'Apakah bisa digunakan di mobile?',
    a: 'Ya, sistem ini responsif dan dapat digunakan di berbagai perangkat, termasuk smartphone dan tablet.'
  },
  {
    q: 'Bagaimana cara ekspor hasil?',
    a: 'Login sebagai Admin, masuk ke panel Admin, dan klik tombol Ekspor Hasil.'
  },
]

// Accordion FAQ component
function FAQAccordion() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null)
  return (
    <div className="w-full max-w-2xl mx-auto divide-y divide-gray-200 dark:divide-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-lg">
      {faqList.map((item, idx) => (
        <div key={idx} className="faq-accordion-item">
          <button
            className={
              'w-full flex items-center justify-between py-5 px-6 text-left focus:outline-none transition-colors duration-200 ' +
              (openIdx === idx
                ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200')
            }
            aria-expanded={openIdx === idx}
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <span className="font-medium text-base sm:text-lg flex-1">{item.q}</span>
            <FiChevronDown
              className={
                'ml-4 text-xl transition-transform duration-300 ' +
                (openIdx === idx ? 'rotate-180 text-blue-500' : 'rotate-0 text-gray-400')
              }
              aria-hidden="true"
            />
          </button>
          <div
            className={
              'overflow-hidden transition-all duration-300 ' +
              (openIdx === idx ? 'max-h-40 opacity-100 py-2 px-6' : 'max-h-0 opacity-0 py-0 px-6')
            }
            style={{
              transitionProperty: 'max-height, opacity, padding',
            }}
            aria-hidden={openIdx !== idx}
          >
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const ManualSection = () => {
  const [activeTab, setActiveTab] = React.useState("overview");

  // It's better to move manualContent and tabs outside if they don't depend on component's state/props
  // For brevity, keeping them here but applying dark mode classes directly.

  // Helper function to add dark mode classes to children of manualContent
  // This is a simplified example. A more robust solution might involve traversing the React elements
  // or ensuring all styled components within manualContent use Tailwind classes.
  const applyDarkModeToContent = (content: React.ReactElement): React.ReactElement => {
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