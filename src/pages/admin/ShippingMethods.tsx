// src/pages/admin/ShippingMethods.tsx
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit, Trash2, Upload, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  logo_url: string;
  is_active: boolean;
  sort_order: number;
  estimated_days: string;
  cost: number;
  created_at: string;
}

const ShippingMethods: React.FC = () => {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ShippingMethod>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({
    name: '',
    code: '',
    sort_order: 0,
    estimated_days: '2-3 hari',
    cost: 0,
    is_active: true
  });

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setMethods(data || []);
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAdd = async () => {
    try {
      // Validasi input
      if (!newMethod.name.trim() || !newMethod.code.trim()) {
        alert('Nama dan kode harus diisi');
        return;
      }

      if (newMethod.cost < 0) {
        alert('Harga tidak boleh negatif');
        return;
      }

      const { data, error } = await supabase
        .from('shipping_methods')
        .insert([{
          ...newMethod,
          cost: Number(newMethod.cost) || 0
        }])
        .select();

      if (error) {
        if (error.code === '23505') {
          alert('Kode sudah digunakan, silakan gunakan kode lain');
          return;
        }
        throw error;
      }

      setShowAddForm(false);
      setNewMethod({ 
        name: '', 
        code: '', 
        sort_order: 0, 
        estimated_days: '2-3 hari',
        cost: 0,
        is_active: true 
      });
      fetchShippingMethods();
    } catch (error) {
      console.error('Error adding shipping method:', error);
      alert('Gagal menambah metode pengiriman');
    }
  };

  const handleEdit = (method: ShippingMethod) => {
    setEditingId(method.id);
    setEditData({ ...method });
  };

  const handleSave = async (id: string) => {
    try {
      if (!editData.name?.trim()) {
        alert('Nama harus diisi');
        return;
      }

      if (editData.cost && editData.cost < 0) {
        alert('Harga tidak boleh negatif');
        return;
      }

      const { error } = await supabase
        .from('shipping_methods')
        .update({
          ...editData,
          cost: Number(editData.cost) || 0
        })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setEditData({});
      fetchShippingMethods();
    } catch (error) {
      console.error('Error updating shipping method:', error);
      alert('Gagal menyimpan perubahan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus metode pengiriman ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('shipping_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchShippingMethods();
    } catch (error) {
      console.error('Error deleting shipping method:', error);
      alert('Gagal menghapus metode pengiriman');
    }
  };

  const handleLogoUpload = async (file: File, methodId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${methodId}-${Date.now()}.${fileExt}`;
      
      // Validasi file
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar yang diizinkan');
        return;
      }

      console.log('Uploading shipping logo:', fileName);

      // UPLOAD DENGAN ADMIN CLIENT (bypass RLS)
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('shipping-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload success:', uploadData);

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('shipping-logos')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // UPDATE DATABASE DENGAN REGULAR CLIENT
      const { error: updateError } = await supabase
        .from('shipping_methods')
        .update({ logo_url: publicUrl })
        .eq('id', methodId);

      if (updateError) throw updateError;

      console.log('Database update success');
      fetchShippingMethods();
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Gagal mengupload logo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ekspedisi Pengiriman</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ekspedisi</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Tambah Ekspedisi Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Ekspedisi *
              </label>
              <input
                type="text"
                value={newMethod.name}
                onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Contoh: JNE Express"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode *
              </label>
              <input
                type="text"
                value={newMethod.code}
                onChange={(e) => setNewMethod({ ...newMethod, code: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Contoh: jne"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urutan Tampilan
              </label>
              <input
                type="number"
                value={newMethod.sort_order}
                onChange={(e) => setNewMethod({ ...newMethod, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biaya Pengiriman (Rp)
              </label>
              <input
                type="number"
                value={newMethod.cost}
                onChange={(e) => setNewMethod({ ...newMethod, cost: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimasi Pengiriman
              </label>
              <input
                type="text"
                value={newMethod.estimated_days}
                onChange={(e) => setNewMethod({ ...newMethod, estimated_days: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Contoh: 2-3 hari"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newMethod.is_active}
                  onChange={(e) => setNewMethod({ ...newMethod, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {/* Methods List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {methods.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada metode pengiriman</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    {editingId === method.id ? (
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="text-lg font-semibold border border-gray-300 rounded px-2 py-1 w-full"
                        placeholder="Nama ekspedisi"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold">{method.name}</h3>
                    )}
                    
                    <div className="flex space-x-2">
                      {editingId === method.id ? (
                        <>
                          <button
                            onClick={() => handleSave(method.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Simpan"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditData({});
                            }}
                            className="text-gray-600 hover:text-gray-800"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(method)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(method.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {method.logo_url ? (
                        <img
                          src={method.logo_url}
                          alt={method.name}
                          className="w-12 h-12 object-contain bg-gray-50 rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <Truck className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-gray-600">Kode: {method.code}</p>
                        {editingId === method.id ? (
                          <div className="space-y-1">
                            <input
                              type="number"
                              value={editData.sort_order ?? method.sort_order}
                              onChange={(e) => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })}
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Urutan"
                            />
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">Urutan: {method.sort_order}</p>
                        )}
                      </div>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file, method.id);
                      }}
                      className="hidden"
                      id={`logo-upload-${method.id}`}
                    />
                    <label
                      htmlFor={`logo-upload-${method.id}`}
                      className="cursor-pointer text-gray-400 hover:text-gray-600"
                      title="Upload Logo"
                    >
                      <Upload className="w-4 h-4" />
                    </label>
                  </div>

                  {/* Biaya Pengiriman */}
                  <div className="mb-2">
                    {editingId === method.id ? (
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600 whitespace-nowrap">Biaya:</label>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-500">Rp</span>
                          <input
                            type="number"
                            value={editData.cost ?? method.cost}
                            onChange={(e) => setEditData({ ...editData, cost: parseInt(e.target.value) || 0 })}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Biaya:</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {formatPrice(method.cost)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    {editingId === method.id ? (
                      <div>
                        <label className="text-sm text-gray-600">Estimasi:</label>
                        <input
                          type="text"
                          value={editData.estimated_days || ''}
                          onChange={(e) => setEditData({ ...editData, estimated_days: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 text-sm ml-2 w-32"
                          placeholder="2-3 hari"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Estimasi: {method.estimated_days}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    {editingId === method.id ? (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editData.is_active ?? method.is_active}
                          onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Aktif</span>
                      </label>
                    ) : (
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          method.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {method.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingMethods;