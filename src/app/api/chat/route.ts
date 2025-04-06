// Modified src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/deepseek';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile, MemoryItem } from '@/models/user';
import { searchFiles } from '@/lib/fileconnector';
import connectToDatabase from '@/lib/db';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { message, sessionId, userId } = await request.json();
    
    // Get or create user profile
    let userProfile = await UserProfile.findOne({ userId });
    if (!userId) {
      const newUserId = uuidv4();
      userProfile = new UserProfile({ userId: newUserId });
      await userProfile.save();
    }
    
    // Find relevant personal data
    const relevantFiles = await searchFiles(process.env.USER_FILES_PATH || '/home/user/documents', message);
    const relevantMemories = await MemoryItem.find({
      $text: { $search: message }
    }).sort({ importance: -1 }).limit(5);
    
    // Create context from personal data
    const personalContext = `
      Relevant information about the user:
      ${relevantMemories.map(m => `- ${m.content}`).join('\n')}
      
      Relevant files: ${relevantFiles.length > 0 ? relevantFiles.join(', ') : 'None found'}
    `;
    
    // Find or create chat session
    // [rest of your existing session handling code]
    
    // Format messages for Deepseek API with personal context
    const systemMessage = {
      role: 'system',
      content: `You are a highly personalized AI assistant named [YourBotName]. 
                You know the user very well based on past conversations and personal data.
                Here is some context about the user: ${personalContext}`
    };
    
    const apiMessages = [
      systemMessage,
      ...sessionId.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }))
    ];

    // Generate response
    const responseContent = await generateChatResponse(apiMessages);
    
    // Extract any new memory items to remember
    // This would be a function that identifies important information to remember
    const newMemories = extractMemories(message, responseContent);
    if (newMemories.length > 0) {
      for (const memoryContent of newMemories) {
        const memory = new MemoryItem({
          content: memoryContent,
          category: 'conversation',
          importance: 2
        });
        await memory.save();
        userProfile.memoryItems.push(memory._id);
      }
      await userProfile.save();
    }
    
    // [rest of your existing code for saving the assistant message and returning]
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}

function extractMemories(userMessage: string, assistantResponse: string): string[] {
  // This would be a more sophisticated function to extract key information
  // For now, a simple implementation that looks for personal details
  const memories = [];
  const personalPatterns = [
    /my name is (\w+)/i,
    /I (like|love|enjoy|prefer) (\w+)/i,
    /I (work|study) at (\w+)/i
  ];
  
  for (const pattern of personalPatterns) {
    const match = userMessage.match(pattern);
    if (match) {
      memories.push(`User ${match[0]}`);
    }
  }
  
  return memories;
}