// pages/Terms.tsx
import { Link } from "react-router-dom";
import { FileText, Shield, AlertCircle, CheckCircle } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => {
  const lastUpdated = "1 Desember 2024";

  const sections = [
    {
      title: "1. Definisi",
      content: `
        <p>Dalam Syarat & Ketentuan ini, yang dimaksud dengan:</p>
        <ul>
          <li><strong>"Platform"</strong> adalah website dan aplikasi mobile Buysini</li>
          <li><strong>"Pengguna"</strong> adalah individu atau entitas yang mengakses dan menggunakan Platform</li>
          <li><strong>"Produk"</strong> adalah barang yang ditawarkan untuk dijual di Platform</li>
          <li><strong>"Transaksi"</strong> adalah proses pembelian dan penjualan Produk melalui Platform</li>
        </ul>
      `
    },
    {
      title: "2. Pendaftaran Akun",
      content: `
        <p>Untuk dapat melakukan pembelian, Pengguna harus:</p>
        <ul>
          <li>Berusia minimal 18 tahun</li>
          <li>Menyediakan data yang akurat dan valid</li>
          <li>Menjaga kerahasiaan informasi akun</li>
          <li>Bertanggung jawab penuh atas segala aktivitas yang dilakukan melalui akun</li>
        </ul>
      `
    },
    {
      title: "3. Ketentuan Pembelian",
      content: `
        <p>Dengan melakukan pembelian, Pengguna menyetujui:</p>
        <ul>
          <li>Minimal pembelian mengikuti ketentuan yang berlaku untuk masing-masing produk</li>
          <li>Harga yang tercantum adalah harga grosir</li>
          <li>Stok produk dapat berubah sewaktu-waktu</li>
          <li>Pembayaran harus dilakukan dalam waktu 24 jam setelah pemesanan</li>
        </ul>
      `
    },
    {
      title: "4. Pembayaran",
      content: `
        <p>Metode pembayaran yang tersedia:</p>
        <ul>
          <li>Transfer Bank (BCA, Mandiri, BNI, BRI)</li>
          <li>E-wallet (Gopay, OVO, Dana, ShopeePay)</li>
          <li>Kartu Kredit (Visa, MasterCard)</li>
        </ul>
        <p>Konfirmasi pembayaran akan diproses dalam 1x24 jam.</p>
      `
    },
    {
      title: "5. Pengiriman",
      content: `
        <p>Ketentuan pengiriman:</p>
        <ul>
          <li>Pengiriman dilakukan setelah pembayaran dikonfirmasi</li>
          <li>Biaya pengiriman ditanggung pembeli</li>
          <li>Waktu pengiriman tergantung lokasi dan ekspedisi</li>
          <li>Resiko kerusakan selama pengiriman menjadi tanggung jawab ekspedisi</li>
        </ul>
      `
    },
    {
      title: "6. Pengembalian & Refund",
      content: `
        <p>Pengembalian produk dapat dilakukan jika:</p>
        <ul>
          <li>Produk cacat atau tidak sesuai pesanan</li>
          <li>Laporan diterima maksimal 24 jam setelah produk diterima</li>
          <li>Produk belum digunakan dan masih dalam kemasan original</li>
          <li>Dilengkapi dengan foto dan video sebagai bukti</li>
        </ul>
      `
    },
    {
      title: "7. Hak Kekayaan Intelektual",
      content: `
        <p>Seluruh konten yang terdapat dalam Platform ini, termasuk namun tidak terbatas pada teks, gambar, logo, dan software, merupakan hak milik Buysini dan dilindungi oleh undang-undang hak cipta.</p>
      `
    },
    {
      title: "8. Pembatasan Tanggung Jawab",
      content: `
        <p>Buysini tidak bertanggung jawab atas:</p>
        <ul>
          <li>Keterlambatan pengiriman oleh pihak ekspedisi</li>
          <li>Kerusakan produk selama pengiriman</li>
          <li>Kesalahan data yang dimasukkan oleh Pengguna</li>
          <li>Force majeure yang mengakibatkan gangguan layanan</li>
        </ul>
      `
    },
    {
      title: "9. Perubahan Syarat & Ketentuan",
      content: `
        <p>Buysini berhak mengubah Syarat & Ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Perubahan akan efektif segera setelah diposting di Platform.</p>
      `
    },
    {
      title: "10. Hukum yang Berlaku",
      content: `
        <p>Syarat & Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui jalur musyawarah, dan jika tidak tercapai kesepakatan, akan diselesaikan melalui Pengadilan Negeri Jakarta Timur.</p>
      `
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
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Syarat & Ketentuan</h1>
            <p className="text-lg text-gray-600">
              Terakhir diperbarui: {lastUpdated}
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Penting</h3>
                <p className="text-blue-800 text-sm">
                  Dengan mengakses dan menggunakan Platform Buysini, Anda menyetujui semua syarat dan ketentuan yang tercantum di bawah ini. Harap baca dengan seksama.
                </p>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {sections.map((section, index) => (
              <div key={index} className="mb-8 last:mb-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  {section.title}
                </h2>
                <div 
                  className="text-gray-700 leading-relaxed prose prose-blue max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            ))}

            {/* Contact Information */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Pertanyaan?</h3>
              <p className="text-gray-600 mb-4">
                Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi kami:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/contact" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Hubungi Kami
                </Link>
                <Link 
                  to="/help" 
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Pusat Bantuan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;