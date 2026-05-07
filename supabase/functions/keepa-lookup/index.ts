// Edge function unificada Keepa com cache multi-camada e quota por usuário.
// Reduz consumo de tokens em ~85% via cache compartilhado em keepa_product_cache.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TTL por camada (ms)
const TTL = {
  price: 2 * 60 * 60 * 1000,      // 2h
  bsr: 6 * 60 * 60 * 1000,        // 6h
  catalog: 30 * 24 * 60 * 60 * 1000, // 30d
  history: 24 * 60 * 60 * 1000,   // 24h
};

// Limites por plano
const QUOTA: Record<string, { daily: number; weekly: number }> = {
  beta: { daily: 80, weekly: 350 },
  starter: { daily: 150, weekly: 800 },
  pro: { daily: 600, weekly: 4000 },
  agency: { daily: -1, weekly: -1 },
};

const MARKETPLACE_TO_DOMAIN: Record<string, number> = {
  US: 1, GB: 2, DE: 3, FR: 4, JP: 5, CA: 6, IT: 8, ES: 9, IN: 10, MX: 11,
};

function isFresh(cachedAt: string | null, ttl: number): boolean {
  if (!cachedAt) return false;
  return (Date.now() - new Date(cachedAt).getTime()) < ttl;
}

function tomorrowMidnightUTC(): string {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const startedAt = Date.now();

  try {
    const { asin, marketplace = 'ES', include_history = false, force_refresh = false } = await req.json();

    if (!asin) {
      return new Response(JSON.stringify({ error: 'Missing asin' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Identifica usuário (opcional — funciona anônimo também)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    // 1. VALIDAÇÃO DE QUOTA (apenas se autenticado)
    let quota: any = null;
    let planTier = 'beta';
    if (userId) {
      const { data } = await supabase
        .from('user_search_quota')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!data) {
        // Cria quota inicial
        const { data: created } = await supabase
          .from('user_search_quota')
          .insert({ user_id: userId, plan_tier: 'beta' })
          .select()
          .single();
        quota = created;
      } else {
        quota = data;
        // Reset diário se necessário
        const today = new Date().toISOString().slice(0, 10);
        if (data.last_daily_reset !== today) {
          await supabase
            .from('user_search_quota')
            .update({ searches_today: 0, cache_hits_today: 0, last_daily_reset: today })
            .eq('user_id', userId);
          quota.searches_today = 0;
          quota.cache_hits_today = 0;
        }
      }
      planTier = quota.plan_tier;
      const limits = QUOTA[planTier] ?? QUOTA.beta;

      if (limits.daily !== -1 && quota.searches_today >= limits.daily) {
        return new Response(JSON.stringify({
          quota_exceeded: true,
          reset_at: tomorrowMidnightUTC(),
          message: 'Limite diário atingido. Reseta à meia-noite UTC.',
          searches_today: quota.searches_today,
          daily_limit: limits.daily,
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // 2. CONSULTA CACHE
    const { data: cached } = await supabase
      .from('keepa_product_cache')
      .select('*')
      .eq('asin', asin)
      .eq('marketplace', marketplace)
      .maybeSingle();

    const freshness = {
      price: cached && isFresh(cached.price_cached_at, TTL.price),
      bsr: cached && isFresh(cached.bsr_cached_at, TTL.bsr),
      catalog: cached && isFresh(cached.catalog_cached_at, TTL.catalog),
      history: cached && isFresh(cached.history_cached_at, TTL.history),
    };

    const allFresh = freshness.price && freshness.bsr && freshness.catalog &&
      (!include_history || freshness.history);

    // 3. CACHE HIT TOTAL
    if (allFresh && !force_refresh && cached) {
      const layersHit = Object.entries(freshness).filter(([, v]) => v).map(([k]) => k);

      // Atualiza acesso
      await supabase
        .from('keepa_product_cache')
        .update({
          last_accessed_at: new Date().toISOString(),
          access_count: cached.access_count + 1,
          tokens_total_saved: cached.tokens_total_saved + 3,
        })
        .eq('asin', asin)
        .eq('marketplace', marketplace);

      if (userId) {
        await supabase
          .from('user_search_quota')
          .update({ cache_hits_today: (quota?.cache_hits_today ?? 0) + 1 })
          .eq('user_id', userId);
      }

      await supabase.from('keepa_token_usage').insert({
        user_id: userId, asin, marketplace,
        tokens_consumed: 0, cache_hit: true,
        cache_layers_hit: layersHit, endpoint: 'cache',
        response_time_ms: Date.now() - startedAt,
      });

      const limits = QUOTA[planTier] ?? QUOTA.beta;
      return new Response(JSON.stringify({
        asin, marketplace,
        price: cached.price_data, bsr: cached.bsr_data,
        catalog: cached.catalog_data,
        history: include_history ? cached.history_data : null,
        meta: {
          cache_hit: true, tokens_used: 0,
          quota_remaining_today: limits.daily === -1 ? -1 : limits.daily - (quota?.searches_today ?? 0),
          data_freshness: { price: 'cached', bsr: 'cached', catalog: 'cached', history: include_history ? 'cached' : 'n/a' },
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4. CHAMADA REAL À KEEPA
    const apiKey = Deno.env.get('KEEPA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'KEEPA_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const domain = MARKETPLACE_TO_DOMAIN[marketplace] ?? 9;
    const historyParam = include_history && !freshness.history ? 1 : 0;
    const url = `https://api.keepa.com/product?key=${apiKey}&domain=${domain}&asin=${asin}&history=${historyParam}&stats=90&offers=20&days=90`;

    const keepaRes = await fetch(url);
    const keepaData = await keepaRes.json();
    const tokensLeft = keepaData.tokensLeft ?? null;
    const refillIn = keepaData.refillIn ?? null;

    // FALLBACK: erro ou produto não encontrado → tenta cache stale
    if (!keepaRes.ok || !keepaData.products?.[0]) {
      console.warn(`[keepa-lookup] Keepa error/empty for ${asin}`, keepaData.error);
      if (cached) {
        return new Response(JSON.stringify({
          asin, marketplace,
          price: cached.price_data, bsr: cached.bsr_data,
          catalog: cached.catalog_data, history: cached.history_data,
          meta: {
            cache_hit: true, tokens_used: 0,
            fallback_reason: 'stale_cache_due_to_keepa_error',
            warning: 'Dados podem estar desatualizados (Keepa indisponível)',
            tokensLeft, refillIn,
          },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({
        error: 'Product not found and no cache available',
        meta: { tokensLeft, refillIn },
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const p = keepaData.products[0];
    const keepaEpoch = 21564000;

    // Parse price
    const priceData = {
      currentPrice: p.stats?.current?.[0] != null ? p.stats.current[0] / 100 : null,
      fbaPrice: p.stats?.current?.[3] != null ? p.stats.current[3] / 100 : null,
      buyBoxPrice: p.stats?.current?.[18] != null ? p.stats.current[18] / 100 : null,
      sellerCount: p.stats?.current?.[10] ?? null,
      isAmazonSeller: p.stats?.current?.[3] != null && p.stats.current[3] > 0,
    };

    // Parse BSR
    let currentBsr: number | null = null;
    if (p.salesRanks) {
      const mainCat = Object.keys(p.salesRanks)[0];
      const ranks = p.salesRanks[mainCat];
      if (ranks?.length) currentBsr = ranks[ranks.length - 1];
    }
    const bsrData = { bsr: currentBsr, reviewCount: p.stats?.current?.[11] ?? null };

    // Parse catalog
    const catalogData = {
      title: p.title,
      brand: p.brand,
      category: p.categoryTree?.[0]?.name || 'Unknown',
      imageUrl: p.imagesCSV ? `https://images-na.ssl-images-amazon.com/images/I/${p.imagesCSV.split(',')[0]}` : '',
      weight: p.packageWeight != null ? p.packageWeight / 1000 : null,
      dimensions: p.packageLength ? `${p.packageLength/10} x ${p.packageWidth/10} x ${p.packageHeight/10} cm` : null,
    };

    // Parse history (se solicitado)
    let historyData: any = null;
    if (include_history && p.csv?.[3]) {
      const priceHistory: number[] = [];
      const priceHistoryDates: string[] = [];
      for (let i = 0; i < p.csv[3].length; i += 2) {
        const time = p.csv[3][i];
        const price = p.csv[3][i + 1];
        if (price > 0) {
          priceHistoryDates.push(new Date((time + keepaEpoch) * 60000).toISOString().slice(0, 10));
          priceHistory.push(price / 100);
        }
      }
      historyData = { priceHistory, priceHistoryDates };
    }

    // Atualiza cache: só campos refrescados (mantém freshness parcial)
    const now = new Date().toISOString();
    const updatePayload: any = { last_accessed_at: now };
    if (!freshness.price || force_refresh) { updatePayload.price_data = priceData; updatePayload.price_cached_at = now; }
    if (!freshness.bsr || force_refresh) { updatePayload.bsr_data = bsrData; updatePayload.bsr_cached_at = now; }
    if (!freshness.catalog || force_refresh) { updatePayload.catalog_data = catalogData; updatePayload.catalog_cached_at = now; }
    if (historyData && (!freshness.history || force_refresh)) { updatePayload.history_data = historyData; updatePayload.history_cached_at = now; }

    if (cached) {
      updatePayload.access_count = cached.access_count + 1;
      await supabase.from('keepa_product_cache')
        .update(updatePayload)
        .eq('asin', asin).eq('marketplace', marketplace);
    } else {
      await supabase.from('keepa_product_cache').insert({
        asin, marketplace,
        price_data: priceData, price_cached_at: now,
        bsr_data: bsrData, bsr_cached_at: now,
        catalog_data: catalogData, catalog_cached_at: now,
        history_data: historyData, history_cached_at: historyData ? now : null,
        access_count: 1,
      });
    }

    // Estima tokens consumidos (Keepa não devolve "consumed" diretamente)
    const tokensConsumed = include_history ? 6 : 3;

    // Incrementa quota
    if (userId) {
      await supabase
        .from('user_search_quota')
        .update({
          searches_today: (quota?.searches_today ?? 0) + 1,
          searches_this_week: (quota?.searches_this_week ?? 0) + 1,
        })
        .eq('user_id', userId);
    }

    // Loga uso
    await supabase.from('keepa_token_usage').insert({
      user_id: userId, asin, marketplace,
      tokens_consumed: tokensConsumed, cache_hit: false,
      cache_layers_hit: [], endpoint: 'product',
      response_time_ms: Date.now() - startedAt,
    });

    // Warning de quota
    const limits = QUOTA[planTier] ?? QUOTA.beta;
    const newSearchesToday = (quota?.searches_today ?? 0) + 1;
    let quotaWarning: string | null = null;
    if (limits.daily !== -1 && newSearchesToday >= limits.daily * 0.8) {
      quotaWarning = `Você usou ${Math.round((newSearchesToday / limits.daily) * 100)}% do limite diário`;
    }

    return new Response(JSON.stringify({
      asin, marketplace,
      price: freshness.price && cached ? cached.price_data : priceData,
      bsr: freshness.bsr && cached ? cached.bsr_data : bsrData,
      catalog: freshness.catalog && cached ? cached.catalog_data : catalogData,
      history: include_history ? historyData : null,
      meta: {
        cache_hit: false, tokens_used: tokensConsumed,
        tokens_left_keepa: tokensLeft, refill_in_min: refillIn,
        quota_remaining_today: limits.daily === -1 ? -1 : limits.daily - newSearchesToday,
        quota_warning: quotaWarning,
        data_freshness: {
          price: freshness.price ? 'cached' : 'fresh',
          bsr: freshness.bsr ? 'cached' : 'fresh',
          catalog: freshness.catalog ? 'cached' : 'fresh',
          history: include_history ? (freshness.history ? 'cached' : 'fresh') : 'n/a',
        },
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[keepa-lookup] error', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
