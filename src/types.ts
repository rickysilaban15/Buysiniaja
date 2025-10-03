export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'inactive' | 'out_of_stock';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}
