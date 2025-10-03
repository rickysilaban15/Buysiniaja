import { supabase } from '@/integrations/supabase/client';

export interface PromoValidationResult {
  isValid: boolean;
  discountAmount: number;
  message?: string;
  promo?: any;
}

export const validatePromo = async (code: string, cartTotal: number): Promise<PromoValidationResult> => {
  try {
    // Bersihkan kode promo dari whitespace
    const cleanCode = code.trim().toUpperCase();
    console.log('🔍 Validating promo code:', cleanCode);
    
    const { data: promo, error } = await supabase
      .from('promos')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle(); // Gunakan maybeSingle() daripada single()

    if (error) {
      console.error('❌ Database error:', error);
      return {
        isValid: false,
        discountAmount: 0,
        message: 'Terjadi kesalahan sistem. Silakan coba lagi.'
      };
    }

    if (!promo) {
      console.log('❌ Promo not found for code:', cleanCode);
      return {
        isValid: false,
        discountAmount: 0,
        message: 'Kode promo tidak ditemukan'
      };
    }

    console.log('📋 Promo found:', promo.name, '- Status:', promo.status);

    // Cek status
    if (promo.status !== 'active') {
      return {
        isValid: false,
        discountAmount: 0,
        message: 'Promo tidak aktif'
      };
    }

    // Cek tanggal
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);
    
    console.log('📅 Date check:', {
      now: now.toLocaleDateString('id-ID'),
      start: start.toLocaleDateString('id-ID'),
      end: end.toLocaleDateString('id-ID')
    });
    
    if (now < start) {
      return {
        isValid: false,
        discountAmount: 0,
        message: `Promo akan mulai pada ${start.toLocaleDateString('id-ID')}`
      };
    }
    
    if (now > end) {
      return {
        isValid: false,
        discountAmount: 0,
        message: `Promo telah berakhir pada ${end.toLocaleDateString('id-ID')}`
      };
    }

    // Cek kuota
    const currentUses = promo.current_uses || 0;
    const maxUses = promo.max_uses || 0;
    
    if (maxUses > 0 && currentUses >= maxUses) {
      return {
        isValid: false,
        discountAmount: 0,
        message: 'Kuota promo telah habis'
      };
    }

    // Cek minimum order
    const minOrder = promo.min_order_value || 0;
    if (minOrder > 0 && cartTotal < minOrder) {
      return {
        isValid: false,
        discountAmount: 0,
        message: `Minimum order Rp ${minOrder.toLocaleString('id-ID')}`
      };
    }

    // Hitung diskon
    let discountAmount = 0;
    if (promo.discount_type === 'percentage') {
      discountAmount = cartTotal * (promo.discount_value / 100);
      // Untuk diskon persentase, pastikan tidak melebihi 100%
      discountAmount = Math.min(discountAmount, cartTotal);
    } else {
      discountAmount = Math.min(promo.discount_value, cartTotal);
    }

    console.log('💰 Discount calculated:', discountAmount);

    return {
      isValid: true,
      discountAmount: Math.round(discountAmount), // Bulatkan ke integer
      promo
    };

  } catch (error) {
    console.error('❌ Error validating promo:', error);
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Terjadi kesalahan saat validasi promo'
    };
  }
};

export const incrementPromoUsage = async (promoId: string): Promise<void> => {
  try {
    console.log('🔄 Incrementing usage for promo:', promoId);
    
    // Coba gunakan RPC function dulu
    const { error: rpcError } = await supabase.rpc('increment_promo_uses', {
      promo_id: promoId
    });

    if (rpcError) {
      console.log('❌ RPC failed, trying direct update...');
      // Fallback: update manual
      const { data: currentPromo } = await supabase
        .from('promos')
        .select('current_uses')
        .eq('id', promoId)
        .single();

      const currentUses = currentPromo?.current_uses || 0;
      
      const { error: updateError } = await supabase
        .from('promos')
        .update({ 
          current_uses: currentUses + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', promoId);

      if (updateError) throw updateError;
    }
    
    console.log('✅ Promo usage incremented successfully');
  } catch (error) {
    console.error('❌ Error incrementing promo usage:', error);
    throw error;
  }
};