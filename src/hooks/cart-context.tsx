import React, { createContext, useReducer, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  max_quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}

interface CartState {
  cart: Cart;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart };

interface CartContextType {
  cart: Cart;
  addToCart: (product: Omit<CartItem, 'id'> & { id: string }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function untuk update total
const updateCartTotals = (items: CartItem[]): Cart => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return { items, total, count };
};

// Reducer untuk mengelola state cart
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'LOAD_CART':
      return { cart: action.payload };

    case 'ADD_TO_CART':
      const existingItemIndex = state.cart.items.findIndex(
        item => item.id === action.payload.id
      );

      let newItems: CartItem[];

      if (existingItemIndex !== -1) {
        // Update quantity jika item sudah ada
        newItems = state.cart.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = Math.min(
              item.quantity + action.payload.quantity,
              item.max_quantity
            );
            
            if (newQuantity === item.max_quantity) {
              alert(`Maksimal pembelian untuk ${item.name} adalah ${item.max_quantity} item`);
            }
            
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      } else {
        // Tambah item baru
        newItems = [...state.cart.items, action.payload];
      }

      const newCart = updateCartTotals(newItems);
      localStorage.setItem('buysini-cart', JSON.stringify(newCart));
      return { cart: newCart };

    case 'REMOVE_FROM_CART':
      const filteredItems = state.cart.items.filter(item => item.id !== action.payload);
      const removedCart = updateCartTotals(filteredItems);
      localStorage.setItem('buysini-cart', JSON.stringify(removedCart));
      return { cart: removedCart };

    case 'UPDATE_QUANTITY':
      const updatedItems = state.cart.items.map(item => {
        if (item.id === action.payload.id) {
          const actualQuantity = Math.min(action.payload.quantity, item.max_quantity);
          if (actualQuantity !== action.payload.quantity) {
            alert(`Tidak bisa menambah lebih dari ${item.max_quantity} item`);
          }
          return { ...item, quantity: actualQuantity };
        }
        return item;
      });
      const updatedCart = updateCartTotals(updatedItems);
      localStorage.setItem('buysini-cart', JSON.stringify(updatedCart));
      return { cart: updatedCart };

    case 'CLEAR_CART':
      localStorage.removeItem('buysini-cart');
      return { cart: { items: [], total: 0, count: 0 } };

    default:
      return state;
  }
};

// Cart Provider Component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: { items: [], total: 0, count: 0 }
  });

  // Load cart dari localStorage saat component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('buysini-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error parsing saved cart:', error);
      }
    }
  }, []);

  const addToCart = (product: Omit<CartItem, 'id'> & { id: string }) => {
    console.log('ADD_TO_CART_DISPATCH', product);
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      image: product.image,
      max_quantity: product.max_quantity
    };
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
  };

  const removeFromCart = (itemId: string) => {
    console.log('REMOVE_FROM_CART', itemId);
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    console.log('UPDATE_QUANTITY', { itemId, quantity });
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    console.log('CLEAR_CART');
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      cart: state.cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartContext };