import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentMessage, recentHistory, analysisPrompt } = req.body;

    if (!currentMessage || !analysisPrompt) {
      return res.status(400).json({ 
        error: 'Missing required parameters: currentMessage and analysisPrompt' 
      });
    }

    // Use a lightweight model for quick analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a conversation continuity analyzer. Your job is to determine if a current message is relevant to previous conversation context. You must respond with valid JSON only, no other text.

RESPONSE FORMAT (JSON only):
{
    "isRelevant": true/false,
    "confidence": 0.0-1.0,
    "reasoning": "Brief explanation",
    "topicContinuity": true/false,
    "conceptConnection": true/false
}

ANALYSIS CRITERIA:
1. Topic Continuity: Same subject/topic as recent messages
2. Concept Connection: Builds on, clarifies, or extends previous concepts  
3. Learning Progression: Natural next step in learning sequence
4. Clarification Request: Asking for more explanation on previous topic
5. Subject Change: Clear switch to unrelated topic

Be decisive but accurate. Err on the side of relevance for educational conversations.`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent analysis
      max_tokens: 200,
      top_p: 0.9
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse);
      // Try to extract JSON from response if it contains other text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI response is not valid JSON');
      }
    }

    // Validate response structure
    if (typeof analysisResult.isRelevant !== 'boolean') {
      throw new Error('Invalid analysis result: isRelevant must be boolean');
    }

    // Ensure all required fields
    const result = {
      isRelevant: analysisResult.isRelevant,
      confidence: Math.max(0, Math.min(1, analysisResult.confidence || 0.5)),
      reasoning: analysisResult.reasoning || 'Analysis completed',
      topicContinuity: analysisResult.topicContinuity || analysisResult.isRelevant,
      conceptConnection: analysisResult.conceptConnection || false,
      aiResponse: aiResponse // Include for debugging
    };

    console.log(`🔍 Context relevance analysis: ${result.isRelevant ? 'RELEVANT' : 'NOT RELEVANT'} (confidence: ${result.confidence})`);
    
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Context relevance analysis error:', error);
    
    // Return fallback result on error
    return res.status(200).json({
      isRelevant: false,
      confidence: 0,
      reasoning: 'Analysis failed, assuming topic change',
      topicContinuity: false,
      conceptConnection: false,
      error: error.message,
      fallback: true
    });
  }
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 10, // 10 second timeout for quick analysis
};
