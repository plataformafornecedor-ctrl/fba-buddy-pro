
CREATE TABLE public.saved_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  asin text NOT NULL,
  marketplace text NOT NULL DEFAULT 'DE',
  title text NOT NULL DEFAULT '',
  category text DEFAULT '',
  current_price numeric,
  bsr integer,
  opportunity_score integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, asin, marketplace)
);

ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved products"
  ON public.saved_products FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own saved products"
  ON public.saved_products FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saved products"
  ON public.saved_products FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own saved products"
  ON public.saved_products FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_saved_products_user ON public.saved_products(user_id, created_at DESC);
