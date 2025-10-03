import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Edit, Trash2, Save, X, Search, Filter } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';

interface Setting {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'number' | 'email' | 'url' | 'textarea' | 'boolean';
  description: string;
  created_at: string;
  updated_at: string;
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [saving, setSaving] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    key: '',
    value: '',
    type: 'text' as Setting['type'],
    description: '',
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    
    // Mock data based on the database schema
    const mockSettings: Setting[] = [
      {
        id: '1',
        key: 'site_title',
        value: 'Buysini - Grosir Terpercaya',
        type: 'text',
        description: 'Judul website',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        key: 'site_description',
        value: 'Platform grosir online terpercaya untuk kebutuhan bisnis Anda',
        type: 'textarea',
        description: 'Deskripsi website',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        key: 'contact_phone',
        value: '+62 812-3456-7890',
        type: 'text',
        description: 'Nomor telepon kontak',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        key: 'contact_email',
        value: 'info@buysini.com',
        type: 'email',
        description: 'Email kontak',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '5',
        key: 'contact_address',
        value: 'Jl. Contoh No. 123, Jakarta',
        type: 'textarea',
        description: 'Alamat',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '6',
        key: 'shipping_cost',
        value: '15000',
        type: 'number',
        description: 'Biaya pengiriman default (Rupiah)',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '7',
        key: 'min_order_amount',
        value: '100000',
        type: 'number',
        description: 'Minimum order amount (Rupiah)',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '8',
        key: 'tax_rate',
        value: '0.11',
        type: 'number',
        description: 'Tax rate (PPN 11%)',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '9',
        key: 'free_shipping_threshold',
        value: '500000',
        type: 'number',
        description: 'Minimum order untuk gratis ongkir (Rupiah)',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '10',
        key: 'enable_whatsapp_order',
        value: 'true',
        type: 'boolean',
        description: 'Aktifkan pemesanan melalui WhatsApp',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '11',
        key: 'whatsapp_number',
        value: '+6281234567890',
        type: 'text',
        description: 'Nomor WhatsApp untuk pemesanan',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '12',
        key: 'site_logo',
        value: '/logo.png',
        type: 'url',
        description: 'URL Logo website',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
    
    setSettings(mockSettings);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate unique key
    const keyExists = settings.some(setting => 
      setting.key.toLowerCase() === formData.key.toLowerCase() && 
      setting.id !== editingSetting?.id
    );
    
    if (keyExists) {
      alert('Key sudah ada! Gunakan key yang berbeda.');
      return;
    }
    
    if (editingSetting) {
      // Update setting
      setSettings(settings.map(setting => 
        setting.id === editingSetting.id 
          ? { ...setting, ...formData, updated_at: new Date().toISOString() }
          : setting
      ));
    } else {
      // Create setting
      const newSetting: Setting = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSettings([...settings, newSetting]);
    }

    resetForm();
    setShowModal(false);
  };

  const handleEdit = (setting: Setting) => {
    setEditingSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.value,
      type: setting.type,
      description: setting.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus setting ini?')) {
      setSettings(settings.filter(setting => setting.id !== id));
    }
  };

  const handleQuickSave = async (id: string, value: string) => {
    setSaving(id);
    
    // Simulate API call delay
    setTimeout(() => {
      setSettings(settings.map(setting =>
        setting.id === id 
          ? { ...setting, value, updated_at: new Date().toISOString() }
          : setting
      ));
      setSaving(null);
    }, 500);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      type: 'text',
      description: '',
    });
    setEditingSetting(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatValue = (value: string, type: Setting['type']) => {
    switch (type) {
      case 'boolean':
        return value === 'true' ? 'Ya' : 'Tidak';
      case 'number':
        // Format as currency if it's a monetary value
        if (value && !isNaN(Number(value))) {
          const num = Number(value);
          if (num > 1000) {
            return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(num);
          }
          return value;
        }
        return value;
      case 'url':
        return value.length > 50 ? value.substring(0, 50) + '...' : value;
      default:
        return value.length > 50 ? value.substring(0, 50) + '...' : value;
    }
  };

  const getTypeColor = (type: Setting['type']) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      email: 'bg-purple-100 text-purple-800',
      url: 'bg-orange-100 text-orange-800',
      textarea: 'bg-indigo-100 text-indigo-800',
      boolean: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Filter settings based on search and type
  const filteredSettings = settings.filter(setting => {
    const matchesSearch = setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || setting.type === filterType;
    return matchesSearch && matchesType;
  });

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
                <div className="flex items-center gap-3">
                  <SettingsIcon className="h-8 w-8 text-gray-700" />
                  <h1 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h1>
                </div>
                <p className="text-gray-600 mt-1">Kelola pengaturan dan konfigurasi website</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Tambah Setting
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan key, deskripsi, atau value..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 h-4 w-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="url">URL</option>
                  <option value="textarea">Textarea</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
            </div>
          </div>

          {/* Settings Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terakhir Update
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSettings.map((setting) => (
                  <SettingRow
                    key={setting.id}
                    setting={setting}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onQuickSave={handleQuickSave}
                    saving={saving === setting.id}
                    formatValue={formatValue}
                    getTypeColor={getTypeColor}
                    formatDate={formatDate}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredSettings.length === 0 && (
            <div className="text-center py-12">
              <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2 text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Tidak ada setting yang sesuai dengan filter'
                  : 'Belum ada setting'
                }
              </div>
              {(!searchTerm && filterType === 'all') && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Tambah setting pertama
                </button>
              )}
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
                {editingSetting ? 'Edit Setting' : 'Tambah Setting'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key *
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contoh: site_title"
                  required
                  disabled={!!editingSetting}
                />
                {editingSetting && (
                  <p className="text-xs text-gray-500 mt-1">Key tidak dapat diubah saat edit</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Setting['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="url">URL</option>
                  <option value="textarea">Textarea</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value *
                </label>
                {formData.type === 'textarea' ? (
                  <textarea
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    required
                  />
                ) : formData.type === 'boolean' ? (
                  <select
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="true">True (Ya)</option>
                    <option value="false">False (Tidak)</option>
                  </select>
                ) : (
                  <input
                    type={formData.type === 'number' ? 'number' : formData.type === 'email' ? 'email' : formData.type === 'url' ? 'url' : 'text'}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step={formData.type === 'number' ? 'any' : undefined}
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Deskripsi untuk setting ini"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSetting ? 'Update' : 'Simpan'}
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

// Separate component for setting row to handle inline editing
interface SettingRowProps {
  setting: Setting;
  onEdit: (setting: Setting) => void;
  onDelete: (id: string) => void;
  onQuickSave: (id: string, value: string) => void;
  saving: boolean;
  formatValue: (value: string, type: Setting['type']) => string;
  getTypeColor: (type: Setting['type']) => string;
  formatDate: (dateString: string) => string;
}

const SettingRow: React.FC<SettingRowProps> = ({
  setting,
  onEdit,
  onDelete,
  onQuickSave,
  saving,
  formatValue,
  getTypeColor,
  formatDate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(setting.value);

  const handleQuickSave = () => {
    if (editValue !== setting.value) {
      onQuickSave(setting.id, editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(setting.value);
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {setting.key}
          </code>
        </div>
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            {setting.type === 'textarea' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            ) : setting.type === 'boolean' ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : (
              <input
                type={setting.type === 'number' ? 'number' : setting.type === 'email' ? 'email' : setting.type === 'url' ? 'url' : 'text'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step={setting.type === 'number' ? 'any' : undefined}
              />
            )}
            <button
              onClick={handleQuickSave}
              disabled={saving}
              className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
              ) : (
                <Save size={16} />
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
            onClick={() => setIsEditing(true)}
          >
            <span className="text-sm text-gray-900">
              {formatValue(setting.value, setting.type)}
            </span>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(setting.type)}`}>
          {setting.type}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs">
          {setting.description}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(setting.updated_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(setting)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(setting.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminSettings;