// pages/AdminFooter.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FooterItem {
  name: string;
  logo: string;
  url: string;
}

interface FooterSection {
  id: string;
  title: string;
  type: string;
  items: FooterItem[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminFooter: React.FC = () => {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'service',
    items: [] as FooterItem[],
    sort_order: 0,
    is_active: true
  });

  const [itemForm, setItemForm] = useState({
    name: '',
    logo: '',
    url: ''
  });

  const sectionTypes = [
    { value: 'payment', label: 'Payment Methods', icon: '💳' },
    { value: 'shipping', label: 'Shipping Methods', icon: '🚚' },
    { value: 'service', label: 'Services', icon: '🛎️' },
    { value: 'security', label: 'Security & Privacy', icon: '🔒' },
    { value: 'social', label: 'Social Media', icon: '🌐' },
    { value: 'category', label: 'Categories', icon: '📦' }
  ];

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('footer_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const parsedSections = data?.map(section => ({
        ...section,
        items: typeof section.items === 'string' ? JSON.parse(section.items) : section.items
      })) || [];

      setSections(parsedSections);
    } catch (error) {
      console.error('Error fetching footer sections:', error);
      alert('Gagal memuat data footer');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const sectionData = {
        ...formData,
        items: JSON.stringify(formData.items)
      };

      if (editingSection) {
        const { error } = await supabase
          .from('footer_sections')
          .update(sectionData)
          .eq('id', editingSection.id);

        if (error) throw error;
        alert('Section berhasil diupdate!');
      } else {
        const { error } = await supabase
          .from('footer_sections')
          .insert([sectionData]);

        if (error) throw error;
        alert('Section berhasil ditambahkan!');
      }

      await fetchSections();
      resetForm();
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving section:', error);
      alert('Gagal menyimpan section: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus section ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('footer_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSections();
      alert('Section berhasil dihapus!');
    } catch (error: any) {
      console.error('Error deleting section:', error);
      alert('Gagal menghapus section: ' + error.message);
    }
  };

  const handleEdit = (section: FooterSection) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      type: section.type,
      items: section.items,
      sort_order: section.sort_order,
      is_active: section.is_active
    });
    setShowModal(true);
  };

  const addItem = () => {
    if (!itemForm.name || !itemForm.logo || !itemForm.url) {
      alert('Harap isi semua field item');
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...itemForm }]
    }));

    setItemForm({ name: '', logo: '', url: '' });
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...formData.items];
    if (direction === 'up' && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const updateSortOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('footer_sections')
        .update({ sort_order: newOrder })
        .eq('id', id);

      if (error) throw error;
      await fetchSections();
    } catch (error) {
      console.error('Error updating sort order:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'service',
      items: [],
      sort_order: sections.length,
      is_active: true
    });
    setItemForm({ name: '', logo: '', url: '' });
    setEditingSection(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data footer...</p>
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
                <h1 className="text-2xl font-bold text-gray-800">Kelola Footer</h1>
                <p className="text-gray-600 mt-1">
                  Manage sections dan items footer yang akan ditampilkan
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Tambah Section
              </button>
            </div>
          </div>

          {/* Sections List */}
          <div className="p-6">
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {sectionTypes.find(t => t.value === section.type)?.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{section.title}</h3>
                        <p className="text-sm text-gray-600">
                          {section.items.length} items • {section.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {index > 0 && (
                        <button
                          onClick={() => updateSortOrder(section.id, section.sort_order - 1)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp size={16} />
                        </button>
                      )}
                      {index < sections.length - 1 && (
                        <button
                          onClick={() => updateSortOrder(section.id, section.sort_order + 1)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => handleEdit(section)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {section.items.slice(0, 5).map((item, itemIndex) => (
                      <span
                        key={itemIndex}
                        className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
                      >
                        <span>{item.logo}</span>
                        <span>{item.name}</span>
                      </span>
                    ))}
                    {section.items.length > 5 && (
                      <span className="text-gray-500 text-sm">
                        +{section.items.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {sections.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">Belum ada sections</div>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Tambah section pertama
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal untuk Add/Edit Section */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingSection ? 'Edit Section' : 'Tambah Section Baru'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Section *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Section *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {sectionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Item Form */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Tambah Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama *
                    </label>
                    <input
                      type="text"
                      value={itemForm.name}
                      onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Nama item"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo/Emoji *
                    </label>
                    <input
                      type="text"
                      value={itemForm.logo}
                      onChange={(e) => setItemForm(prev => ({ ...prev, logo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="🏦 / 🔒 / 📱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL *
                    </label>
                    <input
                      type="text"
                      value={itemForm.url}
                      onChange={(e) => setItemForm(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="/path atau https://"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  + Tambah Item
                </button>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Items ({formData.items.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.logo}</span>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.url}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === formData.items.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || formData.items.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {saving ? 'Menyimpan...' : (editingSection ? 'Update Section' : 'Simpan Section')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFooter;