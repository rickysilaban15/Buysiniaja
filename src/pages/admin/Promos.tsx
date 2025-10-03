import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Promo {
  id: string;
  name: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  start_date: string;
  end_date: string;
  min_order_value?: number;
  max_uses?: number;
  current_uses?: number;
  product_ids?: string[];
  category_ids?: string[];
  is_featured?: boolean;
  status: "active" | "inactive" | "expired";
  category?: string;
}

const AdminPromos: React.FC = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 0,
    start_date: "",
    end_date: "",
    min_order_value: 0,
    max_uses: 0,
    current_uses: 0,
    is_featured: false,
    status: "active" as "active" | "inactive" | "expired",
    category: "general",
  });

  // Payload untuk create/update
  const getPayload = () => ({
    name: formData.name,
    code: formData.code,
    description: formData.description || null,
    discount_type: formData.discount_type,
    discount_value: formData.discount_value,
    start_date: formData.start_date,
    end_date: formData.end_date,
    min_order_value: formData.min_order_value || 0,
    max_uses: formData.max_uses || null,
    current_uses: formData.current_uses || 0,
    is_featured: formData.is_featured,
    status: formData.status,
    category: formData.category,
  });

  useEffect(() => {
    fetchPromos();
    
    // Realtime subscription
    const subscription = supabase
      .channel('promos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promos' }, () => {
        fetchPromos();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("promos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromos(data || []);
    } catch (error: any) {
      console.error('Error fetching promos:', error);
      showNotification('error', 'Gagal memuat data promo');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = getPayload();

      if (editingPromo) {
        const { error } = await supabase
          .from("promos")
          .update(payload)
          .eq("id", editingPromo.id);
        
        if (error) throw error;
        showNotification('success', 'Promo berhasil diupdate');
      } else {
        const { error } = await supabase
          .from("promos")
          .insert([payload]);
        
        if (error) throw error;
        showNotification('success', 'Promo berhasil ditambahkan');
      }
      
      setShowModal(false);
      resetForm();
      fetchPromos();
    } catch (err: any) {
      showNotification('error', err.message || 'Terjadi kesalahan');
      console.error(err);
    }
  };

  const handleEdit = (promo: Promo) => {
    setEditingPromo(promo);
    setFormData({
      name: promo.name,
      code: promo.code,
      description: promo.description || "",
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      start_date: promo.start_date.split('T')[0],
      end_date: promo.end_date.split('T')[0],
      min_order_value: promo.min_order_value || 0,
      max_uses: promo.max_uses || 0,
      current_uses: promo.current_uses || 0,
      is_featured: promo.is_featured || false,
      status: promo.status,
      category: promo.category || "general",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah yakin ingin menghapus promo ini?")) {
      try {
        const { error } = await supabase.from("promos").delete().eq("id", id);
        
        if (error) throw error;
        showNotification('success', 'Promo berhasil dihapus');
        fetchPromos();
      } catch (error: any) {
        showNotification('error', 'Gagal menghapus promo');
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      start_date: "",
      end_date: "",
      min_order_value: 0,
      max_uses: 0,
      current_uses: 0,
      is_featured: false,
      status: "active",
      category: "general", // Diperbaiki - tidak reference ke promo
    });
    setEditingPromo(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Kelola Promo</h2>
          <p className="text-gray-600 text-sm">Atur semua promo dan diskon untuk pelanggan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={18} />
          Tambah Promo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 border text-left font-semibold">Nama</th>
                <th className="p-3 border text-left font-semibold">Kode</th>
                <th className="p-3 border text-left font-semibold">Diskon</th>
                <th className="p-3 border text-left font-semibold">Periode</th>
                <th className="p-3 border text-left font-semibold">Min. Order</th>
                <th className="p-3 border text-left font-semibold">Penggunaan</th>
                <th className="p-3 border text-left font-semibold">Kategori</th>
                <th className="p-3 border text-left font-semibold">Status</th>
                <th className="p-3 border text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50">
                  <td className="p-3 border">
                    <div className="flex items-center gap-2">
                      {promo.is_featured && <Tag size={16} className="text-yellow-500" />}
                      {promo.name}
                    </div>
                  </td>
                  <td className="p-3 border">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{promo.code}</code>
                  </td>
                  <td className="p-3 border font-semibold text-green-600">
                    {promo.discount_type === "percentage"
                      ? `${promo.discount_value}%`
                      : `Rp ${promo.discount_value.toLocaleString('id-ID')}`}
                  </td>
                  <td className="p-3 border text-sm">
                    {new Date(promo.start_date).toLocaleDateString('id-ID')} - {new Date(promo.end_date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-3 border text-sm">
                    {promo.min_order_value ? `Rp ${promo.min_order_value.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="p-3 border text-sm">
                    {promo.current_uses || 0} / {promo.max_uses || '∞'}
                  </td>
                  <td className="p-3 border text-sm capitalize">
                    {promo.category || 'general'}
                  </td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(promo.status)}`}>
                      {promo.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 border">
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => handleEdit(promo)} 
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(promo.id)} 
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {promos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Tag size={48} className="mx-auto mb-4 opacity-50" />
              <p>Belum ada promo. Tambahkan promo pertama Anda!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingPromo ? "Edit Promo" : "Tambah Promo Baru"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Promo *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Diskon Akhir Tahun"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Kode Promo *</label>
                  <input
                    type="text"
                    placeholder="Contoh: DISKON2024"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  placeholder="Deskripsi singkat tentang promo"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe Diskon *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as "percentage" | "fixed" })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal (Rp)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Nilai Diskon *</label>
                  <input
                    type="number"
                    placeholder={formData.discount_type === 'percentage' ? '10' : '50000'}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Berakhir *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min. Nilai Order (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: Number(e.target.value) })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Maks. Penggunaan</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: Number(e.target.value) })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="general">General</option>
                    <option value="flash_sale">Flash Sale</option>
                    <option value="new_user">New User</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="special">Special Offer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Penggunaan Saat Ini</label>
                  <input
                    type="number"
                    value={formData.current_uses}
                    onChange={(e) => setFormData({ ...formData, current_uses: Number(e.target.value) })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                    disabled={!editingPromo}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editingPromo ? "Dapat disesuaikan manual" : "Akan tersedia setelah promo dibuat"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                    <option value="expired">Kadaluarsa</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Promo Unggulan</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPromo ? "Update Promo" : "Simpan Promo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromos;