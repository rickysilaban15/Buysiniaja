import React, { useState } from 'react';
import { ShoppingCart, Star, Tag, Heart, Plus, Minus, Check, X } from 'lucide-react';
import { useCart } from "@/hooks/useCart";
import { Product } from "@/hooks/useProducts";


interface ProductCardProps {
  product: Product;
  formatCurrency: (amount: number) => string;
  calculateDiscount: (price: number, discountPrice?: number) => number;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  formatCurrency, 
  calculateDiscount 
}) => {
  const discount = calculateDiscount(product.price, product.discount_price);
  const finalPrice = product.discount_price || product.price;
  
  const { addToCart, cart } = useCart(); // Tambahkan cart di sini untuk debug
  
  const [quantity, setQuantity] = useState(product.min_order_quantity || 1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async () => {
    if (product.stock_quantity === 0) return;
    
    setIsAdding(true);
    
    try {
      console.log('Attempting to add to cart:', {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        currentCart: cart // Debug current cart state
      });

      const success = addToCart({
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: product.featured_image || "/placeholder-product.jpg",
        quantity: quantity,
        max_quantity: product.stock_quantity,
      });
      
      if (success) {
        console.log('Successfully added to cart');
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        // Reset quantity to minimum after successful add
        setQuantity(product.min_order_quantity || 1);
      } else {
        console.log('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const minQuantity = product.min_order_quantity || 1;
    const maxQuantity = product.stock_quantity;
    
    if (newQuantity < minQuantity) {
      alert(`Minimal pembelian: ${minQuantity} item`);
      return;
    }
    
    if (newQuantity > maxQuantity) {
      alert(`Stok tersisa hanya ${maxQuantity} item`);
      return;
    }
    
    setQuantity(newQuantity);
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
        
        <CartDebug />

        {/* Quantity Selector */}
        {product.stock_quantity > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-600 dark:text-gray-400">Qty:</span>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= (product.min_order_quantity || 1)}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 h-7 flex items-center justify-center text-sm font-medium border-x border-gray-300 dark:border-gray-600">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Min. pembelian: {product.min_order_quantity} pcs
          </p>
        )}
      </div>
    </div>

    
  );
};

export default ProductCard;