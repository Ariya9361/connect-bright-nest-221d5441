-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create links table
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'link',
  clicks INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics table for future tracking
CREATE TABLE public.link_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  referrer TEXT,
  country TEXT
);

-- Create indexes for performance
CREATE INDEX idx_links_profile_id ON public.links(profile_id);
CREATE INDEX idx_links_sort_order ON public.links(profile_id, sort_order);
CREATE INDEX idx_analytics_link_id ON public.link_analytics(link_id);
CREATE INDEX idx_analytics_profile_id ON public.link_analytics(profile_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (public read, no auth required for demo)
CREATE POLICY "Profiles are publicly readable" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update profiles" 
  ON public.profiles FOR UPDATE 
  USING (true);

-- RLS Policies for links (public read, demo write)
CREATE POLICY "Links are publicly readable" 
  ON public.links FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create links" 
  ON public.links FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update links" 
  ON public.links FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete links" 
  ON public.links FOR DELETE 
  USING (true);

-- RLS Policies for analytics (public insert for tracking, public read for demo)
CREATE POLICY "Anyone can view analytics" 
  ON public.link_analytics FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can record analytics" 
  ON public.link_analytics FOR INSERT 
  WITH CHECK (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.links;

-- Insert demo profile
INSERT INTO public.profiles (username, display_name, bio, avatar_url)
VALUES (
  'arya',
  'Arya Sharma',
  'CS Student • Builder • Hackathon Enthusiast 🚀',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=arya&backgroundColor=0a0a0a'
);

-- Insert demo links
INSERT INTO public.links (profile_id, title, url, icon, clicks, sort_order)
SELECT 
  id,
  link_data.title,
  link_data.url,
  link_data.icon,
  link_data.clicks,
  link_data.sort_order
FROM public.profiles
CROSS JOIN (
  VALUES 
    ('GitHub', 'https://github.com', 'github', 142, 1),
    ('LinkedIn', 'https://linkedin.com', 'linkedin', 89, 2),
    ('Portfolio', 'https://portfolio.dev', 'globe', 234, 3),
    ('Twitter / X', 'https://x.com', 'twitter', 67, 4),
    ('Resume', 'https://resume.io', 'file-text', 178, 5)
) AS link_data(title, url, icon, clicks, sort_order)
WHERE username = 'arya';