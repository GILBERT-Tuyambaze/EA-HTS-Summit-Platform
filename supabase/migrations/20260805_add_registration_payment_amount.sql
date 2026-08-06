-- Add payment amount field to registrations
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS payment_amount numeric(12,2) CHECK (payment_amount >= 0);
