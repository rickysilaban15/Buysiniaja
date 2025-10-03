// components/PromoSelector.tsx
import React, { useState, useEffect } from 'react';
import { Tag, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Promo {
  id: string;
  name: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value?: number;
}

interface PromoSelectorProps {
  cartTotal: number;
  selectedPromo?: string;
  onPromoSelect: (promo: Promo | null) => void;
}

const PromoSelector: React.FC<PromoSelectorProps> = ({ 
  cartTotal, 
  selectedPromo, 
  onPromoSelect 
}) => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ganti fungsi fetchApplicablePromos dengan:
const fetchApplicablePromos = async () => {
  setLoading(true);
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('promos')
      .select('*')
      .eq('status', 'active')
      .lte('start_date', now)
      .gte('end_date', now)
      .order('is_featured', { ascending: false });

    if (error) throw error;

    // Filter promos yang memenuhi semua kondisi
    const applicablePromos = (data || []).filter(promo => {
      // Cek minimum order
      const meetsMinOrder = !promo.min_order_value || cartTotal >= promo.min_order_value;
      
      // Cek kuota penggunaan
      const hasQuota = !promo.max_uses || (promo.current_uses || 0) < promo.max_uses;
      
      return meetsMinOrder && hasQuota;
    });

    setPromos(applicablePromos);
  } catch (error) {
    console.error('Error fetching promos:', error);
    setPromos([]);
  } finally {
    setLoading(false);
  }
};

// Tambahkan fungsi untuk mengecek validitas promo
const isPromoValid = (promo: Promo) => {
  const now = new Date();
  const start = new Date(promo.start_date);
  const end = new Date(promo.end_date);
  
  const isActive = start <= now && end >= now;
  const hasQuota = !promo.max_uses || (promo.current_uses || 0) < promo.max_uses;
  const meetsMinOrder = !promo.min_order_value || cartTotal >= promo.min_order_value;
  
  return isActive && hasQuota && meetsMinOrder;
};
  useEffect(() => {
    if (showSelector) {
      fetchApplicablePromos();
    }
  }, [showSelector, cartTotal]);

  const calculateDiscount = (promo: Promo, total: number) => {
    if (promo.discount_type === 'percentage') {
      return total * (promo.discount_value / 100);
    }
    return promo.discount_value;
  };

  const getSelectedPromo = () => {
    return promos.find(p => p.code === selectedPromo);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Kode Promo
        </h4>
        
        {selectedPromo ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-600 font-medium">
              {getSelectedPromo()?.name}
            </span>
            <button
              onClick={() => onPromoSelect(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showSelector ? 'Tutup' : 'Pilih Promo'}
          </button>
        )}
      </div>

      {showSelector && (
        <div className="space-y-3 mt-3">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : promos.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-2">
              Tidak ada promo yang tersedia
            </p>
          ) : (
            promos.map((promo) => (
              <div
                key={promo.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedPromo === promo.code
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => {
                  onPromoSelect(promo);
                  setShowSelector(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{promo.name}</span>
                      {promo.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{promo.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {promo.code}
                      </code>
                      <span>
                        Diskon: {promo.discount_type === 'percentage' 
                          ? `${promo.discount_value}%` 
                          : `Rp${promo.discount_value.toLocaleString()}`
                        }
                      </span>
                    </div>
                  </div>
                  
                  {selectedPromo === promo.code ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <div className="text-green-600 font-semibold text-sm flex-shrink-0">
                      -Rp{calculateDiscount(promo, cartTotal).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedPromo && getSelectedPromo() && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800 text-sm">
                {getSelectedPromo()?.name}
              </p>
              <p className="text-green-600 text-xs">
                Diskon: Rp{calculateDiscount(getSelectedPromo()!, cartTotal).toLocaleString()}
              </p>
            </div>
            <span className="text-green-700 font-bold">
              -Rp{calculateDiscount(getSelectedPromo()!, cartTotal).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoSelector;