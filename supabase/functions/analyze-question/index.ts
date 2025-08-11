import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageData, extractedText, userId, additionalImages, isLiteratureContext } = await req.json()
    
    // Validate input
    if (!imageData || !extractedText) {
      throw new Error('Missing required fields: imageData and extractedText')
    }

    // No external AI used here anymore. This function only validates inputs
    // and stores the provided images/text to Supabase for later processing.

    // Check if this is a literature question
    const isLiteratureQuestion = checkIfLiteratureQuestion(extractedText);
    
    // Prepare AI prompt based on question type
    let aiPrompt = `You are a helpful tutor. Analyze this problem and provide a clear, step-by-step solution. The extracted text from the image is: "${extractedText}". Please provide a comprehensive solution that a student can easily understand.`;
    
    if (isLiteratureQuestion && !isLiteratureContext) {
      aiPrompt = `This appears to be a literature question. Please provide a preliminary answer based on the question, but note that you may need more context about the story, characters, or plot to give a complete answer. The extracted text is: "${extractedText}".`;
    } else if (isLiteratureContext && additionalImages) {
      aiPrompt = `This is a literature question with additional context. Please provide a comprehensive answer using all the provided context. The question is: "${extractedText}". Use the additional images to understand the story context, characters, and plot.`;
    }

    // Prepare content array
    const content = [
      {
        type: "text", 
        text: aiPrompt
      },
      {
        type: "image_url",
        image_url: {
          url: imageData
        }
      }
    ];

    // Add additional images if provided
    if (additionalImages && additionalImages.length > 0) {
      additionalImages.forEach((img: string) => {
        content.push({
          type: "image_url",
          image_url: {
            url: img
          }
        });
      });
    }

    // Skip external AI call. Use provided extractedText as-is and mark for review.
    const solution = ''

    // Store the analysis in database for future reference
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get user from request headers
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      
      if (user) {
        // Store analysis in database with literature context
        await supabase.from('question_analyses').insert({
          user_id: user.id,
          extracted_text: extractedText,
          solution: solution, // intentionally empty; AI handled by app later
          image_url: imageData.substring(0, 100) + '...', // Store truncated version
          created_at: new Date().toISOString()
        })

        // If this is a literature question, store additional context
        if (isLiteratureQuestion && additionalImages && additionalImages.length > 0) {
          await supabase.from('literature_contexts').insert({
            user_id: user.id,
            question_text: extractedText,
            context_images: additionalImages.map(img => img.substring(0, 100) + '...'),
            story_title: extractStoryTitle(extractedText),
            created_at: new Date().toISOString()
          })
        }
      }
    }

    // Return response with literature context flag
    return new Response(
      JSON.stringify({ 
        success: true, 
        solution: solution,
        extractedText: extractedText,
        needsMoreContext: isLiteratureQuestion && !isLiteratureContext
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

// Helper function to check if question is literature-related
function checkIfLiteratureQuestion(text: string): boolean {
  const literatureKeywords = [
    'character', 'plot', 'story', 'narrator', 'theme', 'setting', 'protagonist', 'antagonist',
    'climax', 'resolution', 'conflict', 'dialogue', 'metaphor', 'simile', 'symbolism',
    'author', 'novel', 'poem', 'drama', 'play', 'chapter', 'scene', 'act',
    'literature', 'fiction', 'non-fiction', 'biography', 'autobiography',
    'कहानी', 'कविता', 'उपन्यास', 'नाटक', 'पात्र', 'कथानक', 'विषय', 'लेखक'
  ];
  
  const lowerText = text.toLowerCase();
  return literatureKeywords.some(keyword => lowerText.includes(keyword));
}

// Helper function to extract story title from question
function extractStoryTitle(text: string): string {
  // Simple extraction - look for quotes or "story about" patterns
  const quoteMatch = text.match(/"([^"]+)"/);
  if (quoteMatch) return quoteMatch[1];
  
  const storyMatch = text.match(/story (?:about|of) ([^.]+)/i);
  if (storyMatch) return storyMatch[1].trim();
  
  return 'Unknown Story';
} 