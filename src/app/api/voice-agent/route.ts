import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userInput, documentContext, documentTitle, conversationHistory } = await req.json();
  
  try {

    if (!userInput) {
      return NextResponse.json({ error: 'User input required' }, { status: 400 });
    }

    // Build conversation context
    const context = conversationHistory?.join('\n') || '';
    
    // Check if user wants to end conversation
    const endingPhrases = ['bye', 'goodbye', 'thank you', 'thanks', 'that\'s all', 'no more questions', 'see you later'];
    const isEnding = endingPhrases.some(phrase => userInput.toLowerCase().includes(phrase));
    
    const systemPrompt = `You are a helpful document assistant for "${documentTitle}". 

Key behaviors:
- Answer questions directly and clearly
- Keep responses concise (1-2 sentences max)
- Be helpful and informative
- Reference specific parts of the document when relevant
- If asked about something not in the document, politely redirect to what IS available
- DO NOT ask follow-up questions unless specifically requested
- Simply answer what was asked
${isEnding ? '- The user is ending the conversation, respond with a friendly goodbye' : ''}

Document content: ${documentContext}

Previous conversation:
${context}

Answer the user's question directly and concisely.`;

    // Call Groq API (ultra-fast and free)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Reliable model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error details:', errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I need a moment to process that.';

    return NextResponse.json({ 
      response: aiResponse,
      model: 'groq-llama-3.1-70b',
      processingTime: 'ultra-fast',
      shouldEndConversation: isEnding
    });

  } catch (error) {
    console.error('Groq API failed, trying OpenAI fallback:', error);
    
    // Fallback to OpenAI if Groq fails
    try {
      const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: `You are a helpful document assistant for "${documentTitle}". Answer questions directly and clearly. Keep responses concise (1-2 sentences max). DO NOT ask follow-up questions. Document content: ${documentContext}` },
            { role: 'user', content: userInput }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const aiResponse = fallbackData.choices[0]?.message?.content || 'I need a moment to process that.';
        
        return NextResponse.json({ 
          response: aiResponse,
          model: 'openai-fallback',
          processingTime: 'fallback'
        });
      }
    } catch (fallbackError) {
      console.error('OpenAI fallback also failed:', fallbackError);
    }
    
    return NextResponse.json({ 
      response: 'I encountered a technical issue. Could you try asking again?',
      error: true 
    }, { status: 200 });
  }
}