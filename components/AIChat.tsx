import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Mic } from 'lucide-react';
import { ChatMessage, Task, Priority, Source } from '../types';
import { Chat, GenerateContentResponse } from "@google/genai";
import { createChatSession } from '../services/geminiService';
import { useStore } from '../context/StoreContext';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const { tasks, events, updateTask, addTask, updateEvent } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello. I'm OrchestrIA. I can help manage your tasks and schedule. What do you need?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat
  useEffect(() => {
    try {
      if (!chatSession.current) {
        const session = createChatSession();
        if (session) {
          chatSession.current = session;
        }
      }
    } catch (e) {
      console.warn("Failed to initialize chat session (likely missing API key)");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // --- Tool Execution Logic ---
  const handleToolCalls = async (toolCalls: any[]) => {
    const functionResponses = [];

    for (const call of toolCalls) {
        const { name, args } = call;
        let result = { result: "Success" };
        
        console.log(`Executing Tool: ${name}`, args);

        try {
            if (name === 'updateTaskStatus') {
                updateTask(args.taskId, { status: args.status });
                result = { result: `Task ${args.taskId} status updated to ${args.status}` };
            } 
            else if (name === 'createTask') {
                const newTask: Task = {
                    id: `t${Date.now()}`,
                    title: args.title,
                    description: 'Created via AI',
                    source: Source.MANUAL,
                    priority: args.priority as Priority,
                    estimatedMinutes: args.estimatedMinutes || 30,
                    status: 'todo'
                };
                addTask(newTask);
                result = { result: `Created task: ${newTask.title} (ID: ${newTask.id})` };
            }
            else if (name === 'rescheduleEvent') {
                updateEvent(args.eventId, { start: args.newStartTime, end: args.newEndTime });
                result = { result: `Event ${args.eventId} moved to ${args.newStartTime}` };
            }
        } catch (e: any) {
            console.error("Tool execution failed", e);
            result = { result: `Error: ${e.message}` };
        }

        functionResponses.push({
            name: name,
            response: result,
            id: call.id
        });
    }

    // Send results back to Gemini
    if (functionResponses.length > 0 && chatSession.current) {
        // Send tool response
        const parts = functionResponses.map(response => ({
          functionResponse: response
        }));

        try {
            const resultResponse = await chatSession.current.sendMessageStream({ message: parts });
            
            let fullText = "";
            for await (const chunk of resultResponse) {
                const c = chunk as GenerateContentResponse;
                if (c.text) fullText += c.text;
            }
            return fullText;
        } catch (e) {
            console.error("Error sending tool response", e);
            return "I encountered an error processing the action results.";
        }
    }
    return null;
  };


  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    
    // Add User Message
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText, timestamp: new Date() }]);
    setIsTyping(true);

    try {
      if (!chatSession.current) {
          // Attempt to re-create session if it was null (e.g. api key added late)
          chatSession.current = createChatSession();
      }
      
      if (!chatSession.current) {
          // Delay throwing to let user message appear
          setMessages(prev => [...prev, {
            id: Date.now().toString(), 
            role: 'model', 
            text: "AI capabilities are currently unavailable. Please check your API Key configuration.", 
            timestamp: new Date()
          }]);
          setIsTyping(false);
          return;
      }

      // 1. Send User Message
      // Inject Context about current tasks so AI knows IDs
      const contextMsg = `
        [System Context]: 
        Current Tasks: ${JSON.stringify(tasks.map(t => ({id: t.id, title: t.title, status: t.status})))}
        Current Events: ${JSON.stringify(events.map(e => ({id: e.id, title: e.title, start: e.start})))}
        
        User Request: ${userText}
      `;

      const result = await chatSession.current.sendMessageStream({ message: contextMsg });
      
      let fullResponse = "";
      
      // Create a placeholder message for streaming text
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: new Date(), isTyping: true }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        
        // Handle Function Calls
        if (c.functionCalls && c.functionCalls.length > 0) {
            const toolResultText = await handleToolCalls(c.functionCalls);
            if (toolResultText) fullResponse += toolResultText;
        } 
        // Handle Text
        else if (c.text) {
            fullResponse += c.text;
        }

        // Live Update UI
        setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: fullResponse, isTyping: true } : msg
        ));
      }

      // Finalize state
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, isTyping: false } : msg
      ));

    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'model', 
        text: `System Error: ${error.message || "Unknown error"}`, timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col z-50 transition-transform duration-300 transform translate-x-0">
      <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-500 rounded-lg"><Bot className="w-5 h-5 text-white" /></div>
          <div><h3 className="font-semibold text-sm">OrchestrIA</h3><p className="text-xs text-slate-400">Agent Active</p></div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-xs text-slate-400 ml-2">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Try 'Mark task t1 as done'..."
            className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button onClick={handleSend} className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700"><Send className="w-4 h-4" /></button>
        </div>
        <div className="flex justify-between items-center mt-2 px-1">
             <div className="flex items-center text-[10px] text-emerald-600"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></div>Tools Enabled</div>
             <span className="text-[10px] text-slate-300">Gemini 2.5 Flash</span>
        </div>
      </div>
    </div>
  );
};

export default AIChat;