import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";

const PopularProducts = () => {
  const { products, loading, error } = useProducts();

  const popularProducts = products.filter((p) => p.is_popular).slice(0, 8);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Produk Populer</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Produk yang paling banyak diminati oleh pembeli
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.discount_price || product.price}
              originalPrice={product.discount_price ? product.price : undefined}
              image={product.featured_image}
              category={product.category?.name || 'Produk'}
              rating={4.5 + Math.random() * 0.5}
              sold={Math.floor(Math.random() * 300) + 50}
              isPopular={product.is_popular}
              isFeatured={product.is_featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;
