import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CheckoutFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Pembayaran Gagal
          </h1>
          
          <p className="text-gray-600 mb-6">
            Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-red-800 text-sm">
                  <strong>Kemungkinan penyebab:</strong>
                </p>
                <ul className="text-red-700 text-sm mt-2 space-y-1">
                  <li>• Saldo tidak mencukupi</li>
                  <li>• Kartu kredit ditolak</li>
                  <li>• Masalah jaringan</li>
                  <li>• Transaksi timeout</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/checkout')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Pembayaran Lagi
            </button>
            
            <button
              onClick={() => navigate('/products')}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Lanjutkan Belanja
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Jika masalah berlanjut, hubungi customer service kami.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutFailed;