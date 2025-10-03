// components/PromoAnalytics.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PromoAnalytics: React.FC<{ promos: Promo[] }> = ({ promos }) => {
  const data = promos.map(promo => ({
    name: promo.code,
    usage: promo.current_uses || 0,
    limit: promo.max_uses || 0,
    usageRate: promo.max_uses ? ((promo.current_uses || 0) / promo.max_uses) * 100 : 0
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Analisis Penggunaan Promo</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="usage" fill="#3b82f6" name="Penggunaan" />
            <Bar dataKey="limit" fill="#e5e7eb" name="Maksimum" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

