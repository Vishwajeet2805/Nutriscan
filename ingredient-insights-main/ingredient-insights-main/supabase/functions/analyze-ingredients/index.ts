import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are NutriScan AI, an expert food ingredient analyst. Your role is to analyze food ingredient lists and provide clear, honest health assessments.

IMPORTANT GUIDELINES:
1. Be honest about uncertainty - if scientific evidence is mixed or limited, say so
2. Consider dose and context - many ingredients are harmless in small amounts
3. Avoid fear-mongering - base assessments on scientific evidence, not trends
4. Be practical - focus on what actually matters for health

For each analysis, you MUST return a valid JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "verdict": "<Great|Good|Caution|Avoid>",
  "summary": "<1-2 sentence plain language summary>",
  "ingredients": [
    {
      "name": "<ingredient name>",
      "level": "<safe|caution|warning|danger>",
      "description": "<what this ingredient is in simple terms>",
      "reasoning": "<why you rated it this way>",
      "scientificContext": "<optional: what research says>",
      "uncertaintyNote": "<optional: if evidence is mixed or limited>"
    }
  ],
  "personalizedAlerts": ["<alert if ingredient conflicts with user allergies/restrictions>"]
}

SCORING GUIDE:
- 80-100 (Great): Mostly whole, recognizable ingredients
- 60-79 (Good): Acceptable with minor concerns
- 40-59 (Caution): Notable concerns worth considering
- 0-39 (Avoid): Significant health concerns

LEVEL GUIDE:
- safe: Natural, whole food ingredients or well-studied safe additives
- caution: Generally safe but worth noting (e.g., added sugars, high sodium)
- warning: Potential concerns for some people or in large amounts
- danger: Known health concerns or common allergens

Return ONLY the JSON object, no markdown, no explanation.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, imageBase64, userProfile } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let userMessage = '';
    const messageContent: any[] = [];
    
    if (imageBase64) {
      // Image-based analysis
      messageContent.push({
        type: 'text',
        text: `Please analyze the ingredients shown in this food label image. Extract all ingredients and analyze each one.

User's health profile:
- Allergies: ${userProfile?.allergies?.join(', ') || 'None specified'}
- Dietary restrictions: ${userProfile?.dietaryRestrictions?.join(', ') || 'None specified'}
- Health goals: ${userProfile?.healthGoals?.join(', ') || 'None specified'}

Flag any ingredients that conflict with their profile in the personalizedAlerts array.`
      });
      messageContent.push({
        type: 'image_url',
        image_url: { url: imageBase64 }
      });
    } else {
      // Text-based analysis
      userMessage = `Please analyze these food ingredients:

${ingredients}

User's health profile:
- Allergies: ${userProfile?.allergies?.join(', ') || 'None specified'}
- Dietary restrictions: ${userProfile?.dietaryRestrictions?.join(', ') || 'None specified'}  
- Health goals: ${userProfile?.healthGoals?.join(', ') || 'None specified'}

Flag any ingredients that conflict with their profile in the personalizedAlerts array.`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      imageBase64 
        ? { role: 'user', content: messageContent }
        : { role: 'user', content: userMessage }
    ];

    console.log('Calling AI with messages:', JSON.stringify(messages, null, 2));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.3,
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

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));
    
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let analysisResult;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      throw new Error('Failed to parse analysis result');
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-ingredients:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
