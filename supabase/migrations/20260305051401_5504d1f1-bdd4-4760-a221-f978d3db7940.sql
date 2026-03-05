
-- 1. Add storage RLS policies for avatars bucket
CREATE POLICY "Users can upload own avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 2. Add trigger to validate and truncate analytics inputs
CREATE OR REPLACE FUNCTION public.validate_analytics_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify link_id belongs to profile_id
  IF NOT EXISTS (
    SELECT 1 FROM public.links WHERE id = NEW.link_id AND profile_id = NEW.profile_id
  ) THEN
    RAISE EXCEPTION 'link_id does not belong to profile_id';
  END IF;

  -- Truncate user_agent and referrer to 512 chars
  NEW.user_agent := LEFT(NEW.user_agent, 512);
  NEW.referrer := LEFT(NEW.referrer, 512);

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_analytics_before_insert
  BEFORE INSERT ON public.link_analytics
  FOR EACH ROW EXECUTE FUNCTION public.validate_analytics_insert();
