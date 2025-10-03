import React, { useState, useEffect } from 'react';
import { Star, Heart, Plus, Minus, Check, Tag, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { supabase } from '@/integrations/supabase/client';

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

// Product Card Component untuk Homepage
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const discount = product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
  const finalPrice = product.discount_price || product.price;
  
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(product.min_order_quantity || 1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const handleAddToCart = async () => {
    if (product.stock_quantity === 0) {
      alert('Maaf, stok produk ini habis');
      return;
    }

    if (quantity > product.stock_quantity) {
      alert(`Maaf, stok hanya tersisa ${product.stock_quantity} item`);
      setQuantity(product.stock_quantity);
      return;
    }

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
      });
      
      if (success) {
        setIsAdded(true);
        setTimeout(() => {
          setIsAdded(false);
          setQuantity(product.min_order_quantity || 1);
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 h-full flex flex-col">
      {/* Image Container */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
        <img
          src={product.featured_image || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
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
        
        {/* Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        >
          <Heart 
            className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-400'}`} 
          />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-blue-600 font-semibold mb-1">{product.category.name}</p>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 h-10">
          {product.name}
        </h3>
        
        {/* Description */}
        {product.short_description && (
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2 h-8">
            {product.short_description}
          </p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded flex items-center gap-1"
              >
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(finalPrice)}
            </span>
            {product.discount_price && (
              <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Stok: {product.stock_quantity} tersisa
          </p>
        </div>
        
        {/* Quantity Selector */}
        {product.stock_quantity > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-600 dark:text-gray-400">Qty:</span>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
              <button
                onClick={() => setQuantity(Math.max(product.min_order_quantity || 1, quantity - 1))}
                disabled={quantity <= (product.min_order_quantity || 1)}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 h-7 flex items-center justify-center text-sm font-medium border-x border-gray-300 dark:border-gray-600">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
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
              <Check className="w-4 h-4" />
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Min. pembelian: {product.min_order_quantity} pcs
          </p>
        )}
      </div>
    </div>
  );
};

// Home Products Section Component
export const HomeProductsSection = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeProducts();
  }, []);

  const fetchHomeProducts = async () => {
    setLoading(true);
    try {
      // Fetch featured products
      const { data: featuredData, error: featuredError } = await supabase
        .from('products')
        .select(`*, category:categories(id, name, slug)`)
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(8);

      // Fetch popular products
      const { data: popularData, error: popularError } = await supabase
        .from('products')
        .select(`*, category:categories(id, name, slug)`)
        .eq('status', 'active')
        .eq('is_popular', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (featuredError) throw featuredError;
      if (popularError) throw popularError;

      setFeaturedProducts(featuredData || []);
      setPopularProducts(popularData || []);
    } catch (err) {
      console.error('Error fetching home products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Produk Unggulan
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Temukan produk-produk terbaik pilihan kami dengan kualitas terjamin
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Produk Populer
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Produk yang paling banyak diminati oleh pelanggan kami
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};