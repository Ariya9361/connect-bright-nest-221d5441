
-- 1. Add user_id column to profiles to tie to auth.users
ALTER TABLE public.profiles ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX profiles_user_id_unique ON public.profiles(user_id);

-- 2. Create security definer function to check profile ownership
CREATE OR REPLACE FUNCTION public.owns_profile(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _profile_id AND user_id = auth.uid()
  )
$$;

-- 3. Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, username, display_name)
  VALUES (NEW.id, NEW.id, REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '_'), SPLIT_PART(NEW.email, '@', 1));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Fix profiles RLS policies
DROP POLICY IF EXISTS "Anyone can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. Fix links RLS policies
DROP POLICY IF EXISTS "Anyone can create links" ON public.links;
DROP POLICY IF EXISTS "Anyone can update links" ON public.links;
DROP POLICY IF EXISTS "Anyone can delete links" ON public.links;

CREATE POLICY "Owners can create links" ON public.links
  FOR INSERT TO authenticated
  WITH CHECK (public.owns_profile(profile_id));

CREATE POLICY "Owners can update links" ON public.links
  FOR UPDATE TO authenticated
  USING (public.owns_profile(profile_id))
  WITH CHECK (public.owns_profile(profile_id));

CREATE POLICY "Owners can delete links" ON public.links
  FOR DELETE TO authenticated
  USING (public.owns_profile(profile_id));

-- 6. Fix link_analytics - keep INSERT open (anonymous clicks) but scope analytics view to owners
DROP POLICY IF EXISTS "Anyone can view analytics" ON public.link_analytics;

CREATE POLICY "Owners can view analytics" ON public.link_analytics
  FOR SELECT TO authenticated
  USING (public.owns_profile(profile_id));
