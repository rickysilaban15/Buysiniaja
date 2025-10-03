// pages/OrderHistory.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Truck, MapPin, CheckCircle, Clock, XCircle, Mail, Calendar, DollarSign, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface OrderHistory {
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
  total_amount: number;
  items_count?: number;
}

const OrderHistory = () => {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearchOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Masukkan alamat email Anda');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Format email tidak valid');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      // Ambil orders berdasarkan email
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(count)
        `)
        .eq('customer_email', email.trim())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setError('Terjadi kesalahan saat mengambil data pesanan');
        return;
      }

      // Format data orders
      const formattedOrders: OrderHistory[] = (ordersData || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        status: order.status,
        payment_status: order.payment_status,
        tracking_pin: order.tracking_pin,
        created_at: order.created_at,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
        total_amount: order.total_amount,
        items_count: order.order_items?.[0]?.count || 0
      }));

      setOrders(formattedOrders);

    } catch (err) {
      console.error('Error:', err);
      setError('Terjadi kesalahan saat mengambil data pesanan');
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100 border-yellow-200',
          text: 'Menunggu Pembayaran', 
          icon: Clock 
        };
      case 'confirmed':
      case 'paid':
        return { 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-100 border-blue-200',
          text: 'Dikonfirmasi', 
          icon: CheckCircle 
        };
      case 'processing':
        return { 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-100 border-purple-200',
          text: 'Diproses', 
          icon: Package 
        };
      case 'shipped':
        return { 
          color: 'text-indigo-600', 
          bgColor: 'bg-indigo-100 border-indigo-200',
          text: 'Dikirim', 
          icon: Truck 
        };
      case 'delivered':
        return { 
          color: 'text-green-600', 
          bgColor: 'bg-green-100 border-green-200',
          text: 'Selesai', 
          icon: MapPin 
        };
      case 'cancelled':
        return { 
          color: 'text-red-600', 
          bgColor: 'bg-red-100 border-red-200',
          text: 'Dibatalkan', 
          icon: XCircle 
        };
      default:
        return { 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100 border-gray-200',
          text: status, 
          icon: Package 
        };
    }
  };

  const getPaymentStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return { 
          color: 'text-green-600', 
          bgColor: 'bg-green-100 border-green-200',
          text: 'Lunas' 
        };
      case 'pending':
        return { 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100 border-yellow-200',
          text: 'Menunggu' 
        };
      case 'failed':
        return { 
          color: 'text-red-600', 
          bgColor: 'bg-red-100 border-red-200',
          text: 'Gagal' 
        };
      default:
        return { 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100 border-gray-200',
          text: status 
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
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTrackOrder = (trackingPin: string) => {
    navigate('/track-order', { 
      state: { preFilledPin: trackingPin } 
    });
  };

  const handleViewDetails = (order: OrderHistory) => {
    // Bisa navigate ke detail order page atau show modal
    alert(`Detail pesanan ${order.order_number}\n\nStatus: ${order.status}\nTotal: ${formatPrice(order.total_amount)}\nPIN: ${order.tracking_pin}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Riwayat Pemesanan</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cek semua pesanan Anda dengan memasukkan alamat email yang digunakan saat checkout
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <form onSubmit={handleSearchOrders} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Masukkan alamat email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                {loading ? 'Mencari...' : 'Cari Pesanan'}
              </button>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Tips */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm text-center">
                💡 Pastikan email yang dimasukkan sama dengan yang digunakan saat checkout. 
                Semua pesanan dengan email tersebut akan ditampilkan.
              </p>
            </div>
          </div>

          {/* Results */}
          {searched && (
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Results Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Hasil Pencarian
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {orders.length} pesanan ditemukan untuk email: <span className="font-medium">{email}</span>
                    </p>
                  </div>
                  {orders.length > 0 && (
                    <button
                      onClick={() => navigate('/track-order')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Lacak Pesanan
                    </button>
                  )}
                </div>
              </div>

              {/* Orders List */}
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat data pesanan...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada pesanan ditemukan</h3>
                    <p className="text-gray-600 mb-6">
                      Tidak ditemukan pesanan dengan email <span className="font-medium">{email}</span>
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>• Pastikan email yang dimasukkan benar</p>
                      <p>• Cek kembali email untuk konfirmasi pesanan</p>
                      <p>• Hubungi customer service jika perlu bantuan</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusInfo = getStatusInfo(order.status);
                      const paymentInfo = getPaymentStatusInfo(order.payment_status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Order Info */}
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                                <h3 className="font-semibold text-gray-800 text-lg">
                                  #{order.order_number}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.bgColor} ${statusInfo.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusInfo.text}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${paymentInfo.bgColor} ${paymentInfo.color}`}>
                                    <DollarSign className="w-3 h-3" />
                                    {paymentInfo.text}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>{formatDate(order.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-gray-400" />
                                  <span>{order.items_count} item</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-gray-400" />
                                  <span className="font-semibold text-gray-800">{formatPrice(order.total_amount)}</span>
                                </div>
                              </div>

                              {order.tracking_pin && (
                                <div className="mt-3 flex items-center gap-2 text-sm">
                                  <span className="text-gray-500">PIN Tracking:</span>
                                  <code className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-800">
                                    {order.tracking_pin}
                                  </code>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-2">
                              {order.tracking_pin && (
                                <button
                                  onClick={() => handleTrackOrder(order.tracking_pin)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                  <Truck className="w-4 h-4" />
                                  Lacak
                                </button>
                              )}
                              <button
                                onClick={() => handleViewDetails(order)}
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Detail
                              </button>
                            </div>
                          </div>

                          {/* Shipping Info */}
                          {order.shipped_at && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600">
                                📦 Dikirim pada: {formatDate(order.shipped_at)}
                              </p>
                            </div>
                          )}
                          {order.delivered_at && (
                            <div className="mt-1">
                              <p className="text-sm text-green-600">
                                ✅ Sampai pada: {formatDate(order.delivered_at)}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Section */}
          {!searched && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-blue-800 mb-3">Informasi Penting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Semua pesanan akan ditampilkan berdasarkan email
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Gunakan PIN tracking untuk melacak pengiriman
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Status pembayaran dan pengiriman update real-time
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Hubungi kami jika ada pertanyaan
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderHistory;