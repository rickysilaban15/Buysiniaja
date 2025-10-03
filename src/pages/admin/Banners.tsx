import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Link, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    button_text: '',
    is_active: true,
    sort_order: 0,
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    // Mock data
    const mockBanners: Banner[] = [
      {
        id: '1',
        title: 'Promo Grosir Spesial',
        subtitle: 'Dapatkan diskon hingga 30% untuk pembelian dalam jumlah besar',
        image_url: '/banners/promo-grosir.jpg',
        link_url: '/category',
        button_text: 'Belanja Sekarang',
        is_active: true,
        sort_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: 'Produk Terbaru',
        subtitle: 'Jelajahi koleksi produk terbaru dari berbagai kategori',
        image_url: '/banners/produk-baru.jpg',
        link_url: '/promo',
        button_text: 'Lihat Produk',
        is_active: true,
        sort_order: 2,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      },
      {
        id: '3',
        title: 'Gratis Ongkir',
        subtitle: 'Untuk pembelian minimal Rp 500.000',
        image_url: '/banners/gratis-ongkir.jpg',
        is_active: false,
        sort_order: 3,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      }
    ];
    
    setBanners(mockBanners.sort((a, b) => a.sort_order - b.sort_order));
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBanner) {
      // Update banner
      setBanners(banners.map(banner => 
        banner.id === editingBanner.id 
          ? { ...banner, ...formData, updated_at: new Date().toISOString() }
          : banner
      ).sort((a, b) => a.sort_order - b.sort_order));
    } else {
      // Create banner
      const newBanner: Banner = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setBanners([...banners, newBanner].sort((a, b) => a.sort_order - b.sort_order));
    }

    resetForm();
    setShowModal(false);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      button_text: banner.button_text || '',
      is_active: banner.is_active,
      sort_order: banner.sort_order,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus banner ini?')) {
      setBanners(banners.filter(banner => banner.id !== id));
    }
  };

  const toggleActive = async (id: string) => {
    setBanners(banners.map(banner =>
      banner.id === id 
        ? { ...banner, is_active: !banner.is_active, updated_at: new Date().toISOString() }
        : banner
    ));
  };

  const updateSortOrder = async (id: string, direction: 'up' | 'down') => {
    const bannerIndex = banners.findIndex(b => b.id === id);
    if (bannerIndex === -1) return;

    const newBanners = [...banners];
    const currentBanner = newBanners[bannerIndex];
    
    if (direction === 'up' && bannerIndex > 0) {
      const prevBanner = newBanners[bannerIndex - 1];
      const tempSort = currentBanner.sort_order;
      currentBanner.sort_order = prevBanner.sort_order;
      prevBanner.sort_order = tempSort;
      
      newBanners[bannerIndex] = prevBanner;
      newBanners[bannerIndex - 1] = currentBanner;
    } else if (direction === 'down' && bannerIndex < newBanners.length - 1) {
      const nextBanner = newBanners[bannerIndex + 1];
      const tempSort = currentBanner.sort_order;
      currentBanner.sort_order = nextBanner.sort_order;
      nextBanner.sort_order = tempSort;
      
      newBanners[bannerIndex] = nextBanner;
      newBanners[bannerIndex + 1] = currentBanner;
    }

    setBanners(newBanners.sort((a, b) => a.sort_order - b.sort_order));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      button_text: '',
      is_active: true,
      sort_order: banners.length + 1,
    });
    setEditingBanner(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Kelola Banner</h1>
                <p className="text-gray-600 mt-1">Kelola banner promosi untuk halaman utama</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Tambah Banner
              </button>
            </div>
          </div>

          {/* Banner Preview */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Preview Banner Aktif</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners
                .filter(banner => banner.is_active)
                .slice(0, 3)
                .map(banner => (
                  <div key={banner.id} className="relative rounded-lg overflow-hidden shadow-md">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x200/e5e7eb/9ca3af?text=Banner';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h4 className="font-bold text-lg">{banner.title}</h4>
                        {banner.subtitle && (
                          <p className="text-sm mt-1">{banner.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            {banners.filter(banner => banner.is_active).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada banner aktif
              </div>
            )}
          </div>

          {/* Banners Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Banner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Konten
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urutan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner, index) => (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-24">
                          <img
                            className="h-16 w-24 rounded-lg object-cover"
                            src={banner.image_url}
                            alt={banner.title}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/96x64/e5e7eb/9ca3af?text=Banner';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                          {banner.subtitle && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">{banner.subtitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {banner.button_text ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {banner.button_text}
                          </span>
                        ) : (
                          <span className="text-gray-400">Tanpa tombol</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {banner.link_url ? (
                        <div className="flex items-center text-sm text-blue-600">
                          <Link size={14} className="mr-1" />
                          <span className="max-w-xs truncate">{banner.link_url}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Tanpa link</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(banner.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          banner.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {banner.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        {banner.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{banner.sort_order}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => updateSortOrder(banner.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => updateSortOrder(banner.id, 'down')}
                            disabled={index === banners.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(banner.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-600 hover:text-red-800"
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

          {banners.length === 0 && (
            <div className="text-center py-12">
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2 text-gray-500">Belum ada banner</div>
              <button
                onClick={() => setShowModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Tambah banner pertama
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingBanner ? 'Edit Banner' : 'Tambah Banner'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Banner *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Gambar *
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Link
                </label>
                <input
                  type="text"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/category atau https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teks Tombol
                </label>
                <input
                  type="text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Belanja Sekarang"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutan Tampil
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Banner Aktif
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingBanner ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
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

export default AdminBanners;

