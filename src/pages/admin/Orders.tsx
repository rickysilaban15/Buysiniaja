// pages/admin/Orders.tsx (Updated)
import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Package, Truck, CheckCircle, X, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  product_name: string;
  product_id?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  tracking_pin?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address: string;
  customer_city?: string;
  customer_postal_code?: string;
  customer_province?: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  payment_method?: string;
  payment_status: string;
  payment_reference?: string;
  shipping_method?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  logo_url: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  logo_url: string;
}

// Komponen ImageWithFallback untuk handle error gambar
const ImageWithFallback = ({ 
  src, 
  alt, 
  className, 
  fallback = <Package className="w-6 h-6 text-gray-400" />
}: { 
  src: string; 
  alt: string; 
  className: string; 
  fallback?: React.ReactNode;
}) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center rounded border ${className}`}>
        {fallback}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
    />
  );
};

// TAMBAHKAN FUNGSI-FUNGSI INI SEBELUM COMPONENT
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
    case 'paid':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-purple-100 text-purple-800';
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800';
    case 'delivered':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'Menunggu';
    case 'confirmed':
      return 'Dikonfirmasi';
    case 'processing':
      return 'Diproses';
    case 'shipped':
      return 'Dikirim';
    case 'delivered':
      return 'Selesai';
    case 'cancelled':
      return 'Dibatalkan';
    case 'paid':
      return 'Dibayar';
    default:
      return status;
  }
};

const getPaymentStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'Belum Bayar';
    case 'paid':
      return 'Sudah Bayar';
    case 'failed':
      return 'Gagal';
    case 'expired':
      return 'Kadaluarsa';
    default:
      return status;
  }
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productImages, setProductImages] = useState<{[key: string]: string}>({});
  
  // TAMBAHKAN STATE UNTUK PAYMENT DAN SHIPPING METHODS
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPaymentAndShippingMethods();
    fetchOrders();
    setupRealtimeSubscription();
  }, []);

  // FUNGSI BARU: Fetch payment dan shipping methods
  const fetchPaymentAndShippingMethods = async () => {
    try {
      console.log('🔄 Fetching payment and shipping methods for admin...');
      
      // Fetch payment methods
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (paymentError) {
        console.error('❌ Error fetching payment methods:', paymentError);
        return;
      }

      // Fetch shipping methods
      const { data: shippingData, error: shippingError } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (shippingError) {
        console.error('❌ Error fetching shipping methods:', shippingError);
        return;
      }

      console.log('✅ Payment methods loaded:', paymentData?.length);
      console.log('✅ Shipping methods loaded:', shippingData?.length);

      setPaymentMethods(paymentData || []);
      setShippingMethods(shippingData || []);
    } catch (error) {
      console.error('❌ Error fetching methods:', error);
    }
  };

  // FUNGSI BARU: Dapatkan nama payment method dari ID
  const getPaymentMethodName = (paymentMethodId: string) => {
    if (!paymentMethodId) return 'Tidak tersedia';
    
    const method = paymentMethods.find(m => m.id === paymentMethodId);
    return method?.name || paymentMethodId;
  };

  // FUNGSI BARU: Dapatkan nama shipping method dari ID
  const getShippingMethodName = (shippingMethodId: string) => {
    if (!shippingMethodId) return 'Tidak tersedia';
    
    const method = shippingMethods.find(m => m.id === shippingMethodId);
    return method?.name || shippingMethodId;
  };

  // Fungsi untuk fetch gambar produk berdasarkan product_id
  const fetchProductImages = async (items: OrderItem[]) => {
    try {
      const productIds = items
        .filter(item => item.product_id)
        .map(item => item.product_id) as string[];
      
      if (productIds.length === 0) return;

      const { data: products, error } = await supabase
        .from('products')
        .select('id, featured_image, images')
        .in('id', productIds);

      if (error) throw error;

      const imageMap: {[key: string]: string} = {};
      
      products?.forEach((product) => {
        imageMap[product.id] = product.featured_image || 
                             (product.images && product.images[0]) || 
                             '';
      });

      setProductImages(prev => ({ ...prev, ...imageMap }));
    } catch (error) {
      console.error('Error fetching product images:', error);
    }
  };

  // Fungsi untuk fetch gambar produk berdasarkan nama produk (fallback)
  const fetchProductImagesByName = async (items: OrderItem[]) => {
    try {
      const productNames = items.map(item => item.product_name);
      
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, featured_image, images')
        .in('name', productNames);

      if (error) throw error;

      const imageMap: {[key: string]: string} = {};
      products?.forEach((product) => {
        const matchingItem = items.find(item => 
          item.product_name.toLowerCase() === product.name.toLowerCase()
        );
        if (matchingItem && matchingItem.id) {
          imageMap[matchingItem.id] = product.featured_image || 
                                    (product.images && product.images[0]) || 
                                    '';
        }
      });

      setProductImages(prev => ({ ...prev, ...imageMap }));
    } catch (error) {
      console.error('Error fetching product images by name:', error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          const items = itemsData || [];

          // Fetch product images untuk items ini
          if (items.length > 0) {
            await fetchProductImages(items);
            // Juga coba fetch by name sebagai fallback
            await fetchProductImagesByName(items);
          }

          return {
            ...order,
            items: items
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Gagal memuat data pesanan');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Orders realtime update:', payload);
          fetchOrders(); // Refresh data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, ...updateData }
          : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updateData } : null);
      }

    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Gagal update status pesanan');
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, payment_status: paymentStatus }
          : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, payment_status: paymentStatus } : null);
      }

    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Gagal update status pembayaran');
    }
  };

  const viewOrderDetails = async (order: Order) => {
    // Refresh order items before showing details
    try {
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      const items = itemsData || [];

      // Fetch product images untuk items yang dipilih
      if (items.length > 0) {
        await fetchProductImages(items);
        await fetchProductImagesByName(items);
      }

      setSelectedOrder({
        ...order,
        items: items
      });
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching order items:', error);
      setSelectedOrder(order);
      setShowDetailModal(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.customer_phone.includes(searchTerm) ||
      (order.tracking_pin && order.tracking_pin.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.payment_status === filterPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Kelola Pesanan</h1>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                Total: {orders.length} pesanan
              </p>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh Data
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari nomor order, nama, email, telepon, atau PIN tracking..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="confirmed">Dikonfirmasi</option>
                <option value="processing">Diproses</option>
                <option value="shipped">Dikirim</option>
                <option value="delivered">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Pembayaran</option>
                <option value="pending">Belum Bayar</option>
                <option value="paid">Sudah Bayar</option>
                <option value="failed">Gagal</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Bayar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking PIN
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                      {/* PERBAIKAN: Gunakan fungsi getPaymentMethodName */}
                      <div className="text-sm text-gray-500">{getPaymentMethodName(order.payment_method || '')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_phone}</div>
                      <div className="text-sm text-gray-500">{order.customer_city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Menunggu</option>
                        <option value="confirmed">Dikonfirmasi</option>
                        <option value="processing">Diproses</option>
                        <option value="shipped">Dikirim</option>
                        <option value="delivered">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.payment_status}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${getPaymentStatusColor(order.payment_status)}`}
                      >
                        <option value="pending">Belum Bayar</option>
                        <option value="paid">Sudah Bayar</option>
                        <option value="failed">Gagal</option>
                      </select>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-900">{order.tracking_pin || '-'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} dari {filteredOrders.length} pesanan
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Detail Pesanan</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-600 mt-2">{selectedOrder.order_number}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informasi Pelanggan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedOrder.customer_phone}</span>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                  )}
                  <div className="flex items-center md:col-span-2">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedOrder.customer_address}, {selectedOrder.customer_city}, {selectedOrder.customer_province} {selectedOrder.customer_postal_code}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Items Pesanan</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => {
                    const productImage = productImages[item.id] || 
                                       productImages[item.product_id || ''] || 
                                       item.product_image;
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <ImageWithFallback 
                            src={productImage || ''}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded border"
                            fallback={<Package className="w-8 h-8 text-gray-400" />}
                          />
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-sm text-gray-500">{formatCurrency(item.unit_price)}/item</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.total_price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim:</span>
                    <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                  </div>
                  {selectedOrder.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Pajak:</span>
                      <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informasi Pembayaran</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Status:</strong> <span className={getPaymentStatusColor(selectedOrder.payment_status)}>{getPaymentStatusText(selectedOrder.payment_status)}</span></p>
                    {/* PERBAIKAN: Gunakan fungsi getPaymentMethodName */}
                    <p><strong>Metode:</strong> {getPaymentMethodName(selectedOrder.payment_method || '')}</p>
                    {selectedOrder.payment_reference && (
                      <p><strong>Referensi:</strong> {selectedOrder.payment_reference}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informasi Pengiriman</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Status:</strong> <span className={getStatusColor(selectedOrder.status)}>{getStatusText(selectedOrder.status)}</span></p>
                    {/* PERBAIKAN: Gunakan fungsi getShippingMethodName */}
                    <p><strong>Kurir:</strong> {getShippingMethodName(selectedOrder.shipping_method || '')}</p>
                    {selectedOrder.tracking_pin && (
                      <p><strong>Tracking PIN:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{selectedOrder.tracking_pin}</code></p>
                    )}
                    {selectedOrder.shipped_at && (
                      <p><strong>Dikirim pada:</strong> {formatDate(selectedOrder.shipped_at)}</p>
                    )}
                    {selectedOrder.delivered_at && (
                      <p><strong>Selesai pada:</strong> {formatDate(selectedOrder.delivered_at)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Catatan</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;