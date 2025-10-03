import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Star, Tag, Heart, Plus, Minus, Check, X, ZoomIn, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  min_order_quantity: number;
  weight?: number;
  dimensions?: string;
  images: string[];
  featured_image?: string;
  is_featured: boolean;
  is_popular: boolean;
  status: 'active' | 'inactive' | 'out_of_stock';
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Image Modal Component
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  productName: string;
}

const ImageModal = ({ isOpen, onClose, images, productName }: ImageModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image Display */}
      <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
        <img
          src={images[currentImageIndex] || '/placeholder-product.jpg'}
          alt={productName}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
        
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

// Cart Sidebar Component
interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert("Keranjang belanja kosong!");
      return;
    }
    onClose();
    navigate('/checkout');
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const item = cart.items.find(item => item.id === id);
    if (item && newQuantity > item.max_quantity) {
      alert(`Stok tersisa hanya ${item.max_quantity} item`);
      return;
    }
    updateQuantity(id, newQuantity);
  };

  const handleClearCart = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan keranjang?")) {
      clearCart();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[998] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-background border-l border-border shadow-xl z-[999] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Keranjang Belanja</h2>
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full min-w-6 text-center">
                {cart.count}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Tutup sidebar keranjang">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">Keranjang Anda kosong</p>
                <Button onClick={onClose} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
                  Mulai Belanja
                </Button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 bg-card rounded-lg border">
                  <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                        <span className="text-muted-foreground text-sm font-medium">{item.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 p-1 h-auto"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    <p className="text-primary font-semibold text-sm">{formatPrice(item.price)}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>

                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.max_quantity}
                          className="w-7 h-7 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Subtotal: {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t border-border p-4 space-y-3 bg-card/50">
              <div className="flex justify-between items-center text-sm">
                <span>Total Item:</span>
                <span className="font-medium">{cart.count} item</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Harga:</span>
                <span className="text-lg font-bold text-primary">{formatPrice(cart.total)}</span>
              </div>

              <div className="space-y-2 pt-2">
                <Button onClick={handleCheckout} className="w-full" size="lg" disabled={loading || cart.items.length === 0}>
                  Checkout - {formatPrice(cart.total)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={loading}
                >
                  Kosongkan Keranjang
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Enhanced Product Card Component
const ProductCard: React.FC<{
  product: Product;
  formatCurrency: (amount: number) => string;
  calculateDiscount: (price: number, discountPrice?: number) => number;
  onImageClick: (product: Product) => void;
  onProductClick: (productSlug: string) => void;
}> = ({ product, formatCurrency, calculateDiscount, onImageClick, onProductClick }) => {
  const discount = calculateDiscount(product.price, product.discount_price);
  const finalPrice = product.discount_price || product.price;
  
  const { addToCart } = useCart();
 
  const [quantity, setQuantity] = useState(product.min_order_quantity || 1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Di dalam ProductCard component - update handleAddToCart
const handleAddToCart = async () => {
  setIsAdding(true);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const success = addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.featured_image || "/placeholder-product.jpg",
      quantity: quantity,
      max_quantity: product.stock_quantity,
      product_id: product.id, // TAMBAHKAN INI
    });
    
    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
  } finally {
    setIsAdding(false);
  }
};
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onImageClick(product);
  };

  const handleProductNameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onProductClick(product.slug); 
  };

  // Get all images for the product
  const allImages = [
    product.featured_image,
    ...(product.images || [])
  ].filter(Boolean) as string[];

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-400 h-full flex flex-col">
      {/* Image Container */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer">
        <img
          src={product.featured_image || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onClick={handleImageClick}
        />
        
        {/* Zoom Icon Overlay */}
        <div 
          className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-zoom-in"
          onClick={handleImageClick}
        >
          <ZoomIn className="w-8 h-8 text-white/80" />
        </div>
        
        {/* Badges */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{discount}%
          </div>
        )}
        
        {product.is_featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Unggulan
          </div>
        )}
        
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Stok: {product.stock_quantity}
          </div>
        )}

        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold">
              Stok Habis
            </span>
          </div>
        )}
        
        
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-blue-600 font-semibold mb-1">{product.category.name}</p>
        )}

        {/* Product Name - Clickable */}
        <h3 
          className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 h-10 group-hover:text-blue-600 transition-colors cursor-pointer hover:underline"
          onClick={handleProductNameClick}
        >
          {product.name}
        </h3>
        
        {/* Description */}
        {product.short_description && (
          <p className="text-gray-600 text-xs mb-3 line-clamp-2 h-8">
            {product.short_description}
          </p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"
              >
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(finalPrice)}
            </span>
            {product.discount_price && (
              <span className="text-xs text-gray-500 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            Stok: {product.stock_quantity} tersisa
          </p>
        </div>
        
        {/* Quantity Selector */}
        {product.stock_quantity > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-600">Qty:</span>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => setQuantity(Math.max(product.min_order_quantity || 1, quantity - 1))}
                disabled={quantity <= (product.min_order_quantity || 1)}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 h-7 flex items-center justify-center text-sm font-medium border-x border-gray-300">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || isAdded || product.stock_quantity === 0}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 mt-auto ${
            isAdded
              ? 'bg-green-500 text-white'
              : isAdding
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : product.stock_quantity === 0
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              Ditambahkan
            </>
          ) : isAdding ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : product.stock_quantity === 0 ? (
            <>
              <X className="w-4 h-4" />
              Stok Habis
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Tambah ke Keranjang
            </>
          )}
        </button>

        {product.min_order_quantity > 1 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Min. pembelian: {product.min_order_quantity} pcs
          </p>
        )}
      </div>
    </div>
  );
};

// Main Products Component
const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart } = useCart();

  // Get category from URL parameter on component mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      // Find category by slug
      const category = categories.find(cat => cat.slug === categoryFromUrl);
      if (category) {
        setSelectedCategory(category.id);
      }
    }
  }, [categories, searchParams]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories(id, name, slug)`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // Update URL parameters
    if (categoryId === 'all') {
      // Remove category parameter if "all" is selected
      searchParams.delete('category');
    } else {
      // Find category slug by ID
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        searchParams.set('category', category.slug);
      }
    }
    
    setSearchParams(searchParams);
  };

  // Handle price range change
  const handlePriceRangeChange = (range: string) => {
    setPriceRange(range);
    
    if (range === 'all') {
      searchParams.delete('priceRange');
    } else {
      searchParams.set('priceRange', range);
    }
    
    setSearchParams(searchParams);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const calculateDiscount = (price: number, discountPrice?: number) => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const handleImageClick = (product: Product) => {
    setSelectedProductForModal(product);
  };

  const handleProductClick = (productSlug: string) => {
    navigate(`/product/${productSlug}`);
  };

  const closeImageModal = () => {
    setSelectedProductForModal(null);
  };

  // Filter products
  const filteredProducts = products
    .filter((product) => {
      // Search filter
      const matchesSearch =
        searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = 
        selectedCategory === 'all' || 
        product.category_id === selectedCategory;

      // Price range filter
      const price = product.discount_price || product.price;
      const matchesPrice =
        priceRange === 'all' ||
        (priceRange === 'under50' && price < 50000) ||
        (priceRange === '50-100' && price >= 50000 && price < 100000) ||
        (priceRange === '100-500' && price >= 100000 && price < 500000) ||
        (priceRange === 'over500' && price >= 500000);

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.discount_price || a.price) - (b.discount_price || b.price);
        case 'price-high':
          return (b.discount_price || b.price) - (a.discount_price || a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 8);
  const popularProducts = products.filter((p) => p.is_popular).slice(0, 8);

  // Get all images for modal
  const modalImages = selectedProductForModal 
    ? [
        selectedProductForModal.featured_image,
        ...(selectedProductForModal.images || [])
      ].filter(Boolean) as string[]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat produk...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Image Modal */}
      <ImageModal
        isOpen={!!selectedProductForModal}
        onClose={closeImageModal}
        images={modalImages}
        productName={selectedProductForModal?.name || ''}
      />

      {/* Cart Floating Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <ShoppingCart className="w-6 h-6" />
        {cart.count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {cart.count}
          </span>
        )}
      </button>

      {/* Track Order Floating Button */}
      <button
        onClick={() => navigate('/track-order')}
        className="fixed bottom-6 left-6 z-50 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        title="Lacak Pesanan"
      >
        📦
      </button>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#800000] via-[#FFD700] to-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Toko Kami</h1>
          <p className="text-xl opacity-90">Temukan produk berkualitas dengan harga terbaik</p>
        </div>
      </div>

      {/* Filters Section - Right after Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Search and Dropdowns Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="newest">Terbaru</option>
                <option value="price-low">Harga: Rendah ke Tinggi</option>
                <option value="price-high">Harga: Tinggi ke Rendah</option>
                <option value="name">Nama A-Z</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Rentang Harga:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'Semua' },
                  { value: 'under50', label: '< 50rb' },
                  { value: '50-100', label: '50rb - 100rb' },
                  { value: '100-500', label: '100rb - 500rb' },
                  { value: 'over500', label: '> 500rb' },
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handlePriceRangeChange(range.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      priceRange === range.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters Info */}
            {(selectedCategory !== 'all' || searchTerm || priceRange !== 'all') && (
              <div className="border-t pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Filter Aktif:</span>
                  
                  {selectedCategory !== 'all' && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      Kategori: {categories.find(cat => cat.id === selectedCategory)?.name}
                      <button
                        onClick={() => handleCategoryChange('all')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {searchTerm && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      Pencarian: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {priceRange !== 'all' && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      Harga: {[
                        { value: 'under50', label: '< 50rb' },
                        { value: '50-100', label: '50rb - 100rb' },
                        { value: '100-500', label: '100rb - 500rb' },
                        { value: 'over500', label: '> 500rb' },
                      ].find(r => r.value === priceRange)?.label}
                      <button
                        onClick={() => handlePriceRangeChange('all')}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {/* Clear All Filters */}
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchTerm('');
                      setPriceRange('all');
                      setSearchParams({});
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Hapus Semua Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Featured Products Section */}
          {featuredProducts.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Produk Unggulan</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    formatCurrency={formatCurrency}
                    calculateDiscount={calculateDiscount}
                    onImageClick={handleImageClick}
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Popular Products Section */}
          {popularProducts.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Produk Populer</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-red-400 to-pink-500 rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    formatCurrency={formatCurrency}
                    calculateDiscount={calculateDiscount}
                    onImageClick={handleImageClick}
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Products Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Semua Produk</h2>
              <div className="flex items-center gap-4">
                <p className="text-gray-600 text-sm">
                  Menampilkan {filteredProducts.length} produk
                  {selectedCategory !== 'all' && (
                    <span className="text-blue-600 font-medium">
                      {' '}dalam kategori {categories.find(cat => cat.id === selectedCategory)?.name}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <ShoppingCart size={18} />
                  Keranjang ({cart.count})
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg mb-2">Tidak ada produk ditemukan</p>
                <p className="text-gray-400 text-sm mb-4">Coba ubah filter atau kata kunci pencarian</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                    setPriceRange('all');
                    setSearchParams({});
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tampilkan Semua Produk
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    formatCurrency={formatCurrency}
                    calculateDiscount={calculateDiscount}
                    onImageClick={handleImageClick}
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;