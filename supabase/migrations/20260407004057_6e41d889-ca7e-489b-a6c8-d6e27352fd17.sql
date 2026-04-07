
CREATE TABLE public.saved_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  marketplace TEXT NOT NULL DEFAULT 'DE',
  language TEXT NOT NULL DEFAULT 'de',
  title TEXT,
  bullets JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  backend_keywords TEXT,
  seo_score JSONB DEFAULT '{}'::jsonb,
  input_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own listings" ON public.saved_listings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own listings" ON public.saved_listings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own listings" ON public.saved_listings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own listings" ON public.saved_listings
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
