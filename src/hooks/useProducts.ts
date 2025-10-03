import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  featured_image: string;
  images: string[];
  short_description?: string;
  description?: string;
  stock_quantity: number;
  min_order_quantity: number;
  is_featured: boolean;
  is_popular: boolean;
  status: 'active' | 'inactive' | 'out_of_stock';
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories(id, name, slug)`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const subscription = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          const newProduct = payload.new as Product;
          const oldProduct = payload.old as Product;

          switch (payload.eventType) {
            case 'INSERT':
              setProducts((prev) => [newProduct, ...prev]);
              break;
            case 'UPDATE':
              setProducts((prev) =>
                prev.map((p) => (p.id === newProduct.id ? newProduct : p))
              );
              break;
            case 'DELETE':
              setProducts((prev) =>
                prev.filter((p) => p.id !== oldProduct.id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Helper functions untuk filter produk
  const getFeaturedProducts = () => products.filter(p => p.is_featured);
  const getPopularProducts = () => products.filter(p => p.is_popular);
  const getProductsByCategory = (categoryId: string) => 
    products.filter(p => p.category?.id === categoryId);
  
  // Function untuk mendapatkan produk berdasarkan ID
  const getProductById = (productId: string) => 
    products.find(p => p.id === productId);

  // Function untuk update stock setelah checkout
  const updateProductStock = (productId: string, quantitySold: number) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { 
              ...product, 
              stock_quantity: Math.max(0, product.stock_quantity - quantitySold),
              status: product.stock_quantity - quantitySold <= 0 ? 'out_of_stock' : product.status
            }
          : product
      )
    );
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    getFeaturedProducts,
    getPopularProducts,
    getProductsByCategory,
    getProductById,
    updateProductStock
  };
};