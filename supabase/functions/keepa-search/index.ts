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
    const { keyword, domain } = await req.json();
    
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

    const url = `https://api.keepa.com/search?key=${apiKey}&domain=${domain}&type=product&term=${encodeURIComponent(keyword)}&perPage=20`;
    console.log('Keepa search URL:', url.replace(apiKey, 'REDACTED'));
    const response = await fetch(url);
    const data = await response.json();
    console.log('Keepa response status:', response.status, 'keys:', Object.keys(data), 'error:', data.error);

    if (!response.ok || !data.products) {
      return new Response(JSON.stringify({ error: data.error || 'Keepa API error', details: JSON.stringify(data).slice(0, 500) }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const products = data.products.map((p: any) => ({
      asin: p.asin,
      title: p.title,
      currentPrice: p.stats?.current?.[0] != null ? p.stats.current[0] / 100 : null,
      fbaPrice: p.stats?.current?.[3] != null ? p.stats.current[3] / 100 : null,
      bsr: p.salesRanks?.[0]?.[p.salesRanks[0].length - 1] ?? null,
      reviewCount: p.stats?.current?.[11] ?? null,
      priceHistory: p.csv?.[3]?.filter((_: any, i: number) => i % 2 === 1).slice(-20) || [],
      bsrHistory: [],
      category: p.categoryTree?.[0]?.name || 'Unknown',
      imageUrl: p.imagesCSV ? `https://images-na.ssl-images-amazon.com/images/I/${p.imagesCSV.split(',')[0]}` : '',
      isAmazonSeller: p.stats?.current?.[3] != null && p.stats.current[3] > 0,
    }));

    return new Response(JSON.stringify({ products }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
