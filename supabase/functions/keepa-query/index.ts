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
    const { categoryId, domain } = await req.json();

    if (!categoryId || !domain) {
      return new Response(JSON.stringify({ error: 'Missing categoryId or domain' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('KEEPA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'KEEPA_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Keepa Product Finder (query endpoint)
    const url = `https://api.keepa.com/query?key=${apiKey}&domain=${domain}&selection=${JSON.stringify({
      categories_include: [categoryId],
      sort: [["current_SALES", "asc"]],
      productType: [0],
      current_COUNT_REVIEWS_min: 10,
      current_COUNT_REVIEWS_max: 500,
      current_SALES_min: 1,
      current_SALES_max: 50000,
      current_NEW_FBA_min: 1500,
      current_NEW_FBA_max: 6000,
      perPage: 50,
    })}`;

    console.log('Keepa query URL (redacted):', url.replace(apiKey, 'REDACTED'));
    const response = await fetch(url);
    const data = await response.json();

    const tokensLeft = data.tokensLeft ?? null;
    const refillIn = data.refillIn ?? null;
    console.log(`Keepa query: status=${response.status}, tokensLeft=${tokensLeft}, asinList=${data.asinList?.length ?? 0}`);

    if (!response.ok || !data.asinList?.length) {
      return new Response(JSON.stringify({
        error: data.error || 'No products found for this category',
        tokensLeft,
        refillIn,
      }), {
        status: response.ok ? 200 : 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Product Finder returns ASINs — we need to fetch basic product data
    // Use the product endpoint with the ASINs to get details
    const asins = data.asinList.slice(0, 50);
    const productUrl = `https://api.keepa.com/product?key=${apiKey}&domain=${domain}&asin=${asins.join(',')}&stats=1&history=0&offers=0`;
    
    console.log(`Fetching ${asins.length} products from Keepa...`);
    const productResponse = await fetch(productUrl);
    const productData = await productResponse.json();

    const finalTokensLeft = productData.tokensLeft ?? tokensLeft;
    const finalRefillIn = productData.refillIn ?? refillIn;

    if (!productResponse.ok || !productData.products?.length) {
      // Return ASINs only as fallback
      return new Response(JSON.stringify({
        products: asins.map((asin: string) => ({ asin, title: asin })),
        tokensLeft: finalTokensLeft,
        refillIn: finalRefillIn,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const products = productData.products.map((p: any) => {
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

    return new Response(JSON.stringify({ products, tokensLeft: finalTokensLeft, refillIn: finalRefillIn }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
