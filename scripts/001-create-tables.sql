-- Teater Platform Database Schema
-- Version 1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ENSEMBLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.ensembles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  director TEXT,
  yellow_team_name TEXT NOT NULL DEFAULT 'Gult lag',
  blue_team_name TEXT NOT NULL DEFAULT 'Blått lag',
  yellow_cast JSONB DEFAULT '[]'::jsonb,
  blue_cast JSONB DEFAULT '[]'::jsonb,
  crew JSONB DEFAULT '[]'::jsonb,
  genre TEXT[] DEFAULT '{}',
  duration_minutes INTEGER,
  year INTEGER,
  language TEXT DEFAULT 'Norsk',
  premiere_date DATE,
  age_rating TEXT,
  thumbnail_url TEXT,
  banner_url TEXT,
  hero_video_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  trailer_url TEXT,
  synopsis_short TEXT,
  synopsis_long TEXT,
  awards JSONB DEFAULT '[]'::jsonb,
  press_quotes JSONB DEFAULT '[]'::jsonb,
  recording_price_nok DECIMAL(10,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  custom_sections JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- RECORDINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ensemble_id UUID NOT NULL REFERENCES public.ensembles(id) ON DELETE CASCADE,
  team TEXT NOT NULL CHECK (team IN ('yellow', 'blue')),
  recording_date DATE,
  jottacloud_embed_url TEXT,
  quality TEXT DEFAULT 'HD',
  duration INTEGER,
  thumbnail_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PURCHASES TABLE (for recordings)
-- =============================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ensemble_id UUID NOT NULL REFERENCES public.ensembles(id) ON DELETE CASCADE,
  recording_ids UUID[] DEFAULT '{}',
  vipps_order_id TEXT,
  amount_paid_nok DECIMAL(10,2) NOT NULL,
  discount_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  access_granted_at TIMESTAMPTZ,
  access_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- VIDEO ACCESS TOKENS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.video_access_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recording_id UUID NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- VENUES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  capacity INTEGER DEFAULT 0,
  seat_map_config JSONB DEFAULT '{}'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  accessibility_info TEXT,
  parking_info TEXT,
  public_transport TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SERIES TABLE (for grouped shows)
-- =============================================
CREATE TABLE IF NOT EXISTS public.series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  shows_count INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SHOWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.shows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ensemble_id UUID REFERENCES public.ensembles(id) ON DELETE SET NULL,
  title TEXT,
  type TEXT NOT NULL DEFAULT 'ensemble_show' CHECK (type IN ('ensemble_show', 'standalone')),
  team TEXT CHECK (team IN ('yellow', 'blue')),
  show_datetime TIMESTAMPTZ NOT NULL,
  doors_open_time TIMESTAMPTZ,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  base_price_nok DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_tiers JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'on_sale', 'sold_out', 'cancelled', 'completed')),
  available_seats INTEGER DEFAULT 0,
  is_part_of_series BOOLEAN DEFAULT FALSE,
  series_id UUID REFERENCES public.series(id) ON DELETE SET NULL,
  special_notes TEXT,
  age_restriction TEXT,
  duration_override INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SEATS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  row TEXT NOT NULL,
  number INTEGER NOT NULL,
  price_tier TEXT,
  price_nok DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'blocked')),
  reserved_until TIMESTAMPTZ,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(show_id, section, row, number)
);

-- =============================================
-- BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  seat_ids UUID[] DEFAULT '{}',
  vipps_order_id TEXT,
  total_amount_nok DECIMAL(10,2) NOT NULL DEFAULT 0,
  booking_reference TEXT NOT NULL UNIQUE,
  qr_code_data TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'used', 'cancelled', 'refunded')),
  booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  special_requests TEXT,
  ticket_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- DISCOUNT CODES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  applicable_to TEXT NOT NULL DEFAULT 'both' CHECK (applicable_to IN ('recordings', 'shows', 'both')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SITE SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_ensembles_slug ON public.ensembles(slug);
CREATE INDEX IF NOT EXISTS idx_ensembles_is_published ON public.ensembles(is_published);
CREATE INDEX IF NOT EXISTS idx_ensembles_featured ON public.ensembles(featured);
CREATE INDEX IF NOT EXISTS idx_recordings_ensemble_id ON public.recordings(ensemble_id);
CREATE INDEX IF NOT EXISTS idx_recordings_team ON public.recordings(team);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_shows_ensemble_id ON public.shows(ensemble_id);
CREATE INDEX IF NOT EXISTS idx_shows_venue_id ON public.shows(venue_id);
CREATE INDEX IF NOT EXISTS idx_shows_show_datetime ON public.shows(show_datetime);
CREATE INDEX IF NOT EXISTS idx_shows_status ON public.shows(status);
CREATE INDEX IF NOT EXISTS idx_seats_show_id ON public.seats(show_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON public.seats(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_show_id ON public.bookings(show_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_video_access_tokens_token ON public.video_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ensembles_updated_at BEFORE UPDATE ON public.ensembles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recordings_updated_at BEFORE UPDATE ON public.recordings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON public.series FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON public.shows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seats_updated_at BEFORE UPDATE ON public.seats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON public.discount_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
