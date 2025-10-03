import React from 'react';
import { Users, Target, Award, Clock, TrendingUp, Shield, Heart, Package, Store, Truck, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const About = () => {
  const stats = [
    { icon: Users, label: 'Pelanggan Aktif', value: '10,000+' },
    { icon: Package, label: 'Produk Tersedia', value: '5,000+' },
    { icon: Award, label: 'Tahun Pengalaman', value: '5+' },
    { icon: TrendingUp, label: 'Pertumbuhan Tahunan', value: '150%' }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Terpercaya',
      description: 'Kami berkomitmen memberikan produk original dan berkualitas tinggi kepada setiap pelanggan.'
    },
    {
      icon: Heart,
      title: 'Pelayanan Prima',
      description: 'Tim customer service kami siap membantu Anda 24/7 dengan respons cepat dan ramah.'
    },
    {
      icon: TrendingUp,
      title: 'Harga Kompetitif',
      description: 'Dapatkan harga grosir terbaik tanpa mengorbankan kualitas produk yang Anda beli.'
    },
    {
      icon: Clock,
      title: 'Pengiriman Cepat',
      description: 'Sistem logistik terintegrasi memastikan pesanan Anda sampai dengan cepat dan aman.'
    }
  ];

  const storeFeatures = [
    {
      icon: Store,
      title: 'Toko Online Terpercaya',
      description: 'Platform grosir modern dengan sistem yang aman dan terpercaya untuk semua transaksi bisnis Anda.'
    },
    {
      icon: ShoppingBag,
      title: 'Beragam Pilihan Produk',
      description: 'Ribuan produk berkualitas dari berbagai kategori dengan stok yang selalu terupdate.'
    },
    {
      icon: Truck,
      title: 'Jaringan Pengiriman Luas',
      description: 'Melayani pengiriman ke seluruh Indonesia dengan berbagai pilihan ekspedisi terbaik.'
    },
    {
      icon: Shield,
      title: 'Garansi Kepuasan',
      description: 'Jaminan uang kembali dan garansi produk untuk memberikan rasa aman dalam berbelanja.'
    }
  ];

  const milestones = [
    { year: '2019', title: 'Pendirian Buysini', description: 'Memulai perjalanan dengan visi menjadi platform grosir terpercaya' },
    { year: '2020', title: 'Ekspansi Produk', description: 'Menambah 1000+ produk baru dan bermitra dengan 50+ supplier' },
    { year: '2021', title: 'Platform Digital', description: 'Launching website dan aplikasi mobile untuk kemudahan berbelanja' },
    { year: '2022', title: 'Jangkauan Nasional', description: 'Melayani seluruh Indonesia dengan 10 gudang distribusi' },
    { year: '2023', title: 'Sertifikasi ISO', description: 'Mendapatkan sertifikasi ISO 9001:2015 untuk standar kualitas' },
    { year: '2024', title: '10,000+ Pelanggan', description: 'Mencapai milestone dengan kepercayaan ribuan mitra bisnis' }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=800&fit=crop")',
            }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
          </div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-soft-light filter blur-3xl animate-blob"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-cyan-500/20 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Tentang Buysini
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in-up animation-delay-200 leading-relaxed">
                  Platform Grosir Terpercaya untuk Kesuksesan Bisnis Anda
                </p>
                <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-400">
                  <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30">
                    <span className="font-semibold text-white">Sejak 2019</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30">
                    <span className="font-semibold text-white">Trusted by 10,000+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 relative -mt-10 z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index}
                    className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/15 group"
                  >
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-4xl font-bold text-white">Cerita Kami</h2>
                  <p className="text-lg text-white/80 leading-relaxed">
                    Buysini lahir dari sebuah visi sederhana: membuat bisnis grosir menjadi lebih mudah, transparan, dan menguntungkan bagi semua pihak. Dimulai pada tahun 2019, kami telah berkembang menjadi platform e-commerce grosir terpercaya yang melayani ribuan pelanggan di seluruh Indonesia.
                  </p>
                  <p className="text-lg text-white/80 leading-relaxed">
                    Dengan komitmen pada kualitas produk, harga kompetitif, dan layanan pelanggan yang luar biasa, Buysini terus berinovasi untuk memberikan pengalaman berbelanja grosir terbaik di era digital.
                  </p>
                  <div className="flex gap-6 pt-4">
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-blue-400" />
                      <span className="font-semibold text-white">Fokus Pelanggan</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-blue-400" />
                      <span className="font-semibold text-white">Kualitas Terjamin</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop" 
                      alt="Our Store" 
                      className="rounded-xl shadow-lg w-full"
                    />
                    <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-2xl border border-white/20">
                      <div className="text-3xl font-bold">5+</div>
                      <div className="text-sm font-medium">Tahun Pengalaman</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-600/90 to-blue-800/90 backdrop-blur-md text-white p-10 rounded-2xl shadow-2xl border border-white/20">
                  <Target className="w-12 h-12 mb-4 text-blue-300" />
                  <h3 className="text-3xl font-bold mb-4">Visi Kami</h3>
                  <p className="text-lg text-white/90 leading-relaxed">
                    Menjadi platform grosir online terdepan di Indonesia yang menghubungkan supplier dan retailer dengan teknologi modern, menciptakan ekosistem bisnis yang adil, efisien, dan menguntungkan bagi semua pihak.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-600/90 to-purple-800/90 backdrop-blur-md text-white p-10 rounded-2xl shadow-2xl border border-white/20">
                  <Award className="w-12 h-12 mb-4 text-purple-300" />
                  <h3 className="text-3xl font-bold mb-4">Misi Kami</h3>
                  <ul className="space-y-3 text-lg text-white/90">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-300 text-xl mt-1">•</span>
                      <span>Menyediakan produk berkualitas dengan harga terjangkau</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-300 text-xl mt-1">•</span>
                      <span>Memberikan pengalaman berbelanja yang mudah dan menyenangkan</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-300 text-xl mt-1">•</span>
                      <span>Membangun kepercayaan melalui transparansi dan integritas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Store Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Keunggulan Toko Kami</h2>
                <p className="text-xl text-white/80">Apa yang membuat Buysini berbeda dari yang lain</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {storeFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={index}
                      className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                    >
                      <div className="bg-gradient-to-br from-blue-500/30 to-purple-500/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-white/80 leading-relaxed">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Nilai-Nilai Kami</h2>
                <p className="text-xl text-white/80">Prinsip yang memandu setiap langkah kami</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <div 
                      key={index}
                      className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                    >
                      <div className="bg-gradient-to-br from-blue-500/30 to-purple-500/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                      <p className="text-white/80 leading-relaxed">{value.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
              <h2 className="text-4xl font-bold text-white mb-6">Siap Bergabung dengan Kami?</h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Bergabunglah dengan ribuan pelanggan yang sudah mempercayai Buysini untuk kebutuhan bisnis mereka
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-2xl hover:-translate-y-1 border border-white/20">
                  Mulai Belanja
                </button>
                <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-2xl hover:shadow-2xl">
                  Hubungi Kami
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />

      
    </>
  );
};

export default About;