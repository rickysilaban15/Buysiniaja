// components/CartDebug.tsx
import { useCart } from "@/hooks/useCart";

export const CartDebug = () => {
  const { cart } = useCart();
  
  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Cart Debug:</h3>
      <div className="text-xs">
        <p>Items: {cart.items.length}</p>
        <p>Total: {cart.total}</p>
        <p>Count: {cart.count}</p>
        <pre>
          {JSON.stringify(cart.items, null, 2)}
        </pre>
      </div>
    </div>
  );
};