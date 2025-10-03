// pages/Cookies.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, Settings, Shield, Info } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Cookies = () => {
  const lastUpdated = "1 Desember 2024";
  const [activeTab, setActiveTab] = useState("essential");

  const cookieTypes = [
    {
      id: "essential",
      name: "Cookie Esensial",
      description: "Cookie yang diperlukan untuk fungsi dasar website",
      required: true,
      cookies: [
        { name: "session_id", purpose: "Mempertahankan sesi login pengguna", duration: "Sesi" },
        { name: "csrf_token", purpose: "Keamanan form dan transaksi", duration: "Sesi" },
        { name: "cart_items", purpose: "Menyimpan item dalam keranjang belanja", duration: "7 hari" }
      ]
    },
    {
      id: "analytics",
      name: "Cookie Analitik",
      description: "Cookie untuk memahami bagaimana pengguna berinteraksi dengan website",
      required: false,
      cookies: [
        { name: "ga_", purpose: "Analisis lalu lintas dan perilaku pengguna", duration: "2 tahun" },
        { name: "gid", purpose: "Membedakan pengguna", duration: "24 jam" },
        { name: "collect", purpose: "Mengirim data ke Google Analytics", duration: "Sesi" }
      ]
    },
    {
      id: "preferences",
      name: "Cookie Preferensi",
      description: "Cookie yang mengingat pengaturan dan preferensi Anda",
      required: false,
      cookies: [
        { name: "language", purpose: "Menyimpan preferensi bahasa", duration: "1 tahun" },
        { name: "theme", purpose: "Menyimpan preferensi tema tampilan", duration: "1 tahun" },
        { name: "currency", purpose: "Menyimpan preferensi mata uang", duration: "1 tahun" }
      ]
    },
    {
      id: "marketing",
      name: "Cookie Pemasaran",
      description: "Cookie untuk menampilkan iklan yang relevan",
      required: false,
      cookies: [
        { name: "fbp", purpose: "Iklan Facebook", duration: "3 bulan" },
        { name: "fr", purpose: "Iklan Facebook", duration: "3 bulan" },
        { name: "NID", purpose: "Iklan Google", duration: "6 bulan" }
      ]
    }
  ];

  const activeCategory = cookieTypes.find(cat => cat.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Cookie className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Kebijakan Cookie</h1>
            <p className="text-lg text-gray-600">
              Terakhir diperbarui: {lastUpdated}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="prose prose-blue max-w-none">
              <h2 className="text-2xl font-semibold mb-4">Apa itu Cookie?</h2>
              <p className="text-gray-700 mb-4">
                Cookie adalah file teks kecil yang disimpan di perangkat Anda ketika Anda mengunjungi website kami. Cookie membantu kami memberikan pengalaman yang lebih baik, lebih aman, dan dipersonalisasi untuk Anda.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-2">Perhatian</h3>
                    <p className="text-yellow-800 text-sm">
                      Cookie esensial tidak dapat dinonaktifkan karena diperlukan untuk fungsi dasar website. Untuk cookie lainnya, Anda dapat mengatur preferensi melalui pengaturan browser Anda.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cookie Types Navigation */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Jenis Cookie yang Kami Gunakan
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              {cookieTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveTab(type.id)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    activeTab === type.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{type.name}</span>
                    {type.required && (
                      <Shield className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <span className={`text-xs ${
                    type.required ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {type.required ? 'Wajib' : 'Opsional'}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Category Details */}
            {activeCategory && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">{activeCategory.name}</h3>
                <p className="text-gray-700 mb-6">{activeCategory.description}</p>
                
                <div className="space-y-4">
                  {activeCategory.cookies.map((cookie, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{cookie.name}</span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {cookie.duration}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{cookie.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cookie Management */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-center mb-6">Kelola Preferensi Cookie</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Pengaturan Browser</h3>
                <p className="text-gray-600 mb-4">
                  Anda dapat mengatur browser untuk menolak semua atau beberapa cookie, atau untuk memberi tahu Anda ketika website mencoba menyetel cookie.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</p>
                  <p><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</p>
                  <p><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</p>
                  <p><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Dampak Menonaktifkan Cookie</h3>
                <p className="text-gray-600 mb-4">
                  Jika Anda menonaktifkan cookie, beberapa fitur website mungkin tidak berfungsi dengan baik:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Tidak dapat login ke akun Anda</li>
                  <li>• Item keranjang belanja tidak tersimpan</li>
                  <li>• Preferensi bahasa dan tema tidak diingat</li>
                  <li>• Pengalaman belanja yang kurang personal</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Masih memiliki pertanyaan tentang penggunaan cookie kami?
            </p>
            <Link 
              to="/contact" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cookies;