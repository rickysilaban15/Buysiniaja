import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";

const FeaturedProducts = () => {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();

  const displayProducts = products
    .filter((p) => p.is_featured || p.is_popular)
    .slice(0, 6);

  if (loading) {
    return (
      <section className="relative py-16 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 opacity-20 bg-[url('/grid-pattern.svg')] bg-center bg-repeat"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Produk Unggulan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pilihan terbaik produk grosir dengan kualitas tinggi dan harga terjangkau
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-background/70 backdrop-blur-md rounded-xl h-64 mb-4 border border-border"></div>
                <div className="h-4 bg-secondary rounded mb-2"></div>
                <div className="h-3 bg-secondary rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-destructive">Error loading products: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 opacity-20 bg-[url('/grid-pattern.svg')] bg-center bg-repeat"></div>

      <div className="relative container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 relative inline-block">
            Produk Unggulan
            <span className="absolute left-0 right-0 -bottom-2 h-1 bg-gradient-to-r from-primary/40 to-transparent rounded-full"></span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pilihan terbaik produk grosir dengan kualitas tinggi dan harga terjangkau
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="group transition-transform hover:-translate-y-1 hover:scale-[1.02] duration-300"
            >
              <ProductCard 
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
                onAddToCart={() => addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.discount_price || product.price,
                  featured_image: product.featured_image,
                  stock_quantity: product.stock_quantity
                })}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
