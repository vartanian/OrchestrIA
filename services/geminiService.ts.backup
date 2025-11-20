import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";
import { Task, Project, CalendarEvent } from '../types';

// Robustly access the API key, handling cases where process or env might be undefined
const getApiKey = () => {
  try {
    // 1. Check window.process (Browser Polyfills via index.html)
    if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
      return (window as any).process.env.API_KEY;
    }
    // 2. Check standard process.env (Node/Build tools)
    // We check typeof process to avoid ReferenceError in strict browser envs
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            return process.env.API_KEY;
        }
    } catch (e) {
        // Ignore access errors
    }
    return '';
  } catch (e) {
    console.warn("Error reading API Key from environment", e);
    return '';
  }
};

const API_KEY = getApiKey();

// Helper to get AI instance
const getAI = () => {
  if (!API_KEY) {
    // Only warn once or when strictly needed to avoid console spam on load if keys aren't ready
    // console.warn("No API Key found in environment. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

// --- Tool Definitions ---

const tools: FunctionDeclaration[] = [
  {
    name: 'updateTaskStatus',
    description: 'Update the status of a specific task to todo, in_progress, or done.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskId: { type: Type.STRING, description: "The ID of the task (e.g., 't1')" },
        status: { type: Type.STRING, description: "The new status: 'todo', 'in_progress', or 'done'" }
      },
      required: ['taskId', 'status']
    }
  },
  {
    name: 'createTask',
    description: 'Create a new task in the system.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Title of the task" },
        priority: { type: Type.STRING, description: "Priority: CRITICAL, HIGH, MEDIUM, LOW" },
        estimatedMinutes: { type: Type.NUMBER, description: "Estimated duration in minutes" }
      },
      required: ['title', 'priority']
    }
  },
  {
    name: 'rescheduleEvent',
    description: 'Reschedule a calendar event to a new time.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: { type: Type.STRING, description: "The ID of the event" },
        newStartTime: { type: Type.STRING, description: "ISO String for new start time" },
        newEndTime: { type: Type.STRING, description: "ISO String for new end time" }
      },
      required: ['eventId', 'newStartTime', 'newEndTime']
    }
  }
];

// --- Logic ---

export const generateMorningBriefing = async (
  tasks: Task[],
  events: CalendarEvent[],
  projects: Project[]
): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Welcome back. Please configure your API Key to see your intelligent briefing.";

  const prompt = `
    You are OrchestrIA, a Chief of Staff for a busy executive. 
    
    Context:
    Tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, priority: t.priority, due: t.dueDate })))}
    Calendar Today: ${JSON.stringify(events.map(e => ({ title: e.title, start: e.start })))}
    Projects: ${JSON.stringify(projects)}

    Goal:
    Generate a concise, 3-sentence "Morning Briefing". 
    1. Highlight the absolute most critical task.
    2. Mention any schedule tightness or focus block recommendations.
    3. Flag one project risk if any exists.
    
    Tone: Professional, crisp, actionable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Unable to generate briefing.";
  } catch (error) {
    console.error("Briefing Error:", error);
    return "Good morning. I'm unable to connect to the synthesis engine right now.";
  }
};

export const createChatSession = (): Chat | null => {
  const ai = getAI();
  if (!ai) return null;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      tools: [{ functionDeclarations: tools }],
      systemInstruction: `
        You are OrchestrIA, a highly capable "Chief of Staff" AI agent.
        Your goal is to help them manage tasks, schedule, and projects.
        
        DATA CONTEXT:
        You have access to tools to modify tasks and calendar events.
        Always use tools when the user implies an action (e.g., "mark that done", "move the meeting").
        
        When you call a tool, provide a short confirmation message to the user after the tool execution result is returned to you.
        
        Current Date: ${new Date().toISOString()}
      `
    }
  });
};
