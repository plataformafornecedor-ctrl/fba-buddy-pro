-- Tabela de cache compartilhado de produtos Keepa
CREATE TABLE public.keepa_product_cache (
  asin text NOT NULL,
  marketplace text NOT NULL DEFAULT 'ES',
  price_data jsonb,
  bsr_data jsonb,
  catalog_data jsonb,
  history_data jsonb,
  price_cached_at timestamptz,
  bsr_cached_at timestamptz,
  catalog_cached_at timestamptz,
  history_cached_at timestamptz,
  last_accessed_at timestamptz NOT NULL DEFAULT now(),
  access_count integer NOT NULL DEFAULT 0,
  tokens_total_saved integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (asin, marketplace)
);

CREATE INDEX idx_keepa_cache_last_accessed ON public.keepa_product_cache(last_accessed_at);

ALTER TABLE public.keepa_product_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view cache"
  ON public.keepa_product_cache FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Tabela de log de uso de tokens
CREATE TABLE public.keepa_token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  asin text NOT NULL,
  marketplace text NOT NULL DEFAULT 'ES',
  tokens_consumed integer NOT NULL DEFAULT 0,
  cache_hit boolean NOT NULL DEFAULT false,
  cache_layers_hit text[] DEFAULT '{}',
  endpoint text,
  response_time_ms integer
);

CREATE INDEX idx_keepa_usage_created ON public.keepa_token_usage(created_at DESC);
CREATE INDEX idx_keepa_usage_user ON public.keepa_token_usage(user_id, created_at DESC);
CREATE INDEX idx_keepa_usage_asin ON public.keepa_token_usage(asin, created_at DESC);

ALTER TABLE public.keepa_token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage logs"
  ON public.keepa_token_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Tabela de quota por usuário
CREATE TABLE public.user_search_quota (
  user_id uuid PRIMARY KEY,
  searches_today integer NOT NULL DEFAULT 0,
  searches_this_week integer NOT NULL DEFAULT 0,
  cache_hits_today integer NOT NULL DEFAULT 0,
  last_daily_reset date NOT NULL DEFAULT current_date,
  last_weekly_reset date NOT NULL DEFAULT current_date,
  plan_tier text NOT NULL DEFAULT 'beta',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_search_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own quota"
  ON public.user_search_quota FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Tabela de stats diárias agregadas
CREATE TABLE public.keepa_daily_stats (
  date date PRIMARY KEY,
  total_tokens_consumed integer NOT NULL DEFAULT 0,
  total_cache_hits integer NOT NULL DEFAULT 0,
  total_real_calls integer NOT NULL DEFAULT 0,
  unique_users integer NOT NULL DEFAULT 0,
  alert_level text NOT NULL DEFAULT 'green',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.keepa_daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view daily stats"
  ON public.keepa_daily_stats FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_keepa_cache_updated
  BEFORE UPDATE ON public.keepa_product_cache
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_user_quota_updated
  BEFORE UPDATE ON public.user_search_quota
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();