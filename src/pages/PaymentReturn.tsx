// pages/PaymentReturn.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      const orderId = searchParams.get('order_id');
      const transactionStatus = searchParams.get('transaction_status');
      
      console.log('Payment return params:', { orderId, transactionStatus });

      if (!orderId) {
        throw new Error('Order ID tidak ditemukan');
      }

      // Cek data dari localStorage sebagai fallback
      const pendingOrder = localStorage.getItem('pendingOrder');
      let orderData: any = null;

      if (pendingOrder) {
        orderData = JSON.parse(pendingOrder);
        localStorage.removeItem('pendingOrder');
      }

      // Update status pembayaran berdasarkan response Midtrans
      if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
        // Pembayaran berhasil
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        setStatus('success');
        setMessage('Pembayaran berhasil! Pesanan Anda sedang diproses.');

        // Redirect ke confirmation page setelah 2 detik
        setTimeout(() => {
          navigate('/order-confirmation', {
            state: {
              orderData: orderData ? {
                ...orderData,
                status: 'paid',
                paymentMethod: 'Midtrans'
              } : { orderId, status: 'paid' }
            }
          });
        }, 2000);

      } else if (transactionStatus === 'pending') {
        // Pembayaran pending
        await supabase
          .from('orders')
          .update({
            payment_status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        setStatus('pending');
        setMessage('Menunggu pembayaran! Silakan selesaikan pembayaran Anda.');

        setTimeout(() => {
          navigate('/order-pending', {
            state: orderData
          });
        }, 2000);

      } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
        // Pembayaran gagal
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        setStatus('error');
        setMessage('Pembayaran gagal atau dibatalkan.');

        setTimeout(() => {
          navigate('/checkout-failed');
        }, 2000);

      } else {
        throw new Error('Status pembayaran tidak dikenali');
      }

    } catch (error: any) {
      console.error('Error checking payment status:', error);
      setStatus('error');
      setMessage('Terjadi kesalahan saat memproses pembayaran.');
    }
  };

  const getStatusUI = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-600" />,
          title: 'Pembayaran Berhasil!',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600'
        };
      case 'pending':
        return {
          icon: <Clock className="w-16 h-16 text-yellow-600" />,
          title: 'Menunggu Pembayaran',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600'
        };
      case 'error':
        return {
          icon: <XCircle className="w-16 h-16 text-red-600" />,
          title: 'Pembayaran Gagal',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600'
        };
      default:
        return {
          icon: <ShoppingBag className="w-16 h-16 text-blue-600" />,
          title: 'Memproses Pembayaran...',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600'
        };
    }
  };

  const statusUI = getStatusUI();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className={`w-32 h-32 ${statusUI.bgColor} rounded-full flex items-center justify-center mx-auto mb-8`}>
            {statusUI.icon}
          </div>
          
          <h1 className={`text-3xl font-bold mb-4 ${statusUI.textColor}`}>
            {statusUI.title}
          </h1>
          
          <p className="text-gray-600 text-lg mb-8">
            {message || 'Sedang memverifikasi status pembayaran Anda...'}
          </p>

          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentReturn;