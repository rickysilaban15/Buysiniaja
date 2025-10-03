import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, User, MapPin, Phone, Mail, Calendar, Package, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
  province?: string;
  created_at: string;
  updated_at: string;
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
}

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    province: '',
  });

  // Fetch real data from Supabase
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Fetch customers dari database
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      // Fetch order statistics untuk setiap customer
      const customersWithStats = await Promise.all(
        (customersData || []).map(async (customer) => {
          // Get orders count dan total spent
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('id, total_amount, created_at, payment_status')
            .eq('customer_id', customer.id)
            .eq('payment_status', 'paid');

          if (ordersError) {
            console.error('Error fetching orders for customer:', customer.id, ordersError);
            return {
              ...customer,
              total_orders: 0,
              total_spent: 0,
              last_order_date: null
            };
          }

          const totalOrders = ordersData?.length || 0;
          const totalSpent = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
          const lastOrder = ordersData?.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];

          return {
            ...customer,
            total_orders: totalOrders,
            total_spent: totalSpent,
            last_order_date: lastOrder?.created_at || null
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('Gagal memuat data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      try {
        // Update customer di database
        const { error } = await supabase
          .from('customers')
          .update({
            full_name: formData.full_name,
            email: formData.email || null,
            phone: formData.phone,
            address: formData.address || null,
            city: formData.city || null,
            postal_code: formData.postal_code || null,
            province: formData.province || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCustomer.id);

        if (error) throw error;

        // Refresh data
        await fetchCustomers();
        alert('Data pelanggan berhasil diperbarui!');

      } catch (error: any) {
        console.error('Error updating customer:', error);
        alert('Gagal memperbarui data pelanggan: ' + error.message);
      }
    }

    resetForm();
    setShowEditModal(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      full_name: customer.full_name,
      email: customer.email || '',
      phone: customer.phone,
      address: customer.address || '',
      city: customer.city || '',
      postal_code: customer.postal_code || '',
      province: customer.province || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    const customer = customers.find(c => c.id === id);
    
    // Cek apakah customer memiliki pesanan
    if (customer && customer.total_orders && customer.total_orders > 0) {
      alert('Tidak dapat menghapus pelanggan yang memiliki riwayat pesanan.');
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
      try {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Update state
        setCustomers(customers.filter(c => c.id !== id));
        alert('Pelanggan berhasil dihapus!');

      } catch (error: any) {
        console.error('Error deleting customer:', error);
        alert('Gagal menghapus pelanggan: ' + error.message);
      }
    }
  };

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postal_code: '',
      province: '',
    });
    setEditingCustomer(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Belum ada pesanan';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.city && customer.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.province && customer.province.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  // Calculate statistics
  const totalCustomers = customers.length;
  const newThisMonth = customers.filter(c => {
    const created = new Date(c.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;
  const withEmail = customers.filter(c => c.email).length;
  const uniqueCities = new Set(customers.filter(c => c.city).map(c => c.city)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Kelola Pelanggan</h1>
                <p className="text-gray-600 mt-1">
                  Data real dari database - {totalCustomers} pelanggan terdaftar
                </p>
              </div>
              
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari nama, telepon, email, atau kota..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Pelanggan</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Pelanggan Baru (Bulan Ini)</p>
                    <p className="text-2xl font-bold text-gray-900">{newThisMonth}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Dengan Email</p>
                    <p className="text-2xl font-bold text-gray-900">{withEmail}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Kota Terdaftar</p>
                    <p className="text-2xl font-bold text-gray-900">{uniqueCities}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bergabung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.full_name}</div>
                          <div className="text-sm text-gray-500">ID: {customer.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Phone size={14} />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Mail size={14} />
                          {customer.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{customer.city || 'Tidak diketahui'}</div>
                      <div className="text-sm text-gray-500">{customer.province || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Package size={14} />
                        {customer.total_orders || 0} pesanan
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <DollarSign size={14} />
                        {customer.total_spent ? formatCurrency(customer.total_spent) : 'Rp 0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewCustomerDetails(customer)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedCustomers.length === 0 && (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pelanggan</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada pelanggan terdaftar'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} dari {filteredCustomers.length} pelanggan
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Detail Pelanggan
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User size={20} />
                    Informasi Personal
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Nama Lengkap:</span>
                      <div className="font-medium">{selectedCustomer.full_name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone size={14} />
                        Telepon:
                      </span>
                      <div className="font-medium">{selectedCustomer.phone}</div>
                    </div>
                    {selectedCustomer.email && (
                      <div>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail size={14} />
                          Email:
                        </span>
                        <div className="font-medium">{selectedCustomer.email}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar size={14} />
                        Bergabung:
                      </span>
                      <div className="font-medium">{formatDate(selectedCustomer.created_at)}</div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin size={20} />
                    Informasi Alamat
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Alamat:</span>
                      <div className="font-medium">
                        {selectedCustomer.address || 'Tidak ada data'}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Kota:</span>
                      <div className="font-medium">{selectedCustomer.city || 'Tidak diketahui'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Kode Pos:</span>
                      <div className="font-medium">{selectedCustomer.postal_code || 'Tidak ada'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Provinsi:</span>
                      <div className="font-medium">{selectedCustomer.province || 'Tidak diketahui'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Statistics */}
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Statistik Pesanan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCustomer.total_orders || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Pesanan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedCustomer.total_spent ? formatCurrency(selectedCustomer.total_spent) : 'Rp 0'}
                    </div>
                    <div className="text-sm text-gray-600">Total Pembelian</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedCustomer.total_spent && selectedCustomer.total_orders 
                        ? formatCurrency(selectedCustomer.total_spent / selectedCustomer.total_orders)
                        : 'Rp 0'}
                    </div>
                    <div className="text-sm text-gray-600">Rata-rata per Order</div>
                  </div>
                </div>
                {selectedCustomer.last_order_date && (
                  <div className="mt-4 text-center">
                    <span className="text-sm text-gray-600">Pesanan Terakhir: </span>
                    <span className="font-medium">{formatDate(selectedCustomer.last_order_date)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedCustomer);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telepon *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCustomer ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;