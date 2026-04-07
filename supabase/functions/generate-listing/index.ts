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
    const { productName, category, marketplace, language, features, targetAudience, differentials, price, keywords, tone, useEmojis, optimizeFor } = await req.json();

    if (!productName || !language) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const languageMap: Record<string, string> = {
      de: 'German', fr: 'French', es: 'Spanish', it: 'Italian', en: 'English', pt: 'Portuguese',
    };
    const langName = languageMap[language] || 'German';

    const toneMap: Record<string, string> = {
      professional: 'professional and authoritative',
      friendly: 'warm, friendly, and approachable',
      premium: 'luxurious, premium, and exclusive',
      eco: 'eco-conscious, sustainable, and responsible',
    };
    const toneDesc = toneMap[tone] || 'professional';

    const systemPrompt = `You are an expert Amazon listing copywriter specializing in European marketplaces. Create listings optimized for both SEO and conversion. Follow Amazon's style guidelines. Write in ${langName}. Focus on benefits over features. Use relevant keywords naturally. Tone: ${toneDesc}.${useEmojis ? ' Use relevant emojis at the start of each bullet point.' : ' Do not use emojis.'}${optimizeFor === 'seo' ? ' Prioritize keyword density and search ranking.' : optimizeFor === 'conversion' ? ' Prioritize persuasive copy and conversion.' : ' Balance SEO keywords and persuasive conversion copy.'}`;

    const userPrompt = `Create a complete Amazon listing for:

Product: ${productName}
Category: ${category}
Marketplace: Amazon.${marketplace}
Price: €${price || 'N/A'}

Key Features: ${features || 'Not specified'}
Target Audience: ${targetAudience || 'General'}
Differentials: ${differentials || 'Not specified'}
${keywords ? `Must-include Keywords: ${keywords}` : ''}

Return a JSON object with this exact structure:
{
  "title": "Optimized product title (max 200 characters, include main keywords)",
  "bullets": ["Bullet 1 (start with KEYWORD IN CAPS, then benefit-focused copy, max 500 chars)", "Bullet 2", "Bullet 3", "Bullet 4", "Bullet 5"],
  "description": "Full product description (max 2000 characters, paragraph structure, HTML-safe)",
  "backend_keywords": "comma-separated keywords, no repeated words, max 250 bytes, include long-tail variations",
  "seo_score": {
    "overall": 87,
    "title": 92,
    "bullets": 88,
    "description": 85,
    "keywords": 90,
    "suggestion": "One specific actionable suggestion to improve SEO score"
  }
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'create_listing',
            description: 'Create a complete Amazon product listing',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Product title, max 200 chars' },
                bullets: { type: 'array', items: { type: 'string' }, description: '5 bullet points' },
                description: { type: 'string', description: 'Product description, max 2000 chars' },
                backend_keywords: { type: 'string', description: 'Backend keywords, max 250 bytes' },
                seo_score: {
                  type: 'object',
                  properties: {
                    overall: { type: 'number' },
                    title: { type: 'number' },
                    bullets: { type: 'number' },
                    description: { type: 'number' },
                    keywords: { type: 'number' },
                    suggestion: { type: 'string' },
                  },
                  required: ['overall', 'title', 'bullets', 'description', 'keywords', 'suggestion'],
                },
              },
              required: ['title', 'bullets', 'description', 'backend_keywords', 'seo_score'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'create_listing' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      throw new Error('AI generation failed');
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error('No structured output from AI');
    }

    const listing = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ listing }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-listing error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
