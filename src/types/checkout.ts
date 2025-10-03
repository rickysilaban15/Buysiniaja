// types/checkout.ts
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

export interface CheckoutPayload {
  items: CartItem[];
  total: number;
  customer: CheckoutData;
}