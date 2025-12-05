-- Add discount_code_used column to bookings table
ALTER TABLE IF EXISTS public.bookings 
ADD COLUMN IF NOT EXISTS discount_code_used TEXT;

-- Add discount_code_used column to purchases table
ALTER TABLE IF EXISTS public.purchases 
ADD COLUMN IF NOT EXISTS discount_code_used TEXT;

-- Create index for querying by discount code
CREATE INDEX IF NOT EXISTS idx_bookings_discount_code ON public.bookings(discount_code_used);
CREATE INDEX IF NOT EXISTS idx_purchases_discount_code ON public.purchases(discount_code_used);
