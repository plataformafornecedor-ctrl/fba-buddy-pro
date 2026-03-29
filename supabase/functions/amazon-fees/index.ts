import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('AMAZON_CLIENT_ID');
  const clientSecret = Deno.env.get('AMAZON_CLIENT_SECRET');
  const refreshToken = Deno.env.get('AMAZON_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Amazon SP-API credentials not configured');
  }

  const response = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = await response.json();
  if (!data.access_token) throw new Error('Failed to get access token');
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { asin, price, marketplaceId } = await req.json();

    if (!asin || !price || !marketplaceId) {
      return new Response(JSON.stringify({ error: 'Missing asin, price, or marketplaceId' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = await getAccessToken();

    const feesBody = {
      FeesEstimateRequest: {
        MarketplaceId: marketplaceId,
        IsAmazonFulfilled: true,
        PriceToEstimateFees: {
          ListingPrice: { CurrencyCode: 'EUR', Amount: price },
        },
        Identifier: asin,
      },
    };

    const feesResponse = await fetch(
      `https://sellingpartnerapi-eu.amazon.com/products/fees/v0/items/${asin}/feesEstimate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-amz-access-token': accessToken,
        },
        body: JSON.stringify(feesBody),
      }
    );

    const feesData = await feesResponse.json();

    if (!feesResponse.ok) {
      return new Response(JSON.stringify({ error: 'Amazon Fees API error', details: feesData }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const feeDetail = feesData?.payload?.FeesEstimateResult?.FeesEstimate;
    const totalFee = feeDetail?.TotalFeesEstimate?.Amount ?? null;

    // Extract FBA fulfillment fee specifically
    const fbaFee = feeDetail?.FeeDetailList?.find((f: any) => f.FeeType === 'FBAFees')?.FinalFee?.Amount ?? totalFee;

    return new Response(JSON.stringify({ fbaFee: fbaFee ?? price * 0.15 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
