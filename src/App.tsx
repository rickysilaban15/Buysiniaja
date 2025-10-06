// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './hooks/cart-context';
import ScrollToTop from './components/ScrollToTop';
import { useEffect, useState, Suspense } from 'react';

// Lazy load Supabase to avoid conflicts
const [supabase, setSupabase] = useState<any>(null);
const [supabaseError, setSupabaseError] = useState<string | null>(null);

useEffect(() => {
  const loadSupabase = async () => {
    try {
      const supabaseModule = await import('./lib/supabase-client');
      setSupabase(supabaseModule.default);
      console.log('✅ Supabase loaded in App');
    } catch (error) {
      console.error('❌ Failed to load Supabase:', error);
      setSupabaseError('Failed to initialize database connection');
    }
  };

  loadSupabase();
}, []);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adminData = localStorage.getItem('admin');
  
  if (!adminData) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const parsed = JSON.parse(adminData);
    if (parsed.role !== 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

// Loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <div>Loading...</div>
    {supabaseError && (
      <div style={{ color: 'red', marginTop: '10px' }}>
        Database connection issue: {supabaseError}
      </div>
    )}
  </div>
);

export default function App() {
  if (!supabase && !supabaseError) {
    return <LoadingFallback />;
  }

  return (
    <CartProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/category" element={<Category />} />
            <Route path="/promo" element={<Promo />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products" element={<Products />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/order-pending" element={<OrderPending />} />
            <Route path="/checkout-failed" element={<CheckoutFailed />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/payment-return" element={<PaymentReturn />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/help" element={<Help />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/payment-shipping-logos" element={<PaymentShippingLogos />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/payment-callback" element={<PaymentCallback />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orderitems" element={<AdminOrderItems />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="promos" element={<AdminPromos />} />
              <Route path="payment-methods" element={<AdminPaymentMethods />} />
              <Route path="shipping-methods" element={<AdminShippingMethods />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        
        <ScrollToTop />
      </BrowserRouter>
    </CartProvider>
  );
}
