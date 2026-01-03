import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are NutriScan AI, a friendly and knowledgeable food ingredient expert. You're having a conversation with someone about ingredients they've scanned.

You have access to the ingredient analysis results and should help the user understand:
- Specific ingredients they ask about
- How ingredients relate to their dietary needs
- Practical advice about the product
- Whether alternatives might be better

COMMUNICATION STYLE:
- Be conversational and helpful
- Use simple language, avoid jargon
- Be honest about uncertainty
- Give practical, actionable advice
- Keep responses concise (2-4 sentences usually)

If asked about something outside your expertise or the current analysis, politely redirect to the ingredients at hand.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, ingredients, analysisContext, userProfile, conversationHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build conversation context
    const contextMessage = `
CURRENT ANALYSIS CONTEXT:
- Product Score: ${analysisContext.overallScore}/100 (${analysisContext.verdict})
- Summary: ${analysisContext.summary}
- Ingredients analyzed: ${analysisContext.ingredients.map((i: any) => `${i.name} (${i.level})`).join(', ')}

USER PROFILE:
- Allergies: ${userProfile?.allergies?.join(', ') || 'None'}
- Dietary restrictions: ${userProfile?.dietaryRestrictions?.join(', ') || 'None'}
- Health goals: ${userProfile?.healthGoals?.join(', ') || 'None'}

ORIGINAL INGREDIENTS:
${ingredients}
`;

    const messages = [
      { role: 'system', content: systemPrompt + '\n\n' + contextMessage },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Chat request with', messages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in chat-ingredients:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Chat failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
