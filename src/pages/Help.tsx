// pages/Help.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  FileText, 
  Video, 
  ChevronRight,
  HelpCircle,
  Package,
  CreditCard,
  Truck,
  User
} from "lucide-react";

import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Help = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const helpCategories = [
    {
      id: "account",
      title: "Akun & Profile",
      icon: User,
      articles: [
        { title: "Cara Daftar Akun Baru", difficulty: "Mudah", time: "2 menit" },
        { title: "Verifikasi Email dan Phone", difficulty: "Mudah", time: "3 menit" },
        { title: "Mengatur Profile dan Alamat", difficulty: "Mudah", time: "5 menit" },
        { title: "Reset Password yang Lupa", difficulty: "Mudah", time: "3 menit" },
      ]
    },
    {
      id: "shopping",
      title: "Belanja & Produk",
      icon: Package,
      articles: [
        { title: "Cara Mencari Produk", difficulty: "Mudah", time: "2 menit" },
        { title: "Memahami Minimal Order Grosir", difficulty: "Sedang", time: "5 menit" },
        { title: "Cek Stok dan Ketersediaan", difficulty: "Mudah", time: "2 menit" },
        { title: "Baca Deskripsi dan Spesifikasi", difficulty: "Mudah", time: "3 menit" },
      ]
    },
    {
      id: "payment",
      title: "Pembayaran",
      icon: CreditCard,
      articles: [
        { title: "Metode Pembayaran yang Tersedia", difficulty: "Mudah", time: "3 menit" },
        { title: "Cara Transfer Bank Manual", difficulty: "Sedang", time: "5 menit" },
        { title: "Pembayaran dengan E-wallet", difficulty: "Mudah", time: "3 menit" },
        { title: "Batas Waktu Pembayaran", difficulty: "Mudah", time: "2 menit" },
      ]
    },
    {
      id: "shipping",
      title: "Pengiriman",
      icon: Truck,
      articles: [
        { title: "Pilih Ekspedisi Pengiriman", difficulty: "Mudah", time: "3 menit" },
        { title: "Cek Ongkos Kirim", difficulty: "Mudah", time: "2 menit" },
        { title: "Lacak Status Pengiriman", difficulty: "Mudah", time: "2 menit" },
        { title: "Estimasi Waktu Pengiriman", difficulty: "Mudah", time: "3 menit" },
      ]
    }
  ];

  const allArticles = helpCategories.flatMap(category => 
    category.articles.map(article => ({
      ...article,
      category: category.title,
      categoryId: category.id
    }))
  );

  const filteredArticles = activeCategory === "all" 
    ? allArticles 
    : allArticles.filter(article => article.categoryId === activeCategory);

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat langsung dengan customer service",
      availability: "Online 24/7",
      action: "Mulai Chat",
      color: "bg-green-500"
    },
    {
      icon: Phone,
      title: "Telepon",
      description: "Hubungi nomor customer service",
      availability: "08:00 - 17:00 WIB",
      action: "+62 878-1889-4504",
      color: "bg-blue-500"
    },
    {
      icon: Mail,
      title: "Email",
      description: "Kirim pertanyaan via email",
      availability: "Respon 1x24 jam",
      action: "info@buysini.com",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <HelpCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Pusat Bantuan</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan solusi dan panduan lengkap untuk menggunakan layanan Buysini
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className={`${method.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <method.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{method.availability}</span>
                </div>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  {method.action}
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="font-semibold text-lg mb-4">Kategori Bantuan</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeCategory === "all" 
                        ? "bg-blue-100 text-blue-700" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Semua Artikel
                  </button>
                  {helpCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                        activeCategory === category.id 
                          ? "bg-blue-100 text-blue-700" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <category.icon className="w-4 h-4" />
                      <span>{category.title}</span>
                    </button>
                  ))}
                </div>

                {/* Quick Links */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-3">Tautan Cepat</h4>
                  <div className="space-y-2">
                    <Link to="/faq" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                      <ChevronRight className="w-4 h-4" />
                      FAQ Lengkap
                    </Link>
                    <Link to="/sitemap" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                      <ChevronRight className="w-4 h-4" />
                      Peta Situs
                    </Link>
                    <Link to="/video-tutorial" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                      <ChevronRight className="w-4 h-4" />
                      Video Tutorial
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Articles */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {activeCategory === "all" ? "Semua Artikel Bantuan" : 
                     helpCategories.find(cat => cat.id === activeCategory)?.title + " Articles"}
                  </h2>
                  <span className="text-gray-500 text-sm">
                    {filteredArticles.length} artikel ditemukan
                  </span>
                </div>

                <div className="space-y-4">
                  {filteredArticles.map((article, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{article.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {article.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {article.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.time}
                        </span>
                      </div>
                      <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                        Baca panduan
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {filteredArticles.length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Tidak ada artikel yang ditemukan</p>
                  </div>
                )}
              </div>

              {/* Video Tutorials Section */}
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Video className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Video Tutorial</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="bg-gray-200 h-32 rounded mb-3 flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium mb-2">Panduan Registrasi Akun</h4>
                    <p className="text-sm text-gray-600 mb-3">Step-by-step cara daftar akun Buysini</p>
                    <button className="text-blue-600 text-sm">Tonton Video</button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="bg-gray-200 h-32 rounded mb-3 flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium mb-2">Cara Order Grosir</h4>
                    <p className="text-sm text-gray-600 mb-3">Tutorial lengkap proses pemesanan</p>
                    <button className="text-blue-600 text-sm">Tonton Video</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Help;
