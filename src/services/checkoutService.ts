// services/checkoutService.ts
import { supabase } from '@/integrations/supabase/client';

export interface CheckoutData {
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  catatan: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  max_quantity: number;
}

// === Main Checkout Process ===
export const processCheckout = async (
  items: CartItem[],
  total: number,
  customer: CheckoutData
) => {
  try {
    console.log('Starting checkout process...', { items, total, customer });

    // 1. Simpan data customer
    const customerResult = await saveCustomer(customer);

    // 2. Generate order number + tracking pin
    const orderNumber = generateOrderNumber();
    const trackingPin = generateTrackingPin();

    // 3. Simpan order ke database
    const orderResult = await saveOrder(orderNumber, trackingPin, total, customer, customerResult.id);

    // 4. Simpan order items
    await saveOrderItems(orderResult.id, items);

    // 5. Update stock produk
    await updateProductStock(items);

    return {
      success: true,
      orderId: orderResult.id,
      orderNumber,
      trackingPin,
      customer,
      items,
      total,
    };
  } catch (error) {
    console.error('Checkout process error:', error);
    throw new Error('Gagal memproses checkout. Silakan coba lagi.');
  }
};

// === Save Customer ===
export const saveCustomer = async (customer: CheckoutData) => {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      full_name: customer.nama,
      email: customer.email,
      phone: customer.telepon,
      address: customer.alamat,
      city: customer.kota,
      postal_code: customer.kodePos,
      province: customer.provinsi,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving customer:', error);
    throw new Error('Gagal menyimpan data customer');
  }

  return data;
};

// === Save Order ===
export const saveOrder = async (
  orderNumber: string,
  trackingPin: string,
  total: number,
  customer: CheckoutData,
  customerId?: string
) => {
  try {
    console.log('💾 Starting to save order...');

    // 1. Dapatkan payment method ID yang valid untuk "Midtrans"
    let paymentMethodId = await getPaymentMethodId('Midtrans');
    
    // Jika Midtrans tidak ditemukan, gunakan Bank Transfer sebagai fallback
    if (!paymentMethodId) {
      console.log('🔄 Midtrans not found, using Bank Transfer as fallback');
      paymentMethodId = await getPaymentMethodId('Bank Transfer');
    }

    // Jika masih tidak ditemukan, gunakan payment method pertama yang aktif
    if (!paymentMethodId) {
      const { data: fallbackMethods } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(1);
      
      if (fallbackMethods && fallbackMethods.length > 0) {
        paymentMethodId = fallbackMethods[0].id;
        console.log('⚠️ Using first available payment method:', paymentMethodId);
      }
    }

    if (!paymentMethodId) {
      throw new Error('Tidak ada payment method yang tersedia');
    }

    console.log('✅ Using payment method ID:', paymentMethodId);

    // 2. Siapkan data order dengan payment_method yang valid
    const orderData: any = {
      order_number: orderNumber,
      tracking_pin: trackingPin,
      customer_name: customer.nama,
      customer_email: customer.email,
      customer_phone: customer.telepon,
      customer_address: customer.alamat,
      customer_city: customer.kota,
      customer_postal_code: customer.kodePos,
      customer_province: customer.provinsi,
      subtotal: total,
      shipping_cost: 0,
      tax_amount: 0,
      total_amount: total,
      payment_method: paymentMethodId, // Sekarang UUID yang valid
      payment_status: 'pending',
      status: 'pending',
      notes: customer.catatan,
    };

    if (customerId) {
      orderData.customer_id = customerId;
    }

    console.log('📦 Order data to save:', orderData);

    // 3. Simpan ke database
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      throw new Error(`Gagal menyimpan data order: ${error.message}`);
    }

    console.log('✅ Order saved successfully:', data);
    return data;

  } catch (error) {
    console.error('❌ Error in saveOrder:', error);
    throw error;
  }
};

// === Helper function to get payment method ID ===
const getPaymentMethodId = async (methodName: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('id, name, code')
      .eq('is_active', true)
      .or(`name.ilike.%${methodName}%,code.ilike.%${methodName}%`);

    if (error) {
      console.error('Error fetching payment methods:', error);
      return null;
    }

    if (data && data.length > 0) {
      console.log(`✅ Found payment method "${methodName}":`, data[0]);
      return data[0].id;
    }

    console.log(`❌ Payment method "${methodName}" not found`);
    return null;
  } catch (error) {
    console.error('Error in getPaymentMethodId:', error);
    return null;
  }
};


// === Save Order Items ===
export const saveOrderItems = async (orderId: string, items: CartItem[]) => {
  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    product_name: item.name,
    product_image: item.image,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }));

  const { error } = await supabase.from('order_items').insert(orderItems);

  if (error) {
    console.error('Error saving order items:', error);
    throw new Error('Gagal menyimpan item order');
  }
};

// === Update Product Stock ===
export const updateProductStock = async (items: CartItem[]) => {
  for (const item of items) {
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', item.id)
      .single();

    if (product) {
      const newStock = product.stock_quantity - item.quantity;

      const { error } = await supabase
        .from('products')
        .update({
          stock_quantity: newStock,
          status: newStock <= 0 ? 'out_of_stock' : 'active',
        })
        .eq('id', item.id);

      if (error) {
        console.error('Error updating product stock:', error);
      }
    }
  }
};

// === Helpers ===
export const generateOrderNumber = (): string => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = now.getTime().toString().slice(-6);
  return `ORD-${date}-${time}`;
};

// 6 digit angka
export const generateTrackingPin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const updateOrderPaymentStatus = async (
  orderId: string,
  paymentStatus: string,
  paymentReference?: string
) => {
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: paymentStatus,
      payment_reference: paymentReference,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Gagal update status pembayaran');
  }
};
