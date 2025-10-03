import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Memverifikasi pembayaran...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Ambil data dari URL parameters atau localStorage
        const orderId = searchParams.get('order_id') || localStorage.getItem('currentOrderId');
        const statusFromGateway = searchParams.get('status');
        
        // Ambil data dari localStorage
        const pendingOrderStr = localStorage.getItem('pendingOrder');
        if (!pendingOrderStr) {
          throw new Error('Data pesanan tidak ditemukan');
        }

        const pendingOrder = JSON.parse(pendingOrderStr);
        
        if (statusFromGateway === 'success' || statusFromGateway === 'capture') {
          // Update order status ke paid
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              updated_at: new Date().toISOString()
            })
            .eq('id', pendingOrder.orderId);

          if (updateError) throw updateError;

          setStatus('success');
          setMessage('Pembayaran berhasil! Pesanan Anda sedang diproses.');

          // Hapus data dari localStorage setelah berhasil
          localStorage.removeItem('pendingOrder');
          
          // Redirect ke invoice setelah 3 detik
          setTimeout(() => {
            navigate('/invoice', {
              state: {
                orderData: {
                  orderId: pendingOrder.orderId,
                  orderNumber: pendingOrder.orderNumber,
                  trackingPin: pendingOrder.trackingPin,
                  total: pendingOrder.total,
                  status: 'confirmed',
                  paymentMethod: pendingOrder.paymentMethod,
                  shippingMethod: pendingOrder.shippingMethod,
                  shippingCost: pendingOrder.shippingCost,
                  subtotal: pendingOrder.subtotal,
                  createdAt: new Date().toISOString()
                }
              }
            });
          }, 3000);

        } else {
          setStatus('failed');
          setMessage('Pembayaran gagal atau dibatalkan.');
        }

      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('failed');
        setMessage('Terjadi kesalahan saat memverifikasi pembayaran.');
      }
    };

    verifyPayment();
  }, [navigate, searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="flex justify-center mb-6">
              {getStatusIcon()}
            </div>
            
            <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
              {status === 'success' && 'Pembayaran Berhasil!'}
              {status === 'failed' && 'Pembayaran Gagal'}
              {status === 'loading' && 'Memverifikasi Pembayaran'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {status === 'success' && (
              <p className="text-sm text-gray-500 mb-6">
                Anda akan diarahkan ke halaman invoice secara otomatis...
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lihat Pesanan Saya
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Kembali ke Beranda
              </button>

              {status === 'failed' && (
                <button
                  onClick={() => navigate('/order-pending')}
                  className="w-full border border-yellow-300 text-yellow-700 py-3 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  Coba Lagi
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentCallback;