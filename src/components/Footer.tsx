// components/Footer.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Truck,
  CreditCard,
  Shield,
  Calendar,
  FileText,
  ShieldCheck,
  Cookie,
  ArrowUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Komponen ScrollToTop terpisah

const Footer = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Fetch data dalam satu useEffect
  useEffect(() => {
    fetchCategories();
    fetchPaymentMethods();
    fetchShippingMethods();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq('is_active', true)
        .order("sort_order", { ascending: true })
        .limit(6);

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories for footer:", err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (err) {
      console.error("Error fetching payment methods:", err);
    }
  };

  const fetchShippingMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setShippingMethods(data || []);
    } catch (err) {
      console.error("Error fetching shipping methods:", err);
    }
  };

  // Navigasi tambahan
  const legalLinks = [
    { name: "Syarat & Ketentuan", path: "/terms", icon: FileText },
    { name: "Kebijakan Privasi", path: "/privacy", icon: ShieldCheck },
    { name: "Kebijakan Cookie", path: "/cookies", icon: Cookie },
    { name: "Kebijakan Pengembalian", path: "/return-policy", icon: FileText },
    { name: "Kebijakan Pengiriman", path: "/shipping-policy", icon: Truck },
  ];

  return (
    <>
      {/* ScrollToTop Button - Render outside footer */}
      
      
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Payment & Shipping Section */}
        <div className="border-b border-white/10">
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Payment Methods - PERBAIKAN: Hapus filter CSS */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-base sm:text-lg">Metode Pembayaran</h3>
                </div>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  {paymentMethods.length > 0 ? (
                    paymentMethods.map((method) => (
                      <div
  key={method.id}
  className="bg-white/5 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-300 group w-16 h-12"
  title={method.name}
>
  {method.logo_url ? (
    <img
      src={method.logo_url}
      alt={method.name}
      className="w-full h-full object-contain transition-transform group-hover:scale-110"
    />
  ) : (
    <div className="w-full h-full bg-white/10 rounded flex items-center justify-center group-hover:scale-110">
      <span className="text-xs font-bold text-white/70">
        {method.code?.slice(0, 2).toUpperCase() || method.name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )}
</div>

                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Memuat metode pembayaran...</p>
                  )}
                </div>
              </div>

              {/* Shipping Methods - PERBAIKAN: Hapus filter CSS */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-base sm:text-lg">Ekspedisi Pengiriman</h3>
                </div>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  {shippingMethods.length > 0 ? (
                    shippingMethods.map((method) => (
                      <div
  key={method.id}
  className="bg-white/5 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-300 group w-16 h-12"
  title={method.name}
>
  {method.logo_url ? (
    <img
      src={method.logo_url}
      alt={method.name}
      className="w-full h-full object-contain transition-transform group-hover:scale-110"
    />
  ) : (
    <div className="w-full h-full bg-white/10 rounded flex items-center justify-center group-hover:scale-110">
      <span className="text-xs font-bold text-white/70">
        {method.code?.slice(0, 2).toUpperCase() || method.name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )}
</div>

                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Memuat metode pengiriman...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Company Info - Always Visible */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-transparent">
                  <div className="flex items-center">
                    <img
                      src="/logobuy.png"
                      alt="Buysini"
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">𝑩𝒖𝒚𝑺𝒊𝒏𝒊</h3>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Platform grosir online terpercaya untuk kebutuhan bisnis Anda. 
                Menyediakan berbagai produk berkualitas dengan harga grosir terbaik.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <a href="tel:+6287818894504" className="text-gray-300 hover:text-blue-400 transition-colors">
                    +62 878-1889-4504
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <a href="mailto:info@buysini.com" className="text-gray-300 hover:text-blue-400 transition-colors">
                    info@buysini.com
                  </a>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Jakarta Timur, Indonesia</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">08:00 - 17:00 WIB</span>
                </div>
              </div>
            </div>

            {/* Kategori - Accordion on Mobile */}
            <div className="border-b sm:border-b-0 border-white/10 pb-4 sm:pb-0">
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full sm:justify-start sm:pointer-events-none"
              >
                <h3 className="text-base sm:text-lg font-semibold">Kategori</h3>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform sm:hidden ${
                    openSection === 'categories' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div className={`mt-4 space-y-2 ${
                openSection === 'categories' ? 'block' : 'hidden sm:block'
              }`}>
                {categories.map((category) => (
                  <div key={category.id}>
                    <Link
                      to={`/products?category=${category.slug}`}
                      className="text-gray-300 hover:text-blue-400 transition-colors text-sm inline-block hover:translate-x-1 duration-200 py-1"
                    >
                      {category.name}
                    </Link>
                  </div>
                ))}
                <Link
                  to="/category"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-block mt-2"
                >
                  Lihat Semua Kategori →
                </Link>
              </div>
            </div>

            {/* Layanan - Accordion on Mobile */}
            <div className="border-b sm:border-b-0 border-white/10 pb-4 sm:pb-0">
              <button
                onClick={() => toggleSection('services')}
                className="flex items-center justify-between w-full sm:justify-start sm:pointer-events-none"
              >
                <h3 className="text-base sm:text-lg font-semibold">Layanan</h3>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform sm:hidden ${
                    openSection === 'services' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div className={`mt-4 space-y-2 ${
                openSection === 'services' ? 'block' : 'hidden sm:block'
              }`}>
                <Link
                  to="/track-order"
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2 text-sm py-1"
                >
                  <Truck className="w-4 h-4" />
                  Lacak Pesanan
                </Link>
                <Link
                  to="/order-history"
                  className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2 text-sm py-1"
                >
                  <Calendar className="w-4 h-4" />
                  Riwayat Pesanan
                </Link>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm block py-1"
                >
                  Katalog Produk
                </Link>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm block py-1"
                >
                  Tentang Kami
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm block py-1"
                >
                  Kontak
                </Link>
                <Link
                  to="/payment-shipping-logos"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm block py-1"
                >
                   Pembayaran & Pengiriman
                </Link>
              </div>
            </div>

            {/* Legal & Keamanan - Accordion on Mobile */}
            <div>
              <button
                onClick={() => toggleSection('legal')}
                className="flex items-center justify-between w-full sm:justify-start sm:pointer-events-none"
              >
                <h3 className="text-base sm:text-lg font-semibold">Legal & Keamanan</h3>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform sm:hidden ${
                    openSection === 'legal' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div className={`mt-4 space-y-4 ${
                openSection === 'legal' ? 'block' : 'hidden sm:block'
              }`}>
                {/* Legal Links */}
                <div className="space-y-2">
                  {legalLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.path}
                      className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2 text-sm py-1"
                    >
                      <link.icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* Trust Badges */}
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="bg-green-500/20 border border-green-400/30 rounded px-3 py-2 text-xs flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Aman
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded px-3 py-2 text-xs flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Terpercaya
                    </div>
                  </div>

                  {/* Social Media */}
                  <div>
                    <p className="text-sm text-gray-300 mb-3">Ikuti Kami:</p>
                    <div className="flex space-x-3">
                      <a
                        href="https://www.facebook.com/ricki.silaban.1?locale=id_ID"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                        title="Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                      <a
                        href="https://www.instagram.com/stev_ky_silaban/?__pwa=1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-pink-400 hover:bg-pink-500 hover:text-white transition-all"
                        title="Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a
  href="https://www.tiktok.com/@ricky_stev26"
  target="_blank"
  rel="noopener noreferrer"
  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-pink-500 hover:text-white transition-all"
  title="TikTok"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12.3 2h3.2c.1 1.1.6 2.2 1.4 3 1 1 2.2 1.5 3.5 1.6v3.2c-1.5 0-3-.4-4.4-1.2v7.2c0 3-2.4 5.4-5.4 5.4S5.2 18.8 5.2 15.8c0-3 2.4-5.4 5.4-5.4.4 0 .8 0 1.2.1V7.2c-.4 0-.8-.1-1.2-.1-4.7 0-8.6 3.9-8.6 8.6s3.9 8.6 8.6 8.6 8.6-3.9 8.6-8.6V7c-1.2-.3-2.3-.9-3.2-1.8-.9-.9-1.4-2-1.6-3.2h-3z"/>
  </svg>
</a>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-6 sm:mt-8 pt-4 sm:pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center">
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                <Link to="/sitemap" className="hover:text-white transition-colors">
                  Peta Situs
                </Link>
                <span className="hidden sm:inline">•</span>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
                <span className="hidden sm:inline">•</span>
                <Link to="/help" className="hover:text-white transition-colors">
                  Bantuan
                </Link>
                <span className="hidden sm:inline">•</span>
                <Link to="/affiliate" className="hover:text-white transition-colors">
                  Program Afiliasi
                </Link>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-xs sm:text-sm text-gray-400">
                  &copy; 2025 Buysini. Semua hak cipta dilindungi.
                </p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Made with <span className="text-red-400">🥇</span> by{" "}
                  <span className="text-blue-400 font-semibold">Ricky Steven Silaban</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;