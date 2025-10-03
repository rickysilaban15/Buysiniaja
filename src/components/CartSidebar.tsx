import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart(); // HAPUS syncCartWithProducts dari sini
  const { products } = useProducts();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // HAPUS useEffect yang panggil syncCartWithProducts:
  // useEffect(() => {
  //   if (cart.items.length > 0) {
  //     syncCartWithProducts();
  //   }
  // }, [products]);

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
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Tutup sidebar keranjang"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Keranjang Anda kosong
                </p>
                <Button
                  onClick={onClose}
                  className="inline-flex items-center justify-center bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  Mulai Belanja
                </Button>
              </div>
            ) : (
              cart.items.map((item) => {
                const product = products.find(p => p.id === item.product_id);
                const isOutOfStock = product?.status === 'out_of_stock' || product?.stock_quantity === 0;

                return (
                  <div
                    key={item.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${
                      isOutOfStock ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-card'
                    }`}
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                          <span className="text-muted-foreground text-sm font-medium">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {isOutOfStock && (
                        <div className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded inline-block">
                          Stok Habis
                        </div>
                      )}

                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 p-1 h-auto"
                          aria-label={`Hapus ${item.name} dari keranjang`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>

                      <p className="text-primary font-semibold text-sm">
                        {formatPrice(item.price)}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isOutOfStock}
                            className="w-7 h-7 p-0"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>

                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.max_quantity || isOutOfStock}
                            className="w-7 h-7 p-0"
                            aria-label="Tambah jumlah"
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
                );
              })
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
                <span className="text-lg font-bold text-primary">
                  {formatPrice(cart.total)}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={
                    cart.items.length === 0 ||
                    cart.items.some(item => {
                      const product = products.find(p => p.id === item.product_id);
                      return product?.status === 'out_of_stock' || product?.stock_quantity === 0;
                    })
                  }
                >
                  {`Lanjutkan Checkout - ${formatPrice(cart.total)}`}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
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

export default CartSidebar;