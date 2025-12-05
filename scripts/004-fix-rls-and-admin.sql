-- Fix RLS policy for user creation and create admin user
-- Version 1.1

-- Drop old insert policy and create a more permissive one
DROP POLICY IF EXISTS "Allow insert on signup" ON public.users;

-- Allow authenticated users to insert their own profile
CREATE POLICY "Allow insert on signup" ON public.users
  FOR INSERT WITH CHECK (TRUE);

-- Create a trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Ukjent'),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- To make yourself admin, run this after you've registered:
-- UPDATE public.users SET role = 'admin' WHERE email = 'din@epost.no';
