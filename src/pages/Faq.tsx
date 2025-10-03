// pages/Faq.tsx
import { useState } from "react";
import { ChevronDown, Search, HelpCircle, Package, CreditCard, Truck, Shield, User } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from "react-router-dom";

const Faq = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: "Umum & Akun",
      icon: User,
      questions: [
        {
          question: "Bagaimana cara mendaftar akun Buysini?",
          answer: "Klik tombol 'Daftar' di pojok kanan atas, isi formulir pendaftaran dengan email dan password, lalu verifikasi email Anda melalui link yang dikirim ke inbox email."
        },
        {
          question: "Apakah ada biaya pendaftaran?",
          answer: "Tidak ada biaya pendaftaran. Gratis 100% untuk bergabung sebagai member Buysini."
        },
        {
          question: "Bagaimana cara reset password?",
          answer: "Klik 'Lupa Password' di halaman login, masukkan email terdaftar, dan ikuti instruksi reset password yang dikirim ke email Anda."
        }
      ]
    },
    {
      title: "Produk & Pemesanan",
      icon: Package,
      questions: [
        {
          question: "Berapa minimal order grosir?",
          answer: "Minimal order berbeda-beda tergantung produk. Biasanya mulai dari 10-24 pcs per varian. Detail minimal order bisa dilihat di halaman produk."
        },
        {
          question: "Apakah produk ready stock?",
          answer: "Ya, semua produk yang ditampilkan adalah ready stock. Stok real-time bisa dilihat di halaman detail produk."
        },
        {
          question: "Bagaimana cara cek ketersediaan produk?",
          answer: "Stok produk ditampilkan secara real-time di halaman detail produk. Jika stok habis, akan ada notifikasi 'Pre Order'."
        }
      ]
    },
    {
      title: "Pembayaran",
      icon: CreditCard,
      questions: [
        {
          question: "Metode pembayaran apa saja yang diterima?",
          answer: "Kami menerima Bank Transfer (BCA, Mandiri, BNI, BRI), E-wallet (Gopay, OVO, Dana, ShopeePay), dan Kartu Kredit."
        },
        {
          question: "Berapa lama batas waktu pembayaran?",
          answer: "Batas waktu pembayaran adalah 24 jam setelah order dibuat. Order akan otomatis dibatalkan jika melebihi batas waktu."
        },
        {
          question: "Apakah tersedia cicilan?",
          answer: "Untuk saat ini belum tersedia fitur cicilan. Semua transaksi dilakukan secara penuh (full payment)."
        }
      ]
    },
    {
      title: "Pengiriman",
      icon: Truck,
      questions: [
        {
          question: "Ekspedisi apa saja yang tersedia?",
          answer: "Kami bekerjasama dengan JNE, TIKI, Pos Indonesia, J&T, SiCepat, dan Ninja Express."
        },
        {
          question: "Berapa lama waktu pengiriman?",
          answer: "Waktu pengiriman tergantung tujuan dan ekspedisi. Jakarta 1-2 hari, Jawa 2-3 hari, Luar Jawa 3-7 hari kerja."
        },
        {
          question: "Bagaimana cara lacak pesanan?",
          answer: "Gunakan fitur 'Lacak Pesanan' di website atau aplikasi dengan memasukkan nomor resi yang dikirim via email/SMS."
        }
      ]
    },
    {
      title: "Keamanan & Garansi",
      icon: Shield,
      questions: [
        {
          question: "Apakah data pribadi saya aman?",
          answer: "Ya, kami menggunakan enkripsi SSL dan mematuhi kebijakan privasi untuk melindungi data pribadi Anda."
        },
        {
          question: "Bagaimana jika produk rusak saat pengiriman?",
          answer: "Segera foto produk dan laporkan dalam 24 jam. Kami akan proses penggantian atau refund sesuai kebijakan."
        },
        {
          question: "Apakah ada garansi untuk produk?",
          answer: "Garansi tergantung jenis produk. Detail garansi bisa dilihat di halaman detail produk masing-masing."
        }
      ]
    }
  ];

  // Filter questions based on search
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">FAQ</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pertanyaan yang sering diajukan tentang layanan Buysini
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari pertanyaan atau kata kunci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          {filteredCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <category.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">{category.title}</h2>
              </div>

              <div className="space-y-4">
                {category.questions.map((item, itemIndex) => {
                  const globalIndex = categoryIndex * 10 + itemIndex;
                  const isOpen = openItems.includes(globalIndex);

                  return (
                    <div key={itemIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold mb-4">Masih ada pertanyaan?</h3>
            <p className="text-gray-600 mb-6">
              Tim customer service kami siap membantu Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contact" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Hubungi Customer Service
              </Link>
              <Link 
                to="/help" 
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Live Chat
              </Link>
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

export default Faq;