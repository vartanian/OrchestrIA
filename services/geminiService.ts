import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || "";
};

const genAI = new GoogleGenerativeAI(getApiKey());

// Tool definitions for function calling
const tools = [{
  functionDeclarations: [
    {
      name: "updateTaskStatus",
      description: "Update the status of a task",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "The ID of the task to update"
          },
          status: {
            type: "string",
            enum: ["todo", "in-progress", "completed"],
            description: "The new status for the task"
          }
        },
        required: ["taskId", "status"]
      }
    },
    {
      name: "createTask",
      description: "Create a new task",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the task"
          },
          description: {
            type: "string",
            description: "Detailed description of the task"
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Priority level of the task"
          },
          estimatedMinutes: {
            type: "number",
            description: "Estimated time to complete in minutes"
          }
        },
        required: ["title", "priority"]
      }
    },
    {
      name: "rescheduleEvent",
      description: "Reschedule a calendar event",
      parameters: {
        type: "object",
        properties: {
          eventId: {
            type: "string",
            description: "The ID of the event to reschedule"
          },
          newStartTime: {
            type: "string",
            description: "New start time in ISO format"
          },
          newEndTime: {
            type: "string",
            description: "New end time in ISO format"
          }
        },
        required: ["eventId", "newStartTime", "newEndTime"]
      }
    }
  ]
}];

// System instruction for the AI
const systemInstruction = `You are OrchestrIA, an AI assistant for project and task management.
Your goal is to help users manage tasks, schedule, and projects.

DATA CONTEXT:
You have access to tools to modify tasks and calendar events.
Always use tools when the user implies an action (e.g., "mark that done", "move the meeting").

When you call a tool, provide a short confirmation message to the user after the tool execution result is returned to you.

Current Date: ${new Date().toISOString()}`;

// Create chat session for AIChat component
export const createChatSession = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Gemini API key not found");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      tools: tools,
      systemInstruction: systemInstruction
    });

    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    return chat;
  } catch (error) {
    console.error("Error creating chat session:", error);
    return null;
  }
};

// Generate morning briefing based on tasks, events, and projects
export const generateMorningBriefing = async (tasks: any[], events: any[], projects: any[]) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "AI briefing unavailable. Please configure your Gemini API key.";
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro"
    });

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    // Prepare context
    const taskSummary = tasks.slice(0, 5).map(t => 
      `- ${t.title} (${t.status}, priority: ${t.priority})`
    ).join('\n');

    const eventSummary = events.slice(0, 5).map(e => 
      `- ${e.title} at ${new Date(e.start).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`
    ).join('\n');

    const projectSummary = projects.slice(0, 3).map(p => 
      `- ${p.name}: ${p.tasksCompleted}/${p.totalTasks} tasks completed`
    ).join('\n');

    const prompt = `Generate a concise, professional morning briefing for ${today}. 
    
Keep it under 3 sentences. Focus on:
1. What needs attention today
2. Key meetings or deadlines
3. Overall workload assessment

Current Tasks:
${taskSummary || 'No active tasks'}

Today's Events:
${eventSummary || 'No events scheduled'}

Active Projects:
${projectSummary || 'No active projects'}

Write in a calm, executive assistant tone. Be specific but brief.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating morning briefing:", error);
    return "Good morning! Your tasks and schedule are ready for review.";
  }
};

// Alternative API for direct message generation (if needed elsewhere)
export const generateAIResponse = async (messages: any[]) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      tools: tools,
      systemInstruction: systemInstruction
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;

    // Handle function calls
    if (response.functionCalls && response.functionCalls.length > 0) {
      return {
        text: response.text() || "I'll help you with that.",
        functionCalls: response.functionCalls
      };
    }

    return {
      text: response.text(),
      functionCalls: []
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
};