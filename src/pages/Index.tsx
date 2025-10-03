import React, { useState } from 'react';
import Layout from "../components/Layout";
import HeroSection from "../components/HeroSection";
import CategorySection from "../components/CategorySection";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import CartSidebar from '../components/CartSidebar';
import { HomeProductsSection } from '../components/HomeProductsSection'; // Import komponen baru

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();

  return (
    <Layout>
      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
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

      <HeroSection />
      <CategorySection />
      <HomeProductsSection /> {/* Tambahkan komponen produk di sini */}
    </Layout>
  );
};

export default Index;