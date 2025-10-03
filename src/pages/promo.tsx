import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Tag, 
  Clock, 
  ShoppingBag, 
  Star, 
  Copy, 
  CheckCircle, 
  Zap, 
  Calendar,
  Percent,
  DollarSign,
  Users,
  ArrowRight,
  Shield,
  Gift,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Building,
  ChevronDown,
  ChevronUp,
  Send
} from "lucide-react";

interface Promo {
  id: string;
  name: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  start_date: string;
  end_date: string;
  min_order_value?: number;
  max_uses?: number;
  current_uses?: number;
  is_featured?: boolean;
  status: "active" | "inactive" | "expired";
  category?: string;
  image_url?: string;
}

const PromoPage: React.FC = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [featuredPromos, setFeaturedPromos] = useState<Promo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Ganti fungsi fetchPromos dengan yang lebih baik
const fetchPromos = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from("promos")
      .select("*")
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Normalize to start of day
    
    console.log('📊 Total promos from DB:', data?.length);
    
    const activePromos = (data || []).filter((promo: any) => {
      try {
        // Parse dates properly
        const startDate = new Date(promo.start_date);
        const endDate = new Date(promo.end_date);
        
        // Set to start of day for comparison
        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1); // Add 1 day to include end date
        
        const isActive = start <= today && end >= today;
        const hasQuota = !promo.max_uses || (promo.current_uses || 0) < promo.max_uses;
        
        console.log(`🔍 ${promo.code}: ${isActive && hasQuota ? 'ACTIVE' : 'INACTIVE'}`, {
          start: start.toLocaleDateString('id-ID'),
          end: end.toLocaleDateString('id-ID'),
          today: today.toLocaleDateString('id-ID'),
          uses: `${promo.current_uses || 0}/${promo.max_uses || '∞'}`,
          isActive,
          hasQuota
        });
        
        return isActive && hasQuota;
      } catch (err) {
        console.error('Error processing promo:', promo, err);
        return false;
      }
    });
    
    console.log('🎯 Final active promos:', activePromos.length, activePromos);
    
    // Extract unique categories
    const uniqueCategories = [...new Set(activePromos.map((p: any) => p.category || "general"))];
    setCategories(["all", ...uniqueCategories]);
    
    setFeaturedPromos(activePromos.filter((p: any) => p.is_featured));
    setPromos(activePromos);
    
  } catch (error) {
    console.error('❌ Error fetching promos:', error);
    setPromos([]);
    setFeaturedPromos([]);
    setCategories(["all"]);
  } finally {
    setLoading(false);
  }

};
  // Realtime subscription
  useEffect(() => {
    fetchPromos();

    const subscription = supabase
      .channel('public_promos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promos' }, () => {
        fetchPromos();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDiscount = (type: string, value: number) => {
    return type === "percentage" 
      ? `${value}% OFF` 
      : `Rp ${value.toLocaleString('id-ID')}`;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getUsagePercentage = (current: number = 0, max: number = 0) => {
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const filteredPromos = selectedCategory === "all" 
    ? promos 
    : promos.filter(promo => promo.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "flash_sale": return <Zap className="w-4 h-4" />;
      case "new_user": return <Users className="w-4 h-4" />;
      case "seasonal": return <Calendar className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "flash_sale": return "from-red-500 to-orange-500";
      case "new_user": return "from-green-500 to-emerald-500";
      case "seasonal": return "from-purple-500 to-pink-500";
      default: return "from-blue-500 to-purple-500";
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-white/80">Memuat promo...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section - Updated to match Contact page */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1200&h=800&fit=crop")',
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
              <Gift className="w-16 h-16 mx-auto mb-4 text-white" />
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Promo Spesial
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in-up animation-delay-200 leading-relaxed">
                Nikmati berbagai penawaran menarik dan hemat lebih banyak dengan kode promo eksklusif kami
              </p>
              <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-400">
                <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Flash Sale Tersedia
                  </span>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Terjamin Keamanannya
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Category Filter */}
        {categories.length > 1 && (
          <section className="py-16 relative -mt-10 z-10">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === "all"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white/10 backdrop-blur-md text-white hover:bg-white/15 border border-white/20"
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  Semua Promo
                </button>
                {categories.filter(cat => cat !== "all").map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 capitalize ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/25"
                        : "bg-white/10 backdrop-blur-md text-white hover:bg-white/15 border border-white/20"
                    }`}
                  >
                    {getCategoryIcon(category)}
                    {category.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Promos */}
        {featuredPromos.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-xl">
                  <Star className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Promo Unggulan</h2>
                  <p className="text-white/80">Penawaran spesial pilihan untuk Anda</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPromos.map((promo) => {
                  const daysLeft = getDaysRemaining(promo.end_date);
                  const usagePercentage = getUsagePercentage(promo.current_uses, promo.max_uses);
                  
                  return (
                    <div
                      key={promo.id}
                      className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    >
                      {/* Featured Badge */}
                      <div className="absolute top-6 right-6">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                          <Star size={16} fill="currentColor" />
                          UNGGULAN
                        </span>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          {getCategoryIcon(promo.category)}
                          <span className="text-white/80 text-sm font-medium capitalize">
                            {promo.category?.replace('_', ' ') || 'general'}
                          </span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3">{promo.name}</h3>
                        {promo.description && (
                          <p className="text-white/90 text-lg">{promo.description}</p>
                        )}
                      </div>

                      {/* Promo Code Section */}
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/80 font-medium">Kode Promo:</span>
                          <button
                            onClick={() => copyPromoCode(promo.code)}
                            className="flex items-center gap-2 text-white hover:text-white/80 transition"
                          >
                            {copiedCode === promo.code ? (
                              <>
                                <CheckCircle size={18} />
                                <span className="font-medium">Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={18} />
                                <span className="font-medium">Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                        <code className="block text-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-lg font-mono text-2xl font-bold text-white border-2 border-dashed border-white/30">
                          {promo.code}
                        </code>
                      </div>

                      {/* Discount and Details */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 font-medium">Diskon:</span>
                          <span className="text-4xl font-bold text-white">
                            {formatDiscount(promo.discount_type, promo.discount_value)}
                          </span>
                        </div>
                        
                        {/* Usage Progress */}
                        {promo.max_uses && promo.max_uses > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-white/80">
                              <span>Tersisa: {promo.max_uses - (promo.current_uses || 0)} dari {promo.max_uses}</span>
                              <span>{Math.round(usagePercentage)}% terpakai</span>
                            </div>
                            <div className="w-full bg-white/30 rounded-full h-2">
                              <div 
                                className="bg-white h-2 rounded-full transition-all duration-500"
                                style={{ width: `${usagePercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {promo.min_order_value && promo.min_order_value > 0 && (
                            <div className="flex items-center gap-2 text-white/80">
                              <ShoppingBag size={16} />
                              <span>Min. order: Rp {promo.min_order_value.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-white/80">
                            <Clock size={16} />
                            <span>
                              {daysLeft > 0 
                                ? `Berlaku ${daysLeft} hari lagi` 
                                : 'Berakhir hari ini'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* All Promos */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {selectedCategory === "all" ? "Semua Promo Aktif" : `Promo ${selectedCategory.replace('_', ' ')}`}
                </h2>
                <p className="text-white/80">
                  {filteredPromos.length} promo tersedia
                </p>
              </div>
            </div>
            
            {filteredPromos.length === 0 ? (
              <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
                <Tag size={64} className="mx-auto text-white/40 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Tidak Ada Promo Saat Ini</h3>
                <p className="text-white/60 max-w-md mx-auto">
                  {selectedCategory === "all" 
                    ? "Pantau terus halaman ini untuk mendapatkan promo terbaru!" 
                    : `Tidak ada promo dalam kategori ${selectedCategory.replace('_', ' ')} saat ini.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPromos.map((promo) => {
                  const daysLeft = getDaysRemaining(promo.end_date);
                  const usagePercentage = getUsagePercentage(promo.current_uses, promo.max_uses);
                  const isFeatured = promo.is_featured;
                  
                  return (
                    <div
                      key={promo.id}
                      className={`bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-white/20 ${
                        isFeatured ? 'ring-2 ring-yellow-400' : ''
                      }`}
                    >
                      {/* Header dengan gradient berdasarkan kategori */}
                      <div className={`bg-gradient-to-r ${getCategoryColor(promo.category || 'general')} p-6 text-white relative`}>
                        {isFeatured && (
                          <div className="absolute top-4 right-4">
                            <Star size={20} fill="currentColor" className="text-yellow-300" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(promo.category)}
                          <span className="text-white/90 text-sm font-medium capitalize">
                            {promo.category?.replace('_', ' ') || 'general'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{promo.name}</h3>
                        <p className="text-3xl font-bold">
                          {formatDiscount(promo.discount_type, promo.discount_value)}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {promo.description && (
                          <p className="text-white/80 mb-4 leading-relaxed">{promo.description}</p>
                        )}

                        {/* Promo Code */}
                        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 mb-4 border border-white/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/80 font-medium">Kode Promo:</span>
                            <button
                              onClick={() => copyPromoCode(promo.code)}
                              className="text-white hover:text-white/80 transition flex items-center gap-1"
                            >
                              {copiedCode === promo.code ? (
                                <CheckCircle size={16} />
                              ) : (
                                <Copy size={16} />
                              )}
                              <span className="text-sm font-medium">
                                {copiedCode === promo.code ? 'Tersalin' : 'Salin'}
                              </span>
                            </button>
                          </div>
                          <code className="block text-center bg-white/10 backdrop-blur-md px-4 py-3 rounded-lg font-mono text-lg font-bold text-white border-2 border-dashed border-white/30">
                            {promo.code}
                          </code>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 text-sm">
                          {promo.min_order_value && promo.min_order_value > 0 && (
                            <div className="flex items-center gap-3 text-white/80">
                              <ShoppingBag size={16} />
                              <span>Min. order: Rp {promo.min_order_value.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          
                          {promo.max_uses && promo.max_uses > 0 && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-white/60">
                                <span>Kuota: {promo.max_uses - (promo.current_uses || 0)} tersisa</span>
                                <span>{Math.round(usagePercentage)}% terpakai</span>
                              </div>
                              <div className="w-full bg-white/30 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${usagePercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3 text-white/80">
                            <Clock size={16} />
                            <span>
                              {daysLeft > 0 
                                ? `Berlaku ${daysLeft} hari lagi` 
                                : 'Berakhir hari ini'}
                            </span>
                          </div>
                        </div>

                        {/* Period */}
                        <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/60">
                          <div className="flex justify-between">
                            <span>Mulai: {new Date(promo.start_date).toLocaleDateString('id-ID')}</span>
                            <span>Selesai: {new Date(promo.end_date).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* How to Use Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md rounded-3xl p-12 text-white text-center border border-white/20 shadow-2xl">
              <h3 className="text-3xl font-bold mb-4">Cara Menggunakan Promo</h3>
              <p className="text-white/90 text-lg mb-12 max-w-2xl mx-auto">
                Ikuti langkah-langkah sederhana ini untuk mendapatkan diskon spesial dari Buysini
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  {
                    step: 1,
                    title: "Pilih Promo",
                    description: "Pilih promo yang sesuai dengan kebutuhan belanja Anda",
                    icon: <Tag className="w-8 h-8" />
                  },
                  {
                    step: 2,
                    title: "Salin Kode",
                    description: "Klik tombol salin untuk menyalin kode promo ke clipboard",
                    icon: <Copy className="w-8 h-8" />
                  },
                  {
                    step: 3,
                    title: "Gunakan di Checkout",
                    description: "Tempel kode promo saat checkout untuk mendapatkan diskon",
                    icon: <ShoppingBag className="w-8 h-8" />
                  }
                ].map((step, index) => (
                  <div key={step.step} className="text-center">
                    <div className="bg-white/20 backdrop-blur-md w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                      {step.icon}
                    </div>
                    <div className="bg-white text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                      {step.step}
                    </div>
                    <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                    <p className="text-white/80 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Pertanyaan Umum</h2>
                <p className="text-white/80 text-lg">Temukan jawaban cepat untuk pertanyaan yang sering diajukan</p>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    q: "Berapa lama masa berlaku kode promo?",
                    a: "Masa berlaku berbeda-beda tergantung promo. Biasanya berkisar antara 1-30 hari. Cek selalu tanggal berakhir di detail promo."
                  },
                  {
                    q: "Apakah kode promo bisa digabungkan?",
                    a: "Umumnya tidak. Hanya satu kode promo yang dapat digunakan per transaksi, kecuali ada penawaran khusus."
                  },
                  {
                    q: "Bagaimana jika kode promo tidak bisa digunakan?",
                    a: "Pastikan minimum order terpenuhi, masa berlaku masih aktif, dan kuota belum habis. Hubungi CS jika masih bermasalah."
                  },
                  {
                    q: "Apakah ada promo untuk member baru?",
                    a: "Ya! Kami sering memberikan promo khusus untuk member baru. Pantau terus halaman ini untuk update terbaru."
                  }
                ].map((faq, index) => (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                    >
                      <span className="font-bold text-white text-lg">{faq.q}</span>
                      {openFaqIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-white" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white" />
                      )}
                    </button>
                    {openFaqIndex === index && (
                      <div className="px-6 pb-6">
                        <div className="border-t border-white/20 pt-4">
                          <p className="text-white/80 leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
              <h2 className="text-4xl font-bold text-white mb-6">Butuh Bantuan Lainnya?</h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Hubungi customer service kami untuk informasi lebih lanjut tentang promo dan penawaran khusus
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-2xl hover:-translate-y-1 border border-white/20">
                  <a href="tel:+6287818894504" className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Hubungi CS
                  </a>
                </button>
                <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-2xl hover:shadow-2xl">
                  <a href="mailto:info@buysini.com" className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Kami
                  </a>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </Layout>
  );
};

export default PromoPage;