// Cleanup diário (rodar via cron 03:00 UTC):
// - Remove cache não acessado >60 dias
// - Remove logs >90 dias
// - Computa stats do dia anterior
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400_000).toISOString();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400_000).toISOString();

  const { count: cacheDeleted } = await supabase
    .from('keepa_product_cache')
    .delete({ count: 'exact' })
    .lt('last_accessed_at', sixtyDaysAgo);

  const { count: logsDeleted } = await supabase
    .from('keepa_token_usage')
    .delete({ count: 'exact' })
    .lt('created_at', ninetyDaysAgo);

  // Stats de ontem
  const yesterday = new Date(Date.now() - 86400_000);
  const yStart = new Date(yesterday.setUTCHours(0, 0, 0, 0)).toISOString();
  const yEnd = new Date(yesterday.setUTCHours(23, 59, 59, 999)).toISOString();
  const yDate = yStart.slice(0, 10);

  const { data: usage } = await supabase
    .from('keepa_token_usage')
    .select('tokens_consumed, cache_hit, user_id')
    .gte('created_at', yStart)
    .lte('created_at', yEnd);

  if (usage) {
    const totalTokens = usage.reduce((s, u) => s + (u.tokens_consumed ?? 0), 0);
    const cacheHits = usage.filter(u => u.cache_hit).length;
    const realCalls = usage.filter(u => !u.cache_hit).length;
    const uniqueUsers = new Set(usage.map(u => u.user_id).filter(Boolean)).size;

    const pct = (totalTokens / 72000) * 100;
    const alertLevel = pct > 90 ? 'red' : pct > 75 ? 'orange' : pct > 50 ? 'yellow' : 'green';

    await supabase.from('keepa_daily_stats').upsert({
      date: yDate,
      total_tokens_consumed: totalTokens,
      total_cache_hits: cacheHits,
      total_real_calls: realCalls,
      unique_users: uniqueUsers,
      alert_level: alertLevel,
    });
  }

  return new Response(JSON.stringify({
    success: true,
    cache_deleted: cacheDeleted ?? 0,
    logs_deleted: logsDeleted ?? 0,
    stats_date: yDate,
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
