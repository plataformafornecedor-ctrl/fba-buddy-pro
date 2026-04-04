import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, domain, perPage } = await req.json();
    
    if (!keyword || !domain) {
      return new Response(JSON.stringify({ error: 'Missing keyword or domain' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('KEEPA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'KEEPA_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const limit = Math.min(perPage || 10, 20);
    // Lightweight search: stats=0, history=0, offers=0 to minimize token usage
    const url = `https://api.keepa.com/search?key=${apiKey}&domain=${domain}&type=product&term=${encodeURIComponent(keyword)}&perPage=${limit}&stats=0&history=0&offers=0`;
    console.log('Keepa search URL:', url.replace(apiKey, 'REDACTED'));
    const response = await fetch(url);
    const data = await response.json();
    
    const tokensLeft = data.tokensLeft ?? null;
    const refillIn = data.refillIn ?? null;
    console.log(`Keepa response: status=${response.status}, tokensLeft=${tokensLeft}, refillIn=${refillIn}min`);

    if (!response.ok || !data.products) {
      return new Response(JSON.stringify({ 
        error: data.error || 'Keepa API error', 
        tokensLeft,
        refillIn,
      }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const products = data.products.map((p: any) => {
      // Extract current BSR from salesRanks
      let bsr: number | null = null;
      if (p.salesRanks) {
        const mainCat = Object.keys(p.salesRanks)[0];
        if (mainCat && p.salesRanks[mainCat]?.length >= 2) {
          const ranks = p.salesRanks[mainCat];
          bsr = ranks[ranks.length - 1];
        }
      }

      return {
        asin: p.asin,
        title: p.title,
        currentPrice: p.stats?.current?.[0] != null ? p.stats.current[0] / 100 : null,
        fbaPrice: p.stats?.current?.[3] != null ? p.stats.current[3] / 100 : null,
        bsr,
        reviewCount: p.stats?.current?.[11] ?? null,
        category: p.categoryTree?.[0]?.name || 'Unknown',
        imageUrl: p.imagesCSV ? `https://images-na.ssl-images-amazon.com/images/I/${p.imagesCSV.split(',')[0]}` : '',
        isAmazonSeller: p.stats?.current?.[3] != null && p.stats.current[3] > 0,
      };
    });

    return new Response(JSON.stringify({ products, tokensLeft, refillIn }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
