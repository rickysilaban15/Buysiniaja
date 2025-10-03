// src/pages/PaymentShippingLogos.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentShippingLogos: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch payment methods
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (paymentError) throw paymentError;

      // Fetch shipping methods
      const { data: shippingData, error: shippingError } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (shippingError) throw shippingError;

      setPaymentMethods(paymentData || []);
      setShippingMethods(shippingData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali ke Beranda</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Buysini</h1>
              <p className="text-gray-600">Partner Grosir Terpercaya</p>
            </div>

            <button
              onClick={() => navigate('/admin/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Payment Methods Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Metode Pembayaran
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Berbagai pilihan pembayaran yang aman dan terpercaya untuk kemudahan bertransaksi
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  {method.logo_url ? (
                    <img
                      src={method.logo_url}
                      alt={method.name}
                      className="w-32 h-32 object-contain mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-gray-400">
                        {method.code.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shipping Methods Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ekspedisi Pengiriman
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Jaringan pengiriman luas yang menjangkau seluruh Indonesia dengan layanan terbaik
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {shippingMethods.map((method) => (
              <div
                key={method.id}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  {method.logo_url ? (
                    <img
                      src={method.logo_url}
                      alt={method.name}
                      className="w-32 h-32 object-contain mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-gray-400">
                        {method.code.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              &copy; 2024 Buysini. Semua hak cipta dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PaymentShippingLogos;