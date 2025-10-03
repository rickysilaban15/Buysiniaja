// pages/OrderConfirmation.tsx - Improved
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Copy, MapPin, Truck, Package, User, Mail, Phone, MapPin as MapIcon, Download, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface OrderData {
  orderId: string;
  orderNumber: string;
  trackingPin: string;
  total: number;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  customer?: {
    nama: string;
    email: string;
    telepon: string;
    alamat: string;
    kota: string;
    provinsi: string;
    kodePos: string;
  };
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (location.state?.orderData) {
      console.log('Order data received:', location.state.orderData);
      setOrderData(location.state.orderData);
    } else {
      // Fallback logic tetap sama
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('order_id');
      
      if (orderId) {
        setOrderData({ 
          orderId, 
          orderNumber: orderId,
          trackingPin: '',
          total: 0,
          status: 'paid',
          paymentMethod: 'Unknown'
        });
      }
    }
  }, [location]);

  // Fungsi untuk navigasi ke halaman invoice
  const handleViewInvoice = () => {
    if (orderData) {
      navigate('/invoice', {
        state: {
          orderData: orderData
        }
      });
    }
  };

  // Fungsi untuk download PDF
  const handleDownloadPDF = () => {
    if (orderData) {
      // Untuk sementara navigasi ke halaman invoice dengan mode print
      navigate('/invoice', {
        state: {
          orderData: orderData,
          autoPrint: true
        }
      });
    }
  };
  const copyToClipboard = (text: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { color: 'text-yellow-600', text: 'Menunggu Pembayaran', step: 1 };
      case 'confirmed':
      case 'paid':
        return { color: 'text-blue-600', text: 'Pesanan Dikonfirmasi', step: 2 };
      case 'processing':
        return { color: 'text-purple-600', text: 'Sedang Diproses', step: 3 };
      case 'shipped':
        return { color: 'text-indigo-600', text: 'Sedang Dikirim', step: 4 };
      case 'delivered':
        return { color: 'text-green-600', text: 'Pesanan Sampai', step: 5 };
      default:
        return { color: 'text-gray-600', text: status, step: 1 };
    }
  };

  const statusInfo = orderData ? getStatusInfo(orderData.status) : null;

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data pesanan...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Pembayaran Berhasil!
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Terima kasih telah berbelanja di Buysini. Pesanan Anda sedang diproses dan akan segera dikirim.
            </p>
            
            {/* Order Number */}
            <div className="bg-white inline-flex items-center gap-4 px-6 py-3 rounded-lg border border-gray-200 shadow-sm">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <p className="text-sm text-gray-600">Nomor Pesanan</p>
                <p className="text-lg font-bold text-gray-800">{orderData?.orderNumber}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Order & Tracking Info */}
            <div className="xl:col-span-2 space-y-6">
              {/* Tracking PIN - PRIORITAS UTAMA */}
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Kode Tracking Pesanan</h2>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                {orderData.trackingPin ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                    <p className="text-blue-700 text-lg font-medium mb-4 text-center">
                      Simpan PIN ini untuk melacak pesanan Anda:
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <code className="text-4xl font-bold text-blue-800 tracking-wider font-mono bg-white px-6 py-4 rounded-lg border-2 border-blue-300">
                        {orderData.trackingPin}
                      </code>
                      <button
                        onClick={() => copyToClipboard(orderData.trackingPin)}
                        className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-3 min-w-[140px] justify-center"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Tersalin!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            Salin PIN
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-blue-600 text-center mt-4 text-sm">
                      Gunakan PIN ini di halaman "Lacak Pesanan" untuk melihat status terbaru
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-700">
                      PIN tracking sedang diproses. Silakan refresh halaman atau cek email Anda.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="flex items-center mb-6">
                  <ShoppingBag className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Detail Pesanan</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">No. Pesanan:</span>
                      <span className="font-bold text-gray-800">{orderData?.orderNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <span className={`font-bold ${getStatusInfo(orderData?.status || '').color}`}>
                        {getStatusInfo(orderData?.status || '').text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {orderData?.paymentMethod && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Metode Bayar:</span>
                        <span className="font-bold text-gray-800">{orderData.paymentMethod}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Total:</span>
                      <span className="font-bold text-blue-600 text-xl">
                        {formatPrice(orderData?.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* TOMBOL INVOICE BARU */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleViewInvoice}
                      className="flex-1 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg flex items-center justify-center gap-3"
                    >
                      <FileText className="w-6 h-6" />
                      Lihat Invoice
                    </button>
                    
                    <button
                      onClick={handleDownloadPDF}
                      className="flex-1 border-2 border-green-600 text-green-600 py-4 rounded-xl hover:bg-green-50 transition-colors font-bold text-lg flex items-center justify-center gap-3"
                    >
                      <Download className="w-6 h-6" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              {orderData.customer && (
                <div className="bg-white rounded-xl shadow-sm border p-8">
                  <div className="flex items-center mb-6">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Informasi Pelanggan</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Nama</p>
                          <p className="font-semibold text-gray-800">{orderData.customer.nama}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-800">{orderData.customer.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Telepon</p>
                          <p className="font-semibold text-gray-800">{orderData.customer.telepon}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Alamat</p>
                          <p className="font-semibold text-gray-800">{orderData.customer.alamat}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Actions & Next Steps */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-6">Aksi Cepat</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/track-order')}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg flex items-center justify-center gap-3"
                  >
                    <Truck className="w-6 h-6" />
                    Lacak Pesanan
                  </button>
                  
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full border-2 border-blue-600 text-blue-600 py-4 rounded-xl hover:bg-blue-50 transition-colors font-bold text-lg flex items-center justify-center gap-3"
                  >
                    <ShoppingBag className="w-6 h-6" />
                    Lanjut Belanja
                  </button>

                  {orderData?.trackingPin && (
                    <button
                      onClick={() => copyToClipboard(orderData.trackingPin)}
                      className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Copy className="w-5 h-5" />
                      Salin PIN Tracking
                    </button>
                  )}
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-bold text-blue-800 text-lg mb-4">📦 Informasi Pengiriman</h4>
                <ul className="text-blue-700 space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Pesanan akan diproses dalam 1-2 hari kerja</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Estimasi pengiriman 2-5 hari kerja</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>No HP kurir akan dikirim via WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Gunakan PIN tracking untuk monitor status</span>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h4 className="font-bold text-yellow-800 text-lg mb-3">🛟 Butuh Bantuan?</h4>
                <div className="text-yellow-700 space-y-2 text-sm">
                  <p>Customer Service:</p>
                  <p className="font-semibold">📞 +62 812-3456-789</p>
                  <p className="font-semibold">✉️ help@buysini.com</p>
                  <p className="text-xs mt-3">Senin - Minggu, 08:00 - 22:00 WIB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;