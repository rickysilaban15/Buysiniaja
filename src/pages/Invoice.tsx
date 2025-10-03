// pages/Invoice.tsx - Halaman Invoice dengan fitur lengkap
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Download, Printer, ArrowLeft, Building, 
  User, Mail, Phone, MapPin, Package
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  product_id?: string;
}

interface InvoiceData {
  orderId: string;
  orderNumber: string;
  trackingPin: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  customer?: {
    nama: string;
    email: string;
    telepon: string;
    alamat: string;
    kota: string;
    provinsi: string;
    kodePos: string;
  };
  items?: OrderItem[];
  shippingMethod?: string;
  shippingCost?: number;
  subtotal?: number;
}

interface ProductImage {
  product_id: string;
  image_url: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  logo_url: string;
  is_active: boolean;
  sort_order: number;
}

interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  logo_url: string;
  is_active: boolean;
  sort_order: number;
  estimated_days: string;
  cost: number;
}

// Komponen ImageWithFallback
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

// Error Boundary Component
class InvoiceErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Invoice Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Terjadi Kesalahan</h2>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const InvoiceContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState<{[key: string]: string}>({});
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // State untuk payment dan shipping methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  useEffect(() => {
    const initializeInvoice = async () => {
      if (location.state?.orderData) {
        const orderData = location.state.orderData;
        // Fetch semua data sekaligus
        await Promise.all([
          fetchOrderDetails(orderData),
          fetchPaymentAndShippingMethods()
        ]);
      } else {
        navigate('/order-confirmation');
      }
    };

    initializeInvoice();
  }, [location, navigate]);

  useEffect(() => {
    if (location.state?.autoPrint && invoiceRef.current) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [invoiceData, location.state?.autoPrint]);

  // Fungsi untuk fetch payment dan shipping methods
  const fetchPaymentAndShippingMethods = async () => {
    try {
      console.log('🔄 Fetching payment and shipping methods...');
      
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
      console.log('📋 Payment methods:', paymentData);
      console.log('📋 Shipping methods:', shippingData);

      setPaymentMethods(paymentData || []);
      setShippingMethods(shippingData || []);
    } catch (error) {
      console.error('❌ Error fetching methods:', error);
    }
  };

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
        // Find matching item by product name
        const matchingItem = items.find(item => 
          item.product_name.toLowerCase() === product.name.toLowerCase()
        );
        if (matchingItem) {
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

  const fetchProductImages = async (items: OrderItem[]) => {
    try {
      const productIds = items
        .filter(item => item.product_id)
        .map(item => item.product_id) as string[];
      
      if (productIds.length === 0) {
        await fetchProductImagesByName(items);
        return;
      }

      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, featured_image, images')
        .in('id', productIds);

      if (error) throw error;

      const imageMap: {[key: string]: string} = {};
      
      // Prioritaskan featured_image, lalu images[0]
      products?.forEach((product) => {
        imageMap[product.id] = product.featured_image || 
                             (product.images && product.images[0]) || 
                             '';
      });

      setProductImages(imageMap);
      
      // Cari gambar untuk item yang belum dapat gambar
      const itemsWithoutImages = items.filter(item => 
        !imageMap[item.product_id || '']
      );
      
      if (itemsWithoutImages.length > 0) {
        await fetchProductImagesByName(itemsWithoutImages);
      }
      
    } catch (error) {
      console.error('Error fetching product images:', error);
      await fetchProductImagesByName(items);
    }
  };

  const fetchOrderDetails = async (orderData: any) => {
    try {
      // Validasi orderId
      if (!orderData?.orderId) {
        console.error('Order ID tidak ditemukan');
        navigate('/order-confirmation');
        return;
      }

      const { data: orderInfo, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          tracking_pin,
          status,
          payment_method,
          shipping_method,
          shipping_cost,
          subtotal,
          total_amount,
          created_at,
          customer_id,
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          customer_city,
          customer_postal_code,
          customer_province
        `)
        .eq('id', orderData.orderId)
        .single();

      if (orderError) throw orderError;

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('id, product_name, quantity, unit_price, total_price, product_id')
        .eq('order_id', orderData.orderId);

      if (itemsError) throw itemsError;

      const mappedItems: OrderItem[] = (itemsData || []).map(item => ({
        id: item.id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.unit_price,
        total: item.total_price,
        product_id: item.product_id
      }));

      // Fetch product images
      await fetchProductImages(mappedItems);

      // Validasi data customer
      const customerData = orderInfo ? {
        nama: orderInfo.customer_name || 'Tidak tersedia',
        email: orderInfo.customer_email || 'Tidak tersedia',
        telepon: orderInfo.customer_phone || 'Tidak tersedia',
        alamat: orderInfo.customer_address || 'Tidak tersedia',
        kota: orderInfo.customer_city || 'Tidak tersedia',
        provinsi: orderInfo.customer_province || 'Tidak tersedia',
        kodePos: orderInfo.customer_postal_code || 'Tidak tersedia',
      } : undefined;

      const completeData: InvoiceData = {
        orderId: orderInfo.id,
        orderNumber: orderInfo.order_number,
        trackingPin: orderInfo.tracking_pin,
        total: orderInfo.total_amount,
        status: orderInfo.status,
        paymentMethod: orderInfo.payment_method,
        createdAt: orderInfo.created_at,
        items: mappedItems,
        shippingMethod: orderInfo.shipping_method,
        shippingCost: orderInfo.shipping_cost,
        subtotal: orderInfo.subtotal,
        customer: customerData,
      };

      setInvoiceData(completeData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Fallback ke data dari state
      setInvoiceData({
        ...orderData,
        createdAt: new Date().toISOString(),
        items: [],
        shippingCost: 0,
        subtotal: orderData.total,
        customer: {
          nama: 'Customer',
          email: 'customer@example.com',
          telepon: '08123456789',
          alamat: 'Alamat customer',
          kota: 'Kota',
          provinsi: 'Provinsi',
          kodePos: '12345'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan info payment method dari database
  const getPaymentMethodInfo = (paymentMethodId: string) => {
    console.log('🔍 Searching payment method for ID:', paymentMethodId);
    
    if (!paymentMethodId) {
      const defaultMethod = paymentMethods.find(m => m.code === 'bank-transfer');
      return { 
        name: defaultMethod?.name || 'Bank Transfer', 
        logo: defaultMethod?.logo_url || '' 
      };
    }

    // Exact match - sekarang sudah compatible UUID
    const method = paymentMethods.find(m => m.id === paymentMethodId);
    if (method) {
      console.log('✅ Found payment method by ID:', method.name);
      return { 
        name: method.name, 
        logo: method.logo_url || '' 
      };
    }

    console.log('❌ Payment method not found, using fallback');
    // Fallback
    const firstMethod = paymentMethods[0];
    return { 
      name: firstMethod?.name || 'Payment Method', 
      logo: firstMethod?.logo_url || '' 
    };
  };

  // Fungsi untuk mendapatkan info shipping method dari database
  const getShippingMethodInfo = (shippingMethodId: string) => {
    console.log('🔍 Searching shipping method for ID:', shippingMethodId);
    
    if (!shippingMethodId) {
      const defaultMethod = shippingMethods.find(m => m.code === 'jne');
      return { 
        name: defaultMethod?.name || 'JNE', 
        logo: defaultMethod?.logo_url || '',
        estimated_days: defaultMethod?.estimated_days || '2-3 hari'
      };
    }

    // Exact match - sekarang sudah compatible UUID
    const method = shippingMethods.find(m => m.id === shippingMethodId);
    if (method) {
      console.log('✅ Found shipping method by ID:', method.name);
      return { 
        name: method.name, 
        logo: method.logo_url || '',
        estimated_days: method.estimated_days || '2-3 hari'
      };
    }

    console.log('❌ Shipping method not found, using fallback');
    // Fallback
    const firstMethod = shippingMethods[0];
    return { 
      name: firstMethod?.name || 'Shipping Method', 
      logo: firstMethod?.logo_url || '',
      estimated_days: firstMethod?.estimated_days || '2-3 hari'
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      setPdfLoading(true);
      
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const element = invoiceRef.current;
      
      // Optimasi untuk PDF
      const canvas = await html2canvas.default(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: true,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF.default('p', 'mm', 'a4');
      
      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${invoiceData?.orderNumber || 'unknown'}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal mengunduh PDF. Silakan gunakan fitur print sebagai alternatif.');
    } finally {
      setPdfLoading(false);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Debug effect
  useEffect(() => {
    if (invoiceData && paymentMethods.length > 0 && shippingMethods.length > 0) {
      console.log('🔍 INVOICE DEBUG DATA:', {
        orderPaymentMethod: invoiceData.paymentMethod,
        orderShippingMethod: invoiceData.shippingMethod,
        availablePaymentMethods: paymentMethods,
        availableShippingMethods: shippingMethods,
        foundPaymentMethod: paymentMethods.find(m => m.id === invoiceData.paymentMethod),
        foundShippingMethod: shippingMethods.find(m => m.id === invoiceData.shippingMethod)
      });

      const paymentInfo = getPaymentMethodInfo(invoiceData.paymentMethod);
      const shippingInfo = getShippingMethodInfo(invoiceData.shippingMethod || '');

      console.log('🔍 DEBUG METHOD INFO:', {
        paymentInfo,
        shippingInfo
      });
    }
  }, [invoiceData, paymentMethods, shippingMethods]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Memuat Invoice</h3>
            <p className="text-gray-600">Sedang mengambil data pesanan Anda...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Invoice Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-6">Data invoice tidak dapat ditemukan atau telah kadaluarsa.</p>
            <button
              onClick={() => navigate('/order-confirmation')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Konfirmasi Pesanan
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const paymentInfo = getPaymentMethodInfo(invoiceData.paymentMethod);
  const shippingInfo = getShippingMethodInfo(invoiceData.shippingMethod || '');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Print Controls - Hidden saat print */}
      <div className="container mx-auto px-4 py-6 no-print">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate('/order-confirmation')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Konfirmasi
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {pdfLoading ? 'Membuat PDF...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="container mx-auto px-4 py-8">
        <div ref={invoiceRef} className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border invoice-container">
          {/* Invoice Header */}
          <div className="border-b border-gray-200 p-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <ImageWithFallback 
                    src="/logobuy.png"
                    alt="Buysini Store Logo"
                    className="w-12 h-12 object-contain"
                    fallback={<Building className="w-12 h-12 text-blue-600" />}
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Buysini Store</h1>
                    <p className="text-gray-600">Invoice Pembayaran</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Kampung Tengah</p>
                  <p>Jakarta Timur, DKI Jakarta 11540</p>
                  <p>Telp: +62 878-1889-4504 | Email: info@buysini.com</p>
                </div>
              </div>
              
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">INVOICE</h2>
                <p className="text-gray-600">No: {invoiceData.orderNumber}</p>
                <p className="text-gray-600 text-sm">
                  {formatDate(invoiceData.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 border-b border-gray-200">
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informasi Pelanggan
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{invoiceData.customer?.nama}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{invoiceData.customer?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{invoiceData.customer?.telepon}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="flex-1">
                    {invoiceData.customer?.alamat}, {' '}
                    {invoiceData.customer?.kota}, {' '}
                    {invoiceData.customer?.provinsi} {' '}
                    {invoiceData.customer?.kodePos}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Informasi Pesanan
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>No. Pesanan:</span>
                  <span className="font-medium">{invoiceData.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>PIN Tracking:</span>
                  <span className="font-medium">{invoiceData.trackingPin}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <span className={`font-medium ${
                    invoiceData.status === 'completed' ? 'text-green-600' : 
                    invoiceData.status === 'pending' ? 'text-yellow-600' : 
                    invoiceData.status === 'processing' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {invoiceData.status === 'completed' ? 'Lunas' : 
                     invoiceData.status === 'pending' ? 'Menunggu Pembayaran' : 
                     invoiceData.status === 'processing' ? 'Sedang Diproses' :
                     invoiceData.status}
                  </span>
                </div>
                
                {/* Metode Pembayaran */}
                <div className="flex justify-between items-center">
                  <span>Metode Pembayaran:</span>
                  <div className="flex items-center gap-2">
                    {paymentInfo.logo ? (
                      <ImageWithFallback 
                        src={paymentInfo.logo}
                        alt={paymentInfo.name}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">$</span>
                      </div>
                    )}
                    <span className="font-medium">{paymentInfo.name}</span>
                  </div>
                </div>
                
                {/* Pengiriman */}
                {invoiceData.shippingMethod && (
                  <div className="flex justify-between items-center">
                    <span>Pengiriman:</span>
                    <div className="flex items-center gap-2">
                      {shippingInfo.logo ? (
                        <ImageWithFallback 
                          src={shippingInfo.logo}
                          alt={shippingInfo.name}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">🚚</span>
                        </div>
                      )}
                      <div className="text-right">
                        <span className="font-medium block">{shippingInfo.name}</span>
                        {shippingInfo.estimated_days && (
                          <span className="text-xs text-gray-500 block">
                            {shippingInfo.estimated_days}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-8 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Detail Produk</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-semibold text-gray-600">Produk</th>
                    <th className="text-center py-3 font-semibold text-gray-600">Qty</th>
                    <th className="text-right py-3 font-semibold text-gray-600">Harga</th>
                    <th className="text-right py-3 font-semibold text-gray-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items && invoiceData.items.length > 0 ? (
                    invoiceData.items.map((item) => {
                      const productImage = productImages[item.id] || productImages[item.product_id || ''];
                      return (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <ImageWithFallback 
                                src={productImage}
                                alt={item.product_name}
                                className="w-12 h-12 object-cover rounded border"
                              />
                              <div>
                                <p className="font-medium text-gray-800">{item.product_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 text-gray-600">{item.quantity}</td>
                          <td className="text-right py-3 text-gray-600">{formatPrice(item.price)}</td>
                          <td className="text-right py-3 font-medium text-gray-800">{formatPrice(item.total)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
                        Data produk tidak tersedia
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="p-8">
            <div className="flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(invoiceData.subtotal || invoiceData.total)}</span>
                </div>
                {invoiceData.shippingCost && invoiceData.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Ongkos Kirim:</span>
                    <span>{formatPrice(invoiceData.shippingCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatPrice(invoiceData.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-8 rounded-b-xl">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">Terima kasih telah berbelanja di Buysini Store</p>
              <div className="flex justify-center gap-6 text-xs">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>+62 878-1889-4504</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>info@buysini.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            @page {
              margin: 0;
              size: A4;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background-color: #f9fafb !important;
            }
            .no-print {
              display: none !important;
            }
            .invoice-container {
              box-shadow: none !important;
              border: none !important;
              background-color: #ffffff !important;
              margin: 0 auto;
              max-width: 100%;
              border-radius: 0;
            }
            .bg-gray-50 {
              background-color: #f9fafb !important;
            }
            .bg-white {
              background-color: #ffffff !important;
            }
          }
        `}
      </style>

      <Footer />
    </div>
  );
};

// Main Invoice Component dengan Error Boundary
const Invoice = () => {
  return (
    <InvoiceErrorBoundary>
      <InvoiceContent />
    </InvoiceErrorBoundary>
  );
};

export default Invoice;