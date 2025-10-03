import { Package, Gift, Coffee, Utensils, Cake, ChefHat, Bath, Cigarette, MoreHorizontal } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";

const CategorySection = () => {
  const { categories, loading } = useCategories();
  const { products } = useProducts();
  const navigate = useNavigate();

  const iconMap: { [key: string]: any } = {
    'jajanan': Package,
    'oleh-oleh': Gift,
    'minuman': Coffee,
    'bahan-makanan': Utensils,
    'kue': Cake,
    'bahan-dapur': ChefHat,
    'produk-mandi': Bath,
    'rokok': Cigarette,
    'lainnya': MoreHorizontal,
  };

  const colorMap: { [key: string]: string } = {
    'jajanan': "text-orange-600 bg-orange-100",
    'oleh-oleh': "text-pink-600 bg-pink-100",
    'minuman': "text-blue-600 bg-blue-100",
    'bahan-makanan': "text-green-600 bg-green-100",
    'kue': "text-purple-600 bg-purple-100",
    'bahan-dapur': "text-yellow-600 bg-yellow-100",
    'produk-mandi': "text-cyan-600 bg-cyan-100",
    'rokok': "text-gray-600 bg-gray-100",
    'lainnya': "text-indigo-600 bg-indigo-100",
  };

  const getCategoryProductCount = (categoryId: string) => {
    const count = products.filter(p => p.category?.id === categoryId).length;
    return `${count}+ items`;
  };

  const handleCategoryClick = (slug: string) => {
    navigate(`/products?category=${slug}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Kategori Produk
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Jelajahi berbagai kategori produk grosir berkualitas tinggi
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-border shadow-soft">
                  <div className="h-16 w-16 bg-secondary rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-secondary rounded mb-2"></div>
                  <div className="h-3 bg-secondary rounded w-2/3 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const activeCategories = categories.filter(cat => cat.is_active);

  if (activeCategories.length === 0) {
    return null; // Jangan tampilkan section jika tidak ada kategori aktif
  }

  return (
  <section className="relative py-16 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
    {/* Decorative subtle background pattern */}
    <div className="absolute inset-0 opacity-30 dark:opacity-20 bg-[url('/grid-pattern.svg')] bg-center bg-repeat"></div>

    <div className="relative container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Kategori Produk
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Jelajahi berbagai kategori produk grosir berkualitas tinggi
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* kategori cards di sini */}
        {activeCategories.map((category) => {
          const Icon = iconMap[category.slug] || MoreHorizontal;
          const colorClass = colorMap[category.slug] || "text-indigo-600 bg-indigo-100";

          return (
            <div
              key={category.id}
              className="group cursor-pointer relative"
              onClick={() => handleCategoryClick(category.slug)}
            >
              {/* Glow effect saat hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-accent-warm/10 opacity-0 group-hover:opacity-100 blur-lg transition duration-500"></div>

              <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-primary/30">
                <div
                  className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110`}
                >
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-12 h-12 object-cover rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : category.icon ? (
                    <span className="text-2xl">{category.icon}</span>
                  ) : (
                    <Icon className="w-8 h-8" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-center text-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {getCategoryProductCount(category.id)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

};

export default CategorySection;