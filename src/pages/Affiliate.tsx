// pages/Affiliate.tsx
import { useState } from "react";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  BarChart3,
  Gift,
  Clock,
  HelpCircle
} from "lucide-react";

const Affiliate = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const benefits = [
    {
      icon: DollarSign,
      title: "Komisi Tinggi",
      description: "Dapatkan komisi hingga 15% dari setiap penjualan yang berhasil"
    },
    {
      icon: Users,
      title: "Jaringan Luas",
      description: "Akses ke komunitas affiliate dan dukungan penuh dari tim Buysini"
    },
    {
      icon: TrendingUp,
      title: "Performance Bonus",
      description: "Bonus tambahan untuk affiliate dengan performa terbaik setiap bulan"
    },
    {
      icon: Shield,
      title: "Program Terpercaya",
      description: "Sistem pembayaran yang transparan dan tepat waktu"
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Daftar Program",
      description: "Isi formulir pendaftaran dengan data lengkap dan valid"
    },
    {
      step: 2,
      title: "Verifikasi Akun",
      description: "Tunggu verifikasi dari tim kami (1-2 hari kerja)"
    },
    {
      step: 3,
      title: "Dapatkan Link Affiliate",
      description: "Gunakan link dan kode unik untuk promosi"
    },
    {
      step: 4,
      title: "Promosikan & Hasilkan",
      description: "Mulai promosikan dan dapatkan komisi dari setiap penjualan"
    }
  ];

  const commissionRates = [
    { category: "Elektronik", rate: "12%", average: "Rp 50.000 - Rp 500.000" },
    { category: "Fashion", rate: "15%", average: "Rp 25.000 - Rp 150.000" },
    { category: "Kebutuhan Rumah", rate: "10%", average: "Rp 30.000 - Rp 200.000" },
    { category: "Kesehatan & Kecantikan", rate: "15%", average: "Rp 20.000 - Rp 120.000" },
    { category: "Olahraga & Hobi", rate: "12%", average: "Rp 40.000 - Rp 300.000" }
  ];

  const faqs = [
    {
      question: "Berapa minimal penarikan komisi?",
      answer: "Minimal penarikan komisi adalah Rp 100.000. Pembayaran dilakukan setiap tanggal 15 setiap bulannya."
    },
    {
      question: "Berapa lama masa aktif link affiliate?",
      answer: "Link affiliate aktif selamanya selama akun affiliate Anda masih aktif dan mematuhi ketentuan program."
    },
    {
      question: "Apakah ada biaya pendaftaran?",
      answer: "Tidak ada biaya pendaftaran. Program affiliate Buysini sepenuhnya gratis untuk diikuti."
    },
    {
      question: "Bagaimana cara tracking penjualan?",
      answer: "Kami menyediakan dashboard affiliate lengkap dengan data real-time untuk memantau performa dan komisi."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <TrendingUp className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Program Afiliasi Buysini</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hasilkan pendapatan tambahan dengan mempromosikan produk-produk berkualitas dari Buysini
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Daftar Sekarang
            </button>
            <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              Lihat Dashboard Contoh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">2,500+</div>
            <div className="text-gray-600 text-sm">Affiliate Aktif</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">Rp 3.2M+</div>
            <div className="text-gray-600 text-sm">Komisi Dibayar</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">15%</div>
            <div className="text-gray-600 text-sm">Rata-rata Komisi</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Gift className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">50+</div>
            <div className="text-gray-600 text-sm">Bonus Bulanan</div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Keuntungan Jadi Affiliate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Cara Bergabung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Rates */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Struktur Komisi</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 font-semibold">Kategori Produk</th>
                  <th className="text-left py-4 font-semibold">Komisi</th>
                  <th className="text-left py-4 font-semibold">Rata-rata Komisi/Order</th>
                </tr>
              </thead>
              <tbody>
                {commissionRates.map((rate, index) => (
                  <tr key={index} className="border-b border-gray-200 last:border-b-0">
                    <td className="py-4">{rate.category}</td>
                    <td className="py-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {rate.rate}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600">{rate.average}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Pertanyaan Umum</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold mb-3 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 ml-8">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="bg-blue-600 text-white rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Siap Menghasilkan dengan Buysini?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan affiliate yang sudah menghasilkan puluhan juta rupiah setiap bulannya
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2 justify-center">
                Daftar Sekarang <ArrowRight className="w-4 h-4" />
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Hubungi Tim Affiliate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Affiliate;