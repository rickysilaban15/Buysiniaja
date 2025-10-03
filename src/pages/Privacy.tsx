// pages/Privacy.tsx
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Database } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Privacy = () => {
  const lastUpdated = "1 Desember 2024";

  const sections = [
    {
      title: "Informasi yang Kami Kumpulkan",
      icon: Database,
      content: `
        <p>Kami mengumpulkan informasi berikut:</p>
        <ul>
          <li><strong>Informasi Pribadi:</strong> Nama, alamat email, nomor telepon, alamat pengiriman</li>
          <li><strong>Informasi Transaksi:</strong> Riwayat pembelian, metode pembayaran, preferensi belanja</li>
          <li><strong>Informasi Teknis:</strong> Alamat IP, jenis browser, perangkat yang digunakan</li>
          <li><strong>Cookies:</strong> Data untuk meningkatkan pengalaman pengguna</li>
        </ul>
      `
    },
    {
      title: "Penggunaan Informasi",
      icon: Eye,
      content: `
        <p>Informasi yang kami kumpulkan digunakan untuk:</p>
        <ul>
          <li>Memproses pesanan dan transaksi</li>
          <li>Mengirimkan pembaruan dan notifikasi</li>
          <li>Meningkatkan kualitas layanan</li>
          <li>Personalisasi pengalaman pengguna</li>
          <li>Analisis dan pengembangan bisnis</li>
          <li>Kepatuhan hukum dan regulasi</li>
        </ul>
      `
    },
    {
      title: "Perlindungan Data",
      icon: Lock,
      content: `
        <p>Kami menerapkan langkah-langkah keamanan untuk melindungi data Anda:</p>
        <ul>
          <li>Enkripsi data sensitif menggunakan teknologi SSL</li>
          <li>Akses terbatas hanya untuk personel yang berwenang</li>
          <li>Pemantauan keamanan sistem secara berkala</li>
          <li>Backup data rutin untuk mencegah kehilangan</li>
        </ul>
      `
    },
    {
      title: "Berbagi Informasi",
      icon: Shield,
      content: `
        <p>Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Informasi dapat dibagikan dengan:</p>
        <ul>
          <li><strong>Penyedia Jasa:</strong> Ekspedisi pengiriman, payment gateway</li>
          <li><strong>Kewajiban Hukum:</strong> Jika diwajibkan oleh hukum atau proses hukum</li>
          <li><strong>Perlindungan Hak:</strong> Untuk melindungi hak, properti, atau keamanan Buysini</li>
        </ul>
      `
    },
    {
      title: "Hak Pengguna",
      content: `
        <p>Anda memiliki hak untuk:</p>
        <ul>
          <li>Mengakses data pribadi Anda</li>
          <li>Memperbaiki data yang tidak akurat</li>
          <li>Menghapus data pribadi (hak untuk dilupakan)</li>
          <li>Membatasi pemrosesan data</li>
          <li>Menarik persetujuan pemrosesan data</li>
          <li>Mendapatkan salinan data dalam format portabel</li>
        </ul>
      `
    },
    {
      title: "Retensi Data",
      content: `
        <p>Kami menyimpan data pribadi Anda selama:</p>
        <ul>
          <li>Diperlukan untuk tujuan pengumpulan</li>
          <li>Diperlukan oleh kewajiban hukum</li>
          <li>Selama akun Anda aktif atau sesuai kebutuhan layanan</li>
          <li>Data transaksi disimpan selama 5 tahun untuk keperluan pajak</li>
        </ul>
      `
    },
    {
      title: "Cookies",
      content: `
        <p>Kami menggunakan cookies untuk:</p>
        <ul>
          <li>Mengingat preferensi Anda</li>
          <li>Analisis lalu lintas website</li>
          <li>Personalisasi konten</li>
          <li>Meningkatkan keamanan</li>
        </ul>
        <p>Anda dapat mengatur browser untuk menolak cookies, namun beberapa fitur mungkin tidak berfungsi optimal.</p>
      `
    },
    {
      title: "Perubahan Kebijakan",
      content: `
        <p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diberitahukan melalui Platform atau email. Penggunaan berkelanjutan setelah perubahan berarti Anda menerima kebijakan yang diperbarui.</p>
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
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Kebijakan Privasi</h1>
            <p className="text-lg text-gray-600">
              Terakhir diperbarui: {lastUpdated}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="prose prose-blue max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                Di Buysini, kami menghargai dan melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, melindungi, dan membagikan informasi pribadi Anda ketika Anda menggunakan Platform kami.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Komitmen Kami</h3>
                <p className="text-blue-800">
                  Kami berkomitmen untuk melindungi privasi Anda dan memastikan bahwa informasi pribadi Anda dikelola dengan aman dan bertanggung jawab.
                </p>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  {section.icon && <section.icon className="w-5 h-5 text-blue-600" />}
                  {section.title}
                </h2>
                <div 
                  className="text-gray-700 leading-relaxed prose prose-blue max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mt-8">
            <h2 className="text-2xl font-semibold text-center mb-6">Pertanyaan tentang Privasi?</h2>
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi kami atau bagaimana kami menangani data pribadi Anda, jangan ragu untuk menghubungi kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/contact" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Hubungi Tim Privasi
                </Link>
                <Link 
                  to="/help" 
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
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

export default Privacy;