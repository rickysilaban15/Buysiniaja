import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, ArrowUp, ArrowDown, Upload, X, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    icon: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchCategories();
    setupRealtimeSubscription();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products:products(count)
        `)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Fetch categories error:', error);
        throw error;
      }

      const transformedData = (data || []).map(category => ({
        ...category,
        product_count: category.products?.length || 0
      }));

      setCategories(transformedData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        (payload) => {
          console.log('Categories realtime update:', payload);
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  // Method 1: Convert to Base64 (fallback yang selalu work)
  const handleImageUploadBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Method 2: Upload ke Supabase Storage
  const handleImageUploadSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `category-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('public-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('public-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diizinkan (PNG, JPG, JPEG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    setUploading(true);
    try {
      console.log('Attempting to upload image...');

      // Coba upload ke Supabase Storage dulu
      let imageUrl = '';
      try {
        console.log('Trying Supabase Storage upload...');
        imageUrl = await handleImageUploadSupabase(file);
        console.log('Supabase upload successful:', imageUrl);
      } catch (storageError) {
        console.warn('Supabase storage failed, using Base64 fallback:', storageError);
        // Fallback ke Base64
        imageUrl = await handleImageUploadBase64(file);
        console.log('Base64 fallback successful');
      }

      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      setImagePreview(imageUrl);

    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Gagal mengupload gambar. Silakan coba lagi atau gunakan URL langsung.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Nama kategori wajib diisi');
      return;
    }

    const categoryData = {
      ...formData,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    };

    try {
      console.log('Saving category:', categoryData);

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
      }

      await fetchCategories();
      resetForm();
      setShowModal(false);
      alert(editingCategory ? 'Kategori berhasil diupdate!' : 'Kategori berhasil ditambahkan!');

    } catch (error: any) {
      console.error('Error saving category:', error);
      
      if (error.code === '23505') {
        alert('Slug kategori sudah ada. Silakan gunakan nama yang berbeda.');
      } else if (error.code === '401') {
        alert('Error authentication. Pastikan Anda sudah login sebagai admin.');
      } else {
        alert('Terjadi kesalahan saat menyimpan kategori: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      icon: category.icon || '',
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
    setImagePreview(category.image_url || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();
      alert('Kategori berhasil dihapus!');

    } catch (error: any) {
      console.error('Error deleting category:', error);
      
      if (error.code === '23503') {
        alert('Tidak dapat menghapus kategori karena masih ada produk yang terkait.');
      } else {
        alert('Gagal menghapus kategori.');
      }
    }
  };

  const toggleActive = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active })
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();

    } catch (error) {
      console.error('Error toggling category active:', error);
      alert('Gagal mengubah status kategori');
    }
  };

  const updateSortOrder = async (id: string, direction: 'up' | 'down') => {
  const categoryIndex = categories.findIndex(c => c.id === id);
  if (categoryIndex === -1) return;

  let targetIndex: number;

  if (direction === 'up' && categoryIndex > 0) {
    targetIndex = categoryIndex - 1;
  } else if (direction === 'down' && categoryIndex < categories.length - 1) {
    targetIndex = categoryIndex + 1;
  } else {
    return; // Tidak bisa pindah
  }

  const currentCategory = categories[categoryIndex];
  const targetCategory = categories[targetIndex];

  try {
    // Swap sort_order di database
    const { error: error1 } = await supabase
      .from('categories')
      .update({ sort_order: targetCategory.sort_order })
      .eq('id', currentCategory.id);

    if (error1) throw error1;

    const { error: error2 } = await supabase
      .from('categories')
      .update({ sort_order: currentCategory.sort_order })
      .eq('id', targetCategory.id);

    if (error2) throw error2;

    // Refresh data setelah update
    await fetchCategories();

  } catch (error) {
    console.error('Error updating sort order:', error);
    alert('Gagal mengubah urutan kategori');
  }
};

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      icon: '',
      is_active: true,
      sort_order: categories.length > 0 ? Math.max(...categories.map(c => c.sort_order)) + 1 : 0,
    });
    setEditingCategory(null);
    setImagePreview('');
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data kategori...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Kelola Kategori</h1>
                <p className="text-gray-600 mt-1">
                  Total {categories.length} kategori • {categories.filter(c => c.is_active).length} aktif
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Tambah Kategori
              </button>
            </div>

            {/* Search */}
            <div className="mt-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari kategori berdasarkan nama, deskripsi, atau slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Deskripsi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Urutan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category, index) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {category.image_url ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={category.image_url}
                              alt={category.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/40x40/e5e7eb/9ca3af?text=📦';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center text-lg">
                              {category.icon || '📦'}
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">/{category.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {category.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          category.product_count && category.product_count > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.product_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(category.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          category.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {category.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span className="hidden sm:inline">
                          {category.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{category.sort_order}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => updateSortOrder(category.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Pindah ke atas"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => updateSortOrder(category.id, 'down')}
                            disabled={index === filteredCategories.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Pindah ke bawah"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Edit kategori"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Hapus kategori"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchTerm ? 'Tidak ada kategori yang sesuai dengan pencarian' : 'Belum ada kategori'}
              </div>
              {!searchTerm && (
                <button
                  onClick={() => setShowModal(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Tambah kategori pertama
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Kategori
                </label>
                
                {/* Image Preview */}
                {(imagePreview || formData.image_url) && (
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || formData.image_url}
                        alt="Preview"
                        className="w-32 h-32 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Upload Options */}
                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Gambar Baru
                    </label>
                    <div className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 text-center">
                        <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                      </p>
                      <p className="text-xs text-gray-500 text-center mb-3">
                        PNG, JPG, JPEG (Max. 5MB)
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        disabled={uploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`px-4 py-2 rounded-lg text-white text-sm font-medium cursor-pointer ${
                          uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {uploading ? 'Mengupload...' : 'Pilih File'}
                      </label>
                    </div>
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Atau masukkan URL gambar
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, image_url: e.target.value }));
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                {uploading && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Mengupload gambar...
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Makanan Ringan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon/Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="🍿"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Deskripsi singkat tentang kategori ini..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Angka lebih kecil akan ditampilkan lebih dulu
                  </p>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Kategori Aktif</span>
                  </label>
                </div>
              </div>

              {/* Preview Slug */}
              {formData.name && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Slug akan menjadi:</p>
                  <p className="text-sm font-mono text-gray-800">
                    /{formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    editingCategory ? 'Update Kategori' : 'Simpan Kategori'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;