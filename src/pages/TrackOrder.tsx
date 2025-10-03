// pages/TrackOrder.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Mail, 
  Key, 
  AlertTriangle,
  Calendar // ⬅️ TAMBAH INI
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface OrderTracking {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status: string;
  tracking_pin: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  customer_address: string;
  customer_city: string;
  total_amount: number;
}

const TrackOrder = () => {
  const [trackingPin, setTrackingPin] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const navigate = useNavigate();

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingPin.trim()) {
      setError('Masukkan PIN tracking');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_pin', trackingPin.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('PIN tracking tidak ditemukan');
        } else {
          setError('Terjadi kesalahan saat mencari pesanan');
        }
        return;
      }

      setOrder(data);
    } catch (err) {
      setError('Terjadi kesalahan saat mencari pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setRecoveryError('Masukkan alamat email Anda');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError('');
    setRecoverySuccess('');

    try {
      // Cari orders berdasarkan email
      const { data: orders, error } = await supabase
        .from('orders')
        .select('order_number, tracking_pin, created_at, status')
        .eq('customer_email', recoveryEmail.trim())
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        setRecoveryError('Terjadi kesalahan saat mencari pesanan');
        return;
      }

      if (!orders || orders.length === 0) {
        setRecoveryError('Tidak ditemukan pesanan dengan email tersebut');
        return;
      }

      // Tampilkan PIN yang ditemukan
      setRecoverySuccess(`Kami menemukan ${orders.length} pesanan dengan email Anda. Berikut PIN tracking Anda:`);
      
      // Untuk demo, kita tampilkan semua PIN
      // Dalam production, sebaiknya kirim email ke user
      console.log('Recovered PINs:', orders);
      
      // Simulasikan pengiriman email (dalam real implementation, kirim email sebenarnya)
      setTimeout(() => {
        setRecoverySuccess(
          `Kami telah mengirimkan PIN tracking ke ${recoveryEmail}. ` +
          `Periksa inbox email Anda. Jika tidak ditemukan, cek folder spam.`
        );
      }, 1000);

    } catch (err) {
      setRecoveryError('Terjadi kesalahan saat memulihkan PIN');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100',
          text: 'Menunggu Pembayaran', 
          step: 1,
          icon: Clock 
        };
      case 'confirmed':
      case 'paid':
        return { 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-100',
          text: 'Pesanan Dikonfirmasi', 
          step: 2,
          icon: CheckCircle 
        };
      case 'processing':
        return { 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-100',
          text: 'Sedang Diproses', 
          step: 3,
          icon: Package 
        };
      case 'shipped':
        return { 
          color: 'text-indigo-600', 
          bgColor: 'bg-indigo-100',
          text: 'Sedang Dikirim', 
          step: 4,
          icon: Truck 
        };
      case 'delivered':
        return { 
          color: 'text-green-600', 
          bgColor: 'bg-green-100',
          text: 'Pesanan Sampai', 
          step: 5,
          icon: MapPin 
        };
      case 'cancelled':
        return { 
          color: 'text-red-600', 
          bgColor: 'bg-red-100',
          text: 'Dibatalkan', 
          step: 0,
          icon: XCircle 
        };
      default:
        return { 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100',
          text: status, 
          step: 1,
          icon: Package 
        };
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusInfo = order ? getStatusInfo(order.status) : null;
  const StatusIcon = statusInfo?.icon || Package;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Lacak Pesanan</h1>
            <p className="text-gray-600">
              Masukkan PIN tracking untuk melihat status pesanan Anda
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Masukkan PIN tracking (6 digit)"
                  value={trackingPin}
                  onChange={(e) => setTrackingPin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                  maxLength={6}
                  pattern="[0-9]*"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? 'Mencari...' : 'Lacak Pesanan'}
              </button>
            </form>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* PIN Recovery */}
            <div className="border-t pt-4 mt-4">
              <button
                onClick={() => setShowRecovery(!showRecovery)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Key className="w-4 h-4" />
                Lupa PIN tracking? Klik di sini
              </button>

              {showRecovery && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Pemulihan PIN Tracking</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Masukkan email yang Anda gunakan saat checkout untuk menerima PIN tracking
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleRecoverPin} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        type="email"
                        placeholder="Email Anda saat checkout"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={recoveryLoading}
                      className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {recoveryLoading ? 'Mengirim...' : 'Dapatkan PIN'}
                    </button>
                  </form>

                  {recoveryError && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-600 text-sm">{recoveryError}</p>
                    </div>
                  )}

                  {recoverySuccess && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-600 text-sm">{recoverySuccess}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Tracking Result */}
          {order && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Pesanan #{order.order_number}</h2>
                    <p className="opacity-90">PIN: {order.tracking_pin}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${statusInfo?.bgColor} ${statusInfo?.color} font-semibold flex items-center gap-2 mt-2 sm:mt-0`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusInfo?.text}
                  </div>
                </div>
              </div>

              {/* Tracking Progress */}
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-4">Status Pengiriman</h3>
                <div className="space-y-4">
                  {[
                    { step: 1, label: 'Pesanan Diterima', icon: Package },
                    { step: 2, label: 'Pembayaran Dikonfirmasi', icon: CheckCircle },
                    { step: 3, label: 'Pesanan Diproses', icon: Package },
                    { step: 4, label: 'Pesanan Dikirim', icon: Truck },
                    { step: 5, label: 'Pesanan Sampai', icon: MapPin }
                  ].map(({ step, label, icon: Icon }) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        step <= (statusInfo?.step || 0) 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          step <= (statusInfo?.step || 0) 
                            ? 'text-gray-800' 
                            : 'text-gray-400'
                        }`}>
                          {label}
                        </p>
                        {step === 4 && order.shipped_at && (
                          <p className="text-sm text-gray-500">
                            Dikirim pada: {formatDate(order.shipped_at)}
                          </p>
                        )}
                        {step === 5 && order.delivered_at && (
                          <p className="text-sm text-gray-500">
                            Sampai pada: {formatDate(order.delivered_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Informasi Pelanggan</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nama:</strong> {order.customer_name}</p>
                      <p><strong>Email:</strong> {order.customer_email}</p>
                      <p><strong>Alamat:</strong> {order.customer_address}</p>
                      <p><strong>Kota:</strong> {order.customer_city}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Detail Pesanan</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Total:</strong> {formatPrice(order.total_amount)}</p>
                      <p><strong>Status Pembayaran:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          order.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.payment_status === 'paid' ? 'Lunas' : 'Menunggu'}
                        </span>
                      </p>
                      <p><strong>Tanggal Pesan:</strong> {formatDate(order.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          {!order && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-blue-800 mb-3">Butuh Bantuan?</h3>
              <ul className="text-blue-700 space-y-2">
                <li>• PIN tracking terdiri dari 6 digit angka</li>
                <li>• PIN dikirimkan setelah pembayaran berhasil</li>
                <li>• Simpan PIN dengan aman untuk melacak pesanan</li>
                <li>• Lupa PIN? Gunakan fitur pemulihan dengan email</li>
                <li>• Hubungi customer service jika masih mengalami masalah</li>
              </ul>

              {/* Link ke Order History */}
              <div className="text-center mt-6">
                <button
                  onClick={() => navigate('/order-history')}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Lihat Riwayat Semua Pesanan Saya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TrackOrder;