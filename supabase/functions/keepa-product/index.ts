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
    const { asin, domain, marketplaceId } = await req.json();

    if (!asin || !domain) {
      return new Response(JSON.stringify({ error: 'Missing asin or domain' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('KEEPA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'KEEPA_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = `https://api.keepa.com/product?key=${apiKey}&domain=${domain}&asin=${asin}&history=1&days=90`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.products?.[0]) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const p = data.products[0];
    const keepaEpoch = 21564000; // minutes since keepa epoch to unix epoch conversion

    // Parse price history (csv[3] = new price, format: [time, price, time, price, ...])
    const priceHistory: number[] = [];
    const priceHistoryDates: string[] = [];
    if (p.csv?.[3]) {
      for (let i = 0; i < p.csv[3].length; i += 2) {
        const time = p.csv[3][i];
        const price = p.csv[3][i + 1];
        if (price > 0) {
          const date = new Date((time + keepaEpoch) * 60000);
          priceHistoryDates.push(date.toISOString().slice(0, 10));
          priceHistory.push(price / 100);
        }
      }
    }

    // Parse BSR history
    const bsrHistory: number[] = [];
    const bsrHistoryDates: string[] = [];
    const salesRankData = p.csv?.[3] ? null : null; // salesRanks format varies
    if (p.salesRanks) {
      const mainCategory = Object.keys(p.salesRanks)[0];
      if (mainCategory && p.salesRanks[mainCategory]) {
        const ranks = p.salesRanks[mainCategory];
        for (let i = 0; i < ranks.length; i += 2) {
          const time = ranks[i];
          const rank = ranks[i + 1];
          if (rank > 0) {
            const date = new Date((time + keepaEpoch) * 60000);
            bsrHistoryDates.push(date.toISOString().slice(0, 10));
            bsrHistory.push(rank);
          }
        }
      }
    }

    // Try to get Amazon fees if credentials are available
    let realFbaFee: number | null = null;
    let feeSource: 'real' | 'estimated' = 'estimated';

    const product = {
      asin: p.asin,
      title: p.title,
      currentPrice: p.stats?.current?.[0] != null ? p.stats.current[0] / 100 : null,
      fbaPrice: p.stats?.current?.[3] != null ? p.stats.current[3] / 100 : null,
      bsr: bsrHistory.length ? bsrHistory[bsrHistory.length - 1] : null,
      reviewCount: p.stats?.current?.[11] ?? null,
      priceHistory,
      priceHistoryDates,
      bsrHistory,
      bsrHistoryDates,
      category: p.categoryTree?.[0]?.name || 'Unknown',
      imageUrl: p.imagesCSV ? `https://images-na.ssl-images-amazon.com/images/I/${p.imagesCSV.split(',')[0]}` : '',
      isAmazonSeller: p.stats?.current?.[3] != null && p.stats.current[3] > 0,
      sellerCount: p.stats?.current?.[10] ?? null,
      weight: p.packageWeight != null ? p.packageWeight / 1000 : null,
      dimensions: p.packageLength ? `${p.packageLength/10} x ${p.packageWidth/10} x ${p.packageHeight/10} cm` : null,
      realFbaFee,
      feeSource,
    };

    return new Response(JSON.stringify({ product }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
