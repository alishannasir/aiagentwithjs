import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/deepseek';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for chat history (replacing database)
const chatSessions = new Map();
console.log(chatSessions, "chats")

export async function POST(request: Request) {
  try {
    const { message, sessionId } = await request.json();
    // Find or create a chat session
    let session;
    if (sessionId && chatSessions.has(sessionId)) {
      session = chatSessions.get(sessionId);
    } else {
      // Create new session with a unique ID
      const newSessionId = uuidv4();
      session = {
        id: newSessionId,
        messages: []
      };
      chatSessions.set(newSessionId, session);
    }
    
    // Add user message to the session
    const userMessage = {
      id: uuidv4(),
      content: message,
      role: 'user',
      createdAt: new Date(),
    };
    session.messages.push(userMessage);
    
    // Format messages for Deepseek API
    const apiMessages = session.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));


    // Generate response from Deepseek (uncomment when ready to use the API)
    const responseContent = await generateChatResponse(apiMessages);
    
    // Add assistant message to the session
    const assistantMessage = {
      id: uuidv4(),
      content: responseContent,
      role: 'assistant',
      createdAt: new Date(),
    };
    session.messages.push(assistantMessage);
    
    return NextResponse.json({
      sessionId: session.id,
      message: assistantMessage,
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
