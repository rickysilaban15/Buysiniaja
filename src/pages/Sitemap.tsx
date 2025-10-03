// pages/Sitemap.tsx
import { Link } from "react-router-dom";
import { Home, Package, Users, Phone, HelpCircle, Truck, CreditCard, FileText } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Sitemap = () => {
  const siteSections = [
    {
      title: "Beranda & Utama",
      icon: Home,
      links: [
        { name: "Beranda", path: "/", description: "Halaman utama Buysini" },
        { name: "Tentang Kami", path: "/about", description: "Profil dan visi misi perusahaan" },
        { name: "Kontak", path: "/contact", description: "Hubungi customer service" },
      ]
    },
    {
      title: "Produk & Kategori",
      icon: Package,
      links: [
        { name: "Semua Produk", path: "/products", description: "Katalog produk lengkap" },
        { name: "Kategori", path: "/categories", description: "Browse berdasarkan kategori" },
        { name: "Produk Terbaru", path: "/products?sort=newest", description: "Produk baru yang tersedia" },
        { name: "Produk Populer", path: "/products?sort=popular", description: "Produk paling laris" },
      ]
    },
    {
      title: "Layanan Pelanggan",
      icon: Users,
      links: [
        { name: "Lacak Pesanan", path: "/track-order", description: "Cek status pengiriman pesanan" },
        { name: "Riwayat Pesanan", path: "/order-history", description: "Lihat history pembelian" },
        { name: "Bantuan", path: "/help", description: "Pusat bantuan dan panduan" },
        { name: "FAQ", path: "/faq", description: "Pertanyaan yang sering diajukan" },
      ]
    },
    {
      title: "Pembayaran & Pengiriman",
      icon: CreditCard,
      links: [
        { name: "Metode Pembayaran", path: "/payment-methods", description: "Bank transfer, e-wallet, kartu kredit" },
        { name: "Ekspedisi Pengiriman", path: "/shipping-methods", description: "JNE, TIKI, J&T, Pos Indonesia, dll" },
        { name: "Kebijakan Pengiriman", path: "/shipping-policy", description: "Ketentuan dan biaya pengiriman" },
      ]
    },
    {
      title: "Legal & Kebijakan",
      icon: FileText,
      links: [
        { name: "Syarat & Ketentuan", path: "/terms", description: "Ketentuan penggunaan layanan" },
        { name: "Kebijakan Privasi", path: "/privacy", description: "Perlindungan data pribadi" },
        { name: "Kebijakan Cookie", path: "/cookies", description: "Penggunaan cookie di website" },
        { name: "Kebijakan Pengembalian", path: "/return-policy", description: "Prosedur return dan refund" },
      ]
    },
    {
      title: "Program & Partnership",
      icon: Users,
      links: [
        { name: "Program Afiliasi", path: "/affiliate", description: "Gabung jadi mitra afiliasi" },
        { name: "Supplier Partnership", path: "/supplier", description: "Kerjasama dengan supplier" },
        { name: "Reseller Program", path: "/reseller", description: "Program reseller Buysini" },
      ]
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Peta Situs Buysini</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan semua halaman dan layanan yang tersedia di platform grosir terpercaya Buysini
            </p>
          </div>

          {/* Site Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {siteSections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <section.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                </div>
                
                <div className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="border-l-2 border-blue-200 pl-4">
                      <Link 
                        to={link.path}
                        className="text-blue-600 hover:text-blue-800 font-medium block mb-1 transition-colors"
                      >
                        {link.name}
                      </Link>
                      <p className="text-sm text-gray-600">{link.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Akses Cepat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                to="/products" 
                className="bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium block"
              >
                Belanja Sekarang
              </Link>
              <Link 
                to="/track-order" 
                className="bg-green-600 text-white text-center py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium block"
              >
                Lacak Pesanan
              </Link>
              <Link 
                to="/contact" 
                className="bg-orange-600 text-white text-center py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium block"
              >
                Hubungi Kami
              </Link>
              <Link 
                to="/help" 
                className="bg-purple-600 text-white text-center py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium block"
              >
                Butuh Bantuan?
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Sitemap;