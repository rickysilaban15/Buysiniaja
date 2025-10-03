-- Fix security issue: Set search_path for generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;