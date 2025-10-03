// pages/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Tag, Truck, Shield, Check, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import CartSidebar from '@/components/CartSidebar';

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

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories(id, name, slug)`)
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDiscount = (price: number, discountPrice?: number) => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      const success = addToCart({
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: product.discount_price || product.price,
        image: product.featured_image || '/placeholder-product.jpg',
        quantity: quantity,
        max_quantity: product.stock_quantity,
      });

      if (success) {
        setIsAddedToCart(true);
        setTimeout(() => setIsAddedToCart(false), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Generate all images array with proper handling
  const getAllImages = (product: Product): string[] => {
    const images: string[] = [];
    
    // Add featured image first if exists
    if (product.featured_image) {
      images.push(product.featured_image);
    }
    
    // Add other images from images array
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        // Avoid duplicates
        if (img && !images.includes(img)) {
          images.push(img);
        }
      });
    }
    
    // If no images at all, use placeholder
    if (images.length === 0) {
      images.push('/placeholder-product.jpg');
    }
    
    return images;
  };

  const allImages = product ? getAllImages(product) : [];

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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Produk Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Produk yang Anda cari tidak ditemukan.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Toko
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = calculateDiscount(product.price, product.discount_price);
  const finalPrice = product.discount_price || product.price;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="flex-grow">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600">Beranda</Link>
              <span>/</span>
              <Link to="/products" className="hover:text-blue-600">Produk</Link>
              {product.category && (
                <>
                  <span>/</span>
                  <Link 
                    to={`/products?category=${product.category.slug}`} 
                    className="hover:text-blue-600"
                  >
                    {product.category.name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <ShoppingCart size={18} />
              Keranjang ({cart.count})
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-product.jpg';
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden transition-all ${
                        selectedImage === index 
                          ? 'border-blue-600 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              
                      
               
                </div>
              
        

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                {product.category && (
                  <p className="text-blue-600 font-semibold text-sm mb-2">
                    {product.category.name}
                  </p>
                )}
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-blue-600">
                  {formatCurrency(finalPrice)}
                </span>
                {product.discount_price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.is_featured && (
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Produk Unggulan
                  </span>
                )}
                {product.is_popular && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    🔥 Populer
                  </span>
                )}
              </div>

              {/* Stock Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stok Tersedia:</span>
                  <span className={`font-semibold ${
                    product.stock_quantity > 10 ? 'text-green-600' : 
                    product.stock_quantity > 0 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {product.stock_quantity} pcs
                  </span>
                </div>
                {product.min_order_quantity > 1 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Min. Pembelian:</span>
                    <span className="font-semibold text-blue-600">
                      {product.min_order_quantity} pcs
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock_quantity > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Jumlah:
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(product.min_order_quantity || 1, quantity - 1))}
                        disabled={quantity <= (product.min_order_quantity || 1)}
                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-16 h-12 flex items-center justify-center text-lg font-medium border-x border-gray-300">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                        disabled={quantity >= product.stock_quantity}
                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || isAddedToCart || product.stock_quantity === 0}
                        className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                          isAddedToCart
                            ? 'bg-green-500 text-white'
                            : isAddingToCart
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                        }`}
                      >
                        {isAddedToCart ? (
                          <>
                            <Check className="w-5 h-5" />
                            Ditambahkan ke Keranjang
                          </>
                        ) : isAddingToCart ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Menambahkan...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Tambah ke Keranjang
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={`p-3 border rounded-lg transition-colors ${
                          isWishlisted
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <Heart 
                          className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} 
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Out of Stock Message */}
              {product.stock_quantity === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium text-center">
                    😔 Stok produk ini sedang habis
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span>Gratis Ongkir untuk order tertentu</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Garansi 100% Produk Asli</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-12">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Deskripsi Produk</h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description || product.short_description || 'Tidak ada deskripsi tersedia untuk produk ini.'}
                </p>
              </div>

              {/* Product Specifications */}
              {(product.weight || product.dimensions) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Spesifikasi Produk</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.weight && (
                      <div>
                        <span className="text-sm text-gray-600">Berat:</span>
                        <p className="font-medium">{product.weight} kg</p>
                      </div>
                    )}
                    {product.dimensions && (
                      <div>
                        <span className="text-sm text-gray-600">Dimensi:</span>
                        <p className="font-medium">{product.dimensions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Cart Button */}
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

      <Footer />
    </div>
  );
};

export default ProductDetail;