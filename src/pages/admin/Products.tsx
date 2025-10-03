import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Eye, X, Tag } from 'lucide-react';
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
    name: string;
  };
}

export type ProductStatus = "active" | "inactive" | "out_of_stock";

export interface ProductForm {
  category_id: string;
  name: string;
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
  status: ProductStatus;
  meta_title?: string;
  meta_description?: string;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [uploading, setUploading] = useState(false);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    short_description: '',
    price: 0,
    discount_price: 0,
    stock_quantity: 0,
    min_order_quantity: 1,
    weight: 0,
    dimensions: '',
    featured_image: '',
    is_featured: false,
    is_popular: false,
    status: 'active' as const,
    meta_title: '',
    meta_description: '',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files) return;

      setUploading(true);

      const uploadedUrls: string[] = [...formImages];

      for (let i = 0; i < Math.min(files.length, 2 - uploadedUrls.length); i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${i}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          alert("Upload gagal: " + uploadError.message);
          continue;
        }

        const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);

        if (data?.publicUrl) {
          uploadedUrls.push(data.publicUrl);
        }
      }

      const finalImages = uploadedUrls.slice(0, 2);
      setFormImages(finalImages);

      if (finalImages.length > 0 && !formData.featured_image) {
        setFormData(prev => ({
          ...prev,
          featured_image: finalImages[0],
        }));
      }

    } catch (err) {
      console.error("Upload gagal:", err);
      alert("Upload gambar gagal");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formImages.filter((_, i) => i !== index);
    setFormImages(newImages);
    
    if (formData.featured_image === formImages[index]) {
      setFormData(prev => ({
        ...prev,
        featured_image: newImages[0] || '',
      }));
    }
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      category_id: formData.category_id,
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: formData.description,
      short_description: formData.short_description,
      price: formData.price,
      discount_price: formData.discount_price || null,
      stock_quantity: formData.stock_quantity,
      min_order_quantity: formData.min_order_quantity,
      weight: formData.weight || null,
      dimensions: formData.dimensions || null,
      images: formImages,
      featured_image: formData.featured_image || (formImages[0] || null),
      is_featured: formData.is_featured,
      is_popular: formData.is_popular,
      status: formData.status,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      tags: formData.tags,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('Produk berhasil diupdate!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        alert('Produk berhasil ditambahkan!');
      }

      resetForm();
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Gagal menyimpan produk: ' + (err as Error).message);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormImages(product.images || []);
    setFormData({
      category_id: product.category_id,
      name: product.name,
      description: product.description,
      short_description: product.short_description,
      price: product.price,
      discount_price: product.discount_price || 0,
      stock_quantity: product.stock_quantity,
      min_order_quantity: product.min_order_quantity,
      weight: product.weight || 0,
      dimensions: product.dimensions || "",
      featured_image: product.featured_image || (product.images?.[0] || ""),
      is_featured: product.is_featured,
      is_popular: product.is_popular,
      status: product.status,
      meta_title: product.meta_title || "",
      meta_description: product.meta_description || "",
      tags: product.tags || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        alert('Produk berhasil dihapus!');
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Gagal menghapus produk: ' + (err as Error).message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      name: '',
      description: '',
      short_description: '',
      price: 0,
      discount_price: 0,
      stock_quantity: 0,
      min_order_quantity: 1,
      weight: 0,
      dimensions: '',
      featured_image: '',
      is_featured: false,
      is_popular: false,
      status: 'active',
      meta_title: '',
      meta_description: '',
      tags: [],
    });
    setFormImages([]);
    setTagInput('');
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.tags && product.tags.some(tag => 
                           tag.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || product.category_id === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Kelola Produk</h1>
                <p className="text-gray-600 mt-1">Kelola produk dan inventory toko Anda</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={20} />
                Tambah Produk
              </button>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari produk, deskripsi, atau tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="out_of_stock">Habis</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
  <tr>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Produk
    </th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
      Kategori
    </th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
      Tags
    </th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Harga
    </th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
      Stok
    </th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
      Min. Beli
    </th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Status
    </th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Aksi
    </th>
  </tr>
</thead>
                <tbody className="bg-white divide-y divide-gray-200">
  {paginatedProducts.map((product) => (
    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            <img
              className="h-12 w-12 rounded-lg object-cover border"
              src={product.featured_image || '/placeholder-product.jpg'}
              alt={product.name}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</div>
            <div className="text-sm text-gray-500 line-clamp-1">{product.short_description}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-900 hidden md:table-cell">
        {product.category?.name || 'Tanpa Kategori'}
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {product.tags && product.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
            >
              <Tag size={10} className="mr-1" />
              {tag}
            </span>
          ))}
          {product.tags && product.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{product.tags.length - 3}
            </span>
          )}
          {(!product.tags || product.tags.length === 0) && (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(product.price)}
        </div>
        {product.discount_price && product.discount_price > 0 && (
          <div className="text-sm text-green-600 font-semibold">
            {formatCurrency(product.discount_price)}
          </div>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-gray-900 hidden sm:table-cell">
        <span className={`font-semibold ${
          product.stock_quantity > 10 ? 'text-green-600' : 
          product.stock_quantity > 0 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {product.stock_quantity}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-gray-900 hidden xl:table-cell">
        <div className="flex items-center gap-1">
          <span className="font-medium text-blue-600">{product.min_order_quantity}</span>
          <span className="text-gray-500 text-xs">pcs</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          product.status === 'active' 
            ? 'bg-green-100 text-green-800 border border-green-200'
            : product.status === 'inactive'
            ? 'bg-gray-100 text-gray-800 border border-gray-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {product.status === 'active' ? 'Aktif' : 
           product.status === 'inactive' ? 'Tidak Aktif' : 'Habis'}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(product)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
            title="Edit produk"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(product.id)}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
            title="Hapus produk"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            )}

            {paginatedProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">Tidak ada produk ditemukan</p>
                <p className="text-gray-400 text-sm mt-1">
                  Coba ubah pencarian atau filter untuk melihat hasil lainnya
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {paginatedProducts.length > 0 && (
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Produk *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Harga *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Harga Diskon
                      </label>
                      <input
                        type="number"
                        value={formData.discount_price}
                        onChange={(e) => setFormData({ ...formData, discount_price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stok *
                      </label>
                      <input
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Minimum Pembelian (pcs) *
  </label>
  <input
    type="number"
    value={formData.min_order_quantity}
    onChange={(e) => setFormData({ ...formData, min_order_quantity: Number(e.target.value) })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    required
    min="1"
  />
  <p className="text-xs text-gray-500 mt-1">
    Jumlah minimum yang harus dibeli oleh customer
  </p>
</div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min. Order *
                      </label>
                      <input
                        type="number"
                        value={formData.min_order_quantity}
                        onChange={(e) => setFormData({ ...formData, min_order_quantity: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Berat (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'out_of_stock' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                        <option value="out_of_stock">Habis</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Singkat
                    </label>
                    <input
                      type="text"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Deskripsi singkat tentang produk..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Lengkap
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Deskripsi lengkap tentang produk..."
                    />
                  </div>

                  {/* Tags Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags Produk
                    </label>
                    <div className="border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            <Tag size={12} className="mr-1" />
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={addTag}
                        placeholder="Ketik tag dan tekan Enter..."
                        className="w-full px-2 py-1 border-0 focus:ring-0 focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tekan Enter untuk menambahkan tag. Maksimal 10 tag.
                    </p>
                  </div>

                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Produk Unggulan</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_popular}
                        onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                        className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Produk Populer</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Images Upload Section */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Gambar Produk (Maksimal 2 gambar)
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={uploading || formImages.length >= 2}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {formImages.length}/2 gambar terpilih. {formImages.length >= 2 && 'Sudah mencapai batas maksimal.'}
                    </p>
                    {uploading && (
                      <p className="text-sm text-blue-500 mt-2 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                        Mengupload gambar...
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Gambar Utama
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Image Previews */}
                {formImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Preview Gambar:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formImages.map((img, idx) => (
                        <div key={idx} className="relative group border rounded-lg p-3 bg-gray-50">
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="h-40 w-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X size={16} />
                          </button>
                          <div className="mt-3 text-center">
                            <label className="flex items-center justify-center text-sm cursor-pointer">
                              <input
                                type="radio"
                                name="featured_image"
                                checked={formData.featured_image === img}
                                onChange={() => setFormData(prev => ({ ...prev, featured_image: img }))}
                                className="mr-2 w-4 h-4 text-blue-600"
                              />
                              Jadikan Gambar Utama
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  {editingProduct ? 'Update Produk' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;