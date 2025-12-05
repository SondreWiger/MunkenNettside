-- Row Level Security Policies
-- Version 1.0

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ensembles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- USERS POLICIES
-- =============================================
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (is_admin());

CREATE POLICY "Allow insert on signup" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- ENSEMBLES POLICIES
-- =============================================
CREATE POLICY "Anyone can view published ensembles" ON public.ensembles
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Admins can view all ensembles" ON public.ensembles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert ensembles" ON public.ensembles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update ensembles" ON public.ensembles
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete ensembles" ON public.ensembles
  FOR DELETE USING (is_admin());

-- =============================================
-- RECORDINGS POLICIES
-- =============================================
CREATE POLICY "Anyone can view recordings of published ensembles" ON public.recordings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ensembles 
      WHERE id = recordings.ensemble_id AND is_published = TRUE
    )
  );

CREATE POLICY "Admins can manage recordings" ON public.recordings
  FOR ALL USING (is_admin());

-- =============================================
-- PURCHASES POLICIES
-- =============================================
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON public.purchases
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage purchases" ON public.purchases
  FOR ALL USING (is_admin());

-- =============================================
-- VIDEO ACCESS TOKENS POLICIES
-- =============================================
CREATE POLICY "Users can view own tokens" ON public.video_access_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role only for token management" ON public.video_access_tokens
  FOR ALL USING (is_admin());

-- =============================================
-- VENUES POLICIES
-- =============================================
CREATE POLICY "Anyone can view venues" ON public.venues
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage venues" ON public.venues
  FOR ALL USING (is_admin());

-- =============================================
-- SERIES POLICIES
-- =============================================
CREATE POLICY "Anyone can view series" ON public.series
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage series" ON public.series
  FOR ALL USING (is_admin());

-- =============================================
-- SHOWS POLICIES
-- =============================================
CREATE POLICY "Anyone can view shows on sale or scheduled" ON public.shows
  FOR SELECT USING (status IN ('scheduled', 'on_sale', 'sold_out', 'completed'));

CREATE POLICY "Admins can manage shows" ON public.shows
  FOR ALL USING (is_admin());

-- =============================================
-- SEATS POLICIES
-- =============================================
CREATE POLICY "Anyone can view seats for active shows" ON public.seats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shows 
      WHERE id = seats.show_id AND status IN ('scheduled', 'on_sale')
    )
  );

CREATE POLICY "Admins can manage seats" ON public.seats
  FOR ALL USING (is_admin());

-- =============================================
-- BOOKINGS POLICIES
-- =============================================
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage bookings" ON public.bookings
  FOR ALL USING (is_admin());

-- =============================================
-- DISCOUNT CODES POLICIES
-- =============================================
CREATE POLICY "Anyone can view active discount codes" ON public.discount_codes
  FOR SELECT USING (
    (valid_from IS NULL OR valid_from <= NOW()) AND
    (valid_until IS NULL OR valid_until >= NOW()) AND
    (max_uses IS NULL OR current_uses < max_uses)
  );

CREATE POLICY "Admins can manage discount codes" ON public.discount_codes
  FOR ALL USING (is_admin());

-- =============================================
-- SITE SETTINGS POLICIES
-- =============================================
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (is_admin());
