// pages/ReturnPolicy.tsx
import { Link } from "react-router-dom";
import { RefreshCw, Package, Clock, AlertCircle, CheckCircle } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ReturnPolicy = () => {
  const lastUpdated = "1 Desember 2024";

  const returnConditions = [
    {
      title: "Produk Dapat Dikembalikan",
      eligible: true,
      items: [
        "Produk cacat atau rusak saat diterima",
        "Produk tidak sesuai dengan pesanan",
        "Produk kadaluarsa",
        "Kemasan rusak yang mempengaruhi kualitas produk"
      ]
    },
    {
      title: "Produk Tidak Dapat Dikembalikan",
      eligible: false,
      items: [
        "Produk yang sudah digunakan atau dibuka segelnya",
        "Perubahan keinginan pembeli",
        "Kesalahan pemesanan oleh pembeli",
        "Produk dengan masa kadaluarsa kurang dari 50%",
        "Produk yang dikembalikan setelah melebihi batas waktu"
      ]
    }
  ];

  const returnProcess = [
    {
      step: 1,
      title: "Laporkan dalam 24 Jam",
      description: "Laporkan masalah maksimal 24 jam setelah produk diterima melalui WhatsApp atau email customer service",
      icon: Clock
    },
    {
      step: 2,
      title: "Siapkan Bukti",
      description: "Siapkan foto dan video produk yang jelas sebagai bukti kondisi produk",
      icon: Package
    },
    {
      step: 3,
      title: "Verifikasi oleh Tim",
      description: "Tim kami akan memverifikasi kelayakan pengembalian dalam 1x24 jam",
      icon: CheckCircle
    },
    {
      step: 4,
      title: "Proses Pengembalian",
      description: "Jika disetujui, kami akan mengirimkan produk pengganti atau memproses refund",
      icon: RefreshCw
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <RefreshCw className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Kebijakan Pengembalian</h1>
            <p className="text-lg text-gray-600">
              Terakhir diperbarui: {lastUpdated}
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Informasi Penting</h3>
                <p className="text-blue-800">
                  Semua pengembalian harus dilaporkan dalam waktu <strong>24 jam</strong> setelah produk diterima. Pastikan untuk memeriksa produk dengan seksama saat menerima paket.
                </p>
              </div>
            </div>
          </div>

          {/* Return Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {returnConditions.map((condition, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                  condition.eligible ? 'text-green-600' : 'text-red-600'
                }`}>
                  {condition.eligible ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {condition.title}
                </h2>
                <ul className="space-y-2">
                  {condition.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        condition.eligible ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Return Process */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-center mb-8">Proses Pengembalian</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {returnProcess.map((process) => (
                <div key={process.step} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {process.step}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <process.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{process.title}</h3>
                  <p className="text-gray-600 text-sm">{process.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Refund Information */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6">Informasi Refund</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Metode Refund</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Transfer bank ke rekening asal</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Saldo Buysini untuk pembelian berikutnya</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>E-wallet (jika pembayaran via e-wallet)</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Waktu Pemrosesan</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>Verifikasi: 1-2 hari kerja</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>Refund transfer: 3-5 hari kerja</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>Penggantian produk: 1-3 hari kerja</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Butuh bantuan dengan pengembalian produk?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/6287818894504" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                WhatsApp Customer Service
              </a>
              <Link 
                to="/contact" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Formulir Kontak
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnPolicy;