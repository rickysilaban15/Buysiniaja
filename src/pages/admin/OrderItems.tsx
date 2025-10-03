import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash2, Search, Filter, 
  Eye, MoreVertical, ShoppingCart, DollarSign, Hash, Calendar,
  User, Phone, Mail, ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  order_id: string;
  order_number: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

const AdminOrderItems: React.FC = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'orders' | 'items'>('orders');
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    order_id: '',
    product_name: '',
    product_image: '',
    quantity: 1,
    unit_price: 0,
  });

  useEffect(() => {
    fetchData();
    setupRealtimeSubscription();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          orders (
            order_number,
            customer_name,
            status,
            payment_status
          )
        `)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      const transformedItems: OrderItem[] = (itemsData || []).map(item => ({
        id: item.id,
        order_id: item.order_id,
        order_number: item.orders?.order_number || 'Unknown',
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setOrders(ordersData || []);
      setOrderItems(transformedItems);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal memuat data item pesanan');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('order-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        (payload) => {
          console.log('Order items realtime update:', payload);
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Orders realtime update:', payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const total_price = formData.quantity * formData.unit_price;
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('order_items')
          .update({
            product_name: formData.product_name,
            product_image: formData.product_image || null,
            quantity: formData.quantity,
            unit_price: formData.unit_price,
            total_price: total_price,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;

      } else {
        const { error } = await supabase
          .from('order_items')
          .insert({
            order_id: formData.order_id,
            product_name: formData.product_name,
            product_image: formData.product_image || null,
            quantity: formData.quantity,
            unit_price: formData.unit_price,
            total_price: total_price
          });

        if (error) throw error;
      }

      await fetchData();
      resetForm();
      setShowModal(false);
      alert(editingItem ? 'Item berhasil diupdate!' : 'Item berhasil ditambahkan!');

    } catch (error) {
      console.error('Error saving order item:', error);
      alert('Gagal menyimpan item pesanan');
    }
  };

  const handleEdit = (item: OrderItem) => {
    setEditingItem(item);
    setFormData({
      order_id: item.order_id,
      product_name: item.product_name,
      product_image: item.product_image || '',
      quantity: item.quantity,
      unit_price: item.unit_price,
    });
    setShowModal(true);
    setShowActionsMenu(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus item pesanan ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchData();
      alert('Item berhasil dihapus!');
      setShowActionsMenu(null);

    } catch (error) {
      console.error('Error deleting order item:', error);
      alert('Gagal menghapus item pesanan');
    }
  };

  const resetForm = () => {
    setFormData({
      order_id: '',
      product_name: '',
      product_image: '',
      quantity: 1,
      unit_price: 0,
    });
    setEditingItem(null);
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
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPaymentStatusText = (status: string) => {
    const texts = {
      pending: 'Unpaid',
      paid: 'Paid',
      failed: 'Failed',
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Filter data
  const filteredItems = orderItems.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrder = selectedOrder === 'all' || item.order_id === selectedOrder;
    return matchesSearch && matchesOrder;
  });

  const filteredOrders = orders.filter(order => {
    const orderItemsCount = orderItems.filter(item => item.order_id === order.id).length;
    return orderItemsCount > 0 || searchTerm === '';
  });

  // Statistics
  const totalItems = filteredItems.length;
  const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = filteredItems.reduce((sum, item) => sum + item.total_price, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (showOrderDetails) {
    const orderData = orders.find(o => o.id === showOrderDetails);
    const orderItemsData = orderItems.filter(item => item.order_id === showOrderDetails);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowOrderDetails(null)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-800">
                    {orderData?.order_number}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {orderData?.customer_name} • {orderItemsData.length} items
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFormData({...formData, order_id: showOrderDetails});
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span>{orderData?.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span>{orderData?.customer_phone}</span>
                </div>
                {orderData?.customer_email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate">{orderData.customer_email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{orderData ? formatDate(orderData.created_at) : '-'}</span>
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(orderData?.status || '')}`}>
                  {getStatusText(orderData?.status || '')}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(orderData?.payment_status || '')}`}>
                  {getPaymentStatusText(orderData?.payment_status || '')}
                </span>
              </div>
            </div>

            {/* Items Grid */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orderItemsData.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=Item';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.product_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {item.quantity}x
                            </span>
                            <span className="text-xs font-medium text-blue-600">
                              {formatCurrency(item.unit_price)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowActionsMenu(showActionsMenu === item.id ? null : item.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {showActionsMenu === item.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={() => handleEdit(item)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 first:rounded-t-lg last:rounded-b-lg"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {formatDate(item.created_at)}
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(item.total_price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {orderItemsData.length === 0 && (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2 text-gray-500">No items in this order</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-gray-700" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Order Items</h1>
                  <p className="text-gray-600 text-sm">
                    {orders.length} orders • {orderItems.length} items
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveView('orders')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeView === 'orders' 
                        ? 'bg-white text-gray-800 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveView('items')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeView === 'items' 
                        ? 'bg-white text-gray-800 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Items
                  </button>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products or order numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 h-4 w-4" />
                <select
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Orders</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.order_number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
                <div className="text-xs text-gray-500">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalQuantity}</div>
                <div className="text-xs text-gray-500">Total Qty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalValue)}
                </div>
                <div className="text-xs text-gray-500">Total Value</div>
              </div>
            </div>
          </div>

          {/* Content based on active view */}
          {activeView === 'orders' ? (
            /* Orders View - Compact Cards */
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOrders.map(order => {
                  const orderItemCount = orderItems.filter(item => item.order_id === order.id).length;
                  const orderItemsTotal = orderItems
                    .filter(item => item.order_id === order.id)
                    .reduce((sum, item) => sum + item.total_price, 0);
                  
                  return (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono mb-2 block">
                            {order.order_number}
                          </code>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {order.customer_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {orderItemCount} items • {formatCurrency(orderItemsTotal)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
                          {getPaymentStatusText(order.payment_status)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowOrderDetails(order.id)}
                          className="flex-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye size={12} />
                          View
                        </button>
                        <button
                          onClick={() => {
                            setFormData({...formData, order_id: order.id});
                            setShowModal(true);
                          }}
                          className="flex-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus size={12} />
                          Add Item
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Items View - Compact List */
            <div className="p-4">
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const order = orders.find(o => o.id === item.order_id);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/40x40/e5e7eb/9ca3af?text=Item';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {item.product_name}
                            </h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {item.quantity}x
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Hash size={12} />
                              {item.order_number}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={12} />
                              {formatCurrency(item.total_price)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2 text-gray-500">
                    {searchTerm || selectedOrder !== 'all' 
                      ? 'No matching items found'
                      : 'No order items yet'
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

     
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">
          {editingItem ? 'Edit Item' : 'Tambah Item Baru'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Order Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Pesanan *
          </label>
          <select
            value={formData.order_id}
            onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            required
            disabled={!!editingItem} // Disable jika sedang edit
          >
            <option value="">Pilih pesanan...</option>
            {orders.map(order => (
              <option key={order.id} value={order.id}>
                {order.order_number} - {order.customer_name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Produk *
          </label>
          <input
            type="text"
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Masukkan nama produk"
            required
          />
        </div>

        {/* Product Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Gambar Produk (Opsional)
          </label>
          <input
            type="url"
            value={formData.product_image}
            onChange={(e) => setFormData({ ...formData, product_image: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Quantity and Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga Satuan *
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>
        </div>

        {/* Preview Total */}
        {formData.quantity > 0 && formData.unit_price > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <div className="font-medium">Preview:</div>
              <div className="mt-1">
                {formData.quantity} × {formatCurrency(formData.unit_price)} = {' '}
                <span className="font-bold">{formatCurrency(formData.quantity * formData.unit_price)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {editingItem ? 'Update Item' : 'Tambah Item'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminOrderItems;