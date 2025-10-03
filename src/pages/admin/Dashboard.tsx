import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart 
} from 'recharts';
import { 
  Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, 
  Eye, Calendar, Clock, AlertCircle, CheckCircle, Star, Award,
  ArrowUpRight, ArrowDownRight, Activity, Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  ordersGrowth: number;
  revenueGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: string;
  date: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image: string;
}

interface SalesDataPoint {
  name: string;
  orders: number;
  revenue: number;
  date: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  count: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    ordersGrowth: 0,
    revenueGrowth: 0,
    customersGrowth: 0,
    productsGrowth: 0
  });

  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    today: 0
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  // Fetch Order Statistics
  const fetchOrderStats = async () => {
    try {
      // Total orders
      const { count: total } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Pending orders
      const { count: pending } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Paid orders
      const { count: paid } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'paid');

      // Today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setOrderStats({
        total: total || 0,
        pending: pending || 0,
        paid: paid || 0,
        today: todayCount || 0
      });
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  // Fetch Dashboard Statistics
  const fetchDashboardStats = async () => {
    try {
      const now = new Date();
      const daysAgo = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const lastPeriodStart = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Total Orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Total Orders Previous Period
      const { count: prevOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastPeriodStart.toISOString())
        .lt('created_at', startDate.toISOString());

      // Total Revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', startDate.toISOString())
        .neq('status', 'cancelled');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;

      // Previous Period Revenue
      const { data: prevRevenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', lastPeriodStart.toISOString())
        .lt('created_at', startDate.toISOString())
        .neq('status', 'cancelled');

      const prevRevenue = prevRevenueData?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;

      // Total Products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // New Products
      const { count: newProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Total Customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // New Customers
      const { count: newCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Calculate growth percentages
      const ordersGrowth = prevOrders ? ((totalOrders! - prevOrders) / prevOrders) * 100 : 0;
      const revenueGrowth = prevRevenue ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      const customersGrowth = newCustomers ? (newCustomers / (totalCustomers! || 1)) * 100 : 0;
      const productsGrowth = newProducts ? (newProducts / (totalProducts! || 1)) * 100 : 0;

      setStats({
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        totalCustomers: totalCustomers || 0,
        totalRevenue,
        ordersGrowth: Math.round(ordersGrowth * 10) / 10,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        customersGrowth: Math.round(customersGrowth * 10) / 10,
        productsGrowth: Math.round(productsGrowth * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch Recent Orders
  const fetchRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const orders: RecentOrder[] = data.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        amount: Number(order.total_amount || 0),
        status: order.status,
        date: order.created_at
      }));

      setRecentOrders(orders);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  // Fetch Top Products
  const fetchTopProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          product_id,
          product_name,
          product_image,
          quantity,
          total_price
        `);

      if (error) throw error;

      // Group by product and calculate totals
      const productMap = new Map();
      data.forEach(item => {
        const existing = productMap.get(item.product_id);
        if (existing) {
          existing.sales += item.quantity;
          existing.revenue += Number(item.total_price || 0);
        } else {
          productMap.set(item.product_id, {
            id: item.product_id,
            name: item.product_name,
            sales: item.quantity,
            revenue: Number(item.total_price || 0),
            image: item.product_image || ''
          });
        }
      });

      const products = Array.from(productMap.values())
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 3);

      setTopProducts(products);
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  // Fetch Sales Data for Chart
  const fetchSalesData = async () => {
    try {
      const now = new Date();
      const last7Days = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const { data, error } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDate.toISOString())
          .neq('status', 'cancelled');

        if (error) throw error;

        const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()];
        const orders = data.length;
        const revenue = data.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

        last7Days.push({
          name: dayName,
          orders,
          revenue,
          date: date.toISOString()
        });
      }

      setSalesData(last7Days);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  // Fetch Category Distribution
  const fetchCategoryData = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('category_id, categories(name)')
        .eq('status', 'active');

      if (error) throw error;

      const categoryMap = new Map();
      let total = 0;

      products.forEach(product => {
        const categoryName = product.categories?.name || 'Lainnya';
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
        total++;
      });

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
      const categories: CategoryData[] = Array.from(categoryMap.entries())
        .map(([name, count], index) => ({
          name,
          value: Math.round((count / total) * 100),
          color: colors[index % colors.length],
          count
        }))
        .sort((a, b) => b.count - a.count);

      setCategoryData(categories);
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };

  // Setup Realtime Subscriptions
  useEffect(() => {
    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchDashboardStats();
          fetchRecentOrders();
          fetchSalesData();
          fetchOrderStats();
        }
      )
      .subscribe();

    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchDashboardStats();
          fetchCategoryData();
        }
      )
      .subscribe();

    const orderItemsChannel = supabase
      .channel('order-items-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => {
          fetchTopProducts();
        }
      )
      .subscribe();

    const customersChannel = supabase
      .channel('customers-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          fetchDashboardStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(orderItemsChannel);
      supabase.removeChannel(customersChannel);
    };
  }, [dateRange]);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentOrders(),
        fetchTopProducts(),
        fetchSalesData(),
        fetchCategoryData(),
        fetchOrderStats()
      ]);
    };

    loadData();
  }, [dateRange]);

  // Auth Check
  useEffect(() => {
    const checkAuth = () => {
      const adminData = localStorage.getItem('admin');
      
      if (!adminData) {
        navigate('/admin/login', { replace: true });
        return;
      }

      try {
        const parsed = JSON.parse(adminData);
        if (parsed.role !== 'admin') {
          navigate('/admin/login', { replace: true });
          return;
        }
        setUser(parsed);
      } catch (error) {
        console.error('Error parsing admin data:', error);
        navigate('/admin/login', { replace: true });
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Activity className="animate-spin h-5 w-5" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Menunggu';
      case 'processing': return 'Diproses';
      case 'shipped': return 'Dikirim';
      case 'delivered': return 'Selesai';
      case 'cancelled': return 'Dibatal';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="7days">7 Hari Terakhir</option>
                <option value="30days">30 Hari Terakhir</option>
                <option value="90days">90 Hari Terakhir</option>
              </select>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {user.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
               {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Selamat datang kembali, {user.full_name || 'Admin'}
          </h2>
          <p className="text-sm text-gray-500">Berikut ringkasan performa toko Anda</p>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Order</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Lunas</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.paid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hari ini</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.today}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className={`mt-2 flex items-center text-sm ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenueGrowth >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
              {stats.revenueGrowth}% dari periode sebelumnya
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <div className={`mt-2 flex items-center text-sm ${stats.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.ordersGrowth >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
              {stats.ordersGrowth}% dari periode sebelumnya
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className={`mt-2 flex items-center text-sm ${stats.customersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.customersGrowth >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
              {stats.customersGrowth}% pertumbuhan
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className={`mt-2 flex items-center text-sm ${stats.productsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.productsGrowth >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
              {stats.productsGrowth}% produk baru
            </div>
          </div>
        </div>

        {/* Sales Chart + Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <h3 className="text-base font-medium text-gray-900 mb-4">Penjualan 7 Hari Terakhir</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Distribusi Produk</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></span>
                    <span>{cat.name}</span>
                  </div>
                  <span>{cat.count} produk</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Order Terbaru</h3>
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(order.amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Produk Terlaris</h3>
            <div className="space-y-4">
              {topProducts.map(prod => (
                <div key={prod.id} className="flex items-center space-x-4">
                  <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{prod.name}</p>
                    <p className="text-xs text-gray-500">{prod.sales} terjual</p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(prod.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

