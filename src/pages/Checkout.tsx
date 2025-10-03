import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { ArrowLeft, MapPin, User, CreditCard, Shield, Truck, Tag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import * as checkoutService from '@/services/checkoutService';
// Import langsung service promo
import { validatePromo, incrementPromoUsage } from '@/services/promoService';
import { lazy, Suspense } from 'react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    alamat: '',
    kota: '',
    provinsi: '',
    kodePos: '',
    catatan: ''
  });

  // Promo states
  const [promoCode, setPromoCode] = useState('');
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Hitung finalTotal di luar agar bisa digunakan di JSX
  const finalTotal = Math.max(0, cart.total - discountAmount);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Apply promo function - DIPERBAIKI
  const applyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Masukkan kode promo terlebih dahulu');
      return;
    }

    setApplyingPromo(true);
    setPromoError('');

    try {
      console.log('🔄 Applying promo:', promoCode);
      
      // Gunakan fungsi yang sudah di-import
      const validation = await validatePromo(promoCode.toUpperCase(), cart.total);
      console.log('📊 Validation result:', validation);

      if (validation.isValid && validation.promo) {
        setSelectedPromo(validation.promo);
        setDiscountAmount(validation.discountAmount);
        setPromoError('');
        console.log('✅ Promo applied successfully');
      } else {
        setSelectedPromo(null);
        setDiscountAmount(0);
        setPromoError(validation.message || 'Promo tidak valid');
        console.log('❌ Promo validation failed:', validation.message);
      }
    } catch (error) {
      console.error('❌ Error applying promo:', error);
      setPromoError('Terjadi kesalahan saat memvalidasi promo');
    } finally {
      setApplyingPromo(false);
    }
  };

  // Remove promo
  const removePromo = () => {
    setSelectedPromo(null);
    setDiscountAmount(0);
    setPromoCode('');
    setPromoError('');
  };

  // Handle checkout - DIPERBAIKI
  const handleCheckout = async () => {
    // Validasi form
    if (!formData.nama || !formData.telepon || !formData.alamat || !formData.kota || !formData.provinsi) {
      return alert("Lengkapi semua data wajib! (nama, telepon, alamat, kota, provinsi)");
    }

    setLoading(true);
    try {
      // Jika ada promo yang digunakan, increment usage
      if (selectedPromo) {
        try {
          console.log('🔄 Incrementing promo usage for:', selectedPromo.id);
          await incrementPromoUsage(selectedPromo.id);
          console.log('✅ Promo usage incremented');
        } catch (error) {
          console.error('❌ Error incrementing promo usage:', error);
          // Lanjutkan checkout meskipun gagal update promo usage
        }
      }
      
      console.log('🔄 Processing checkout...');
      const result = await checkoutService.processCheckout(
        cart.items,
        finalTotal, // Gunakan finalTotal yang sudah dihitung
        formData,
        selectedPromo?.id
      );

      console.log('✅ Order created:', result);

      // Update payment status
      await checkoutService.updateOrderPaymentStatus(
        result.orderId,
        'pending',
        'manual_processing'
      );

      clearCart();
      
      // Navigate to order pending page
      navigate('/order-pending', {
        state: {
          orderId: result.orderId,
          trackingPin: result.trackingPin,
          orderNumber: result.orderNumber,
          total: finalTotal,
          discount: discountAmount,
          customerName: formData.nama,
          paymentMethod: 'manual_processing',
          instructions: 'Pembayaran sedang diproses secara manual. Silakan hubungi customer service untuk instruksi pembayaran.',
          promoUsed: selectedPromo ? {
            code: selectedPromo.code,
            name: selectedPromo.name,
            discount: discountAmount
          } : null
        }
      });

    } catch (err: any) {
      console.error('❌ Checkout error:', err);
      alert(err.message || 'Terjadi kesalahan saat checkout. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Keranjang Kosong</h1>
            <p className="text-gray-600 mb-8">Silakan tambahkan produk ke keranjang terlebih dahulu sebelum checkout.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lanjutkan Belanja
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form Data */}
          <div className="space-y-6">
            {/* Data Pribadi */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Data Pribadi</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Alamat Pengiriman */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Alamat Pengiriman</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota *
                    </label>
                    <input
                      type="text"
                      name="kota"
                      value={formData.kota}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nama Kota"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provinsi *
                    </label>
                    <input
                      type="text"
                      name="provinsi"
                      value={formData.provinsi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nama Provinsi"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      name="kodePos"
                      value={formData.kodePos}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12345"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan untuk Penjual (Opsional)
                  </label>
                  <textarea
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Warna khusus, waktu pengiriman, dll."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Ringkasan Pesanan */}
          <div className="space-y-6">
            {/* Ringkasan Pesanan */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Pesanan</h2>

              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Promo - DIPERBAIKI */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Kode Promo
                </label>
                
                {selectedPromo ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-800 text-sm">
                          {selectedPromo.name}
                        </p>
                        <p className="text-green-600 text-xs">
                          Diskon: {formatPrice(discountAmount)}
                        </p>
                      </div>
                      <button
                        onClick={removePromo}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError('');
                        }}
                        placeholder="Masukkan kode promo"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            applyPromo();
                          }
                        }}
                      />
                      <button
                        onClick={applyPromo}
                        disabled={applyingPromo}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        {applyingPromo ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Gunakan'
                        )}
                      </button>
                    </div>
                    
                    {promoError && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        ❌ {promoError}
                      </p>
                    )}
                    
                    {/* Info tambahan */}
                    <p className="text-xs text-gray-500">
                      💡 Contoh: DISKON10, WELCOME20, dll.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">{formatPrice(cart.total)}</span>
                </div>

                {/* Diskon jika ada */}
                {selectedPromo && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon ({selectedPromo.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                {/* HAPUS ONGKOS KIRIM - LANGSUNG KE TOTAL */}
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span className="text-gray-800">Total</span>
                  <span className="text-blue-600">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Metode Pembayaran</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium">Manual / Midtrans</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Shield className="w-4 h-4 mr-1" />
                    <span className="text-sm">Aman</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Anda akan diarahkan ke halaman pembayaran yang aman setelah mengkonfirmasi pesanan.
                </p>
              </div>
            </div>

            {/* Info Pengiriman */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-3">
                <Truck className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-800">Info Pengiriman</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Pengiriman gratis untuk semua pesanan</li>
                <li>• Estimasi pengiriman 2-5 hari kerja</li>
                <li>• Packing aman dan rapi</li>
                <li>• No HP kurir akan dikirim via WhatsApp</li>
              </ul>
            </div>

            {/* Tombol Checkout */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                `Bayar Sekarang - ${formatPrice(finalTotal)}`
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan yang berlaku
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;