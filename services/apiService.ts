// API Service for OrchestrIA Frontend
// This replaces localStorage calls with actual API requests

import { Task, CalendarEvent, Project } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ================== ERROR HANDLING ==================

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new APIError(response.status, error.error || response.statusText);
  }
  return response.json();
}

// ================== TASKS API ==================

export const taskAPI = {
  // Get all tasks
  getAll: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`);
    const data = await handleResponse<any[]>(response);
    
    // Transform snake_case from DB to camelCase for frontend
    return data.map(transformTaskFromDB);
  },

  // Get single task
  getById: async (id: string): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`);
    const data = await handleResponse<any>(response);
    return transformTaskFromDB(data);
  },

  // Create new task
  create: async (task: Task): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformTaskToDB(task))
    });
    const data = await handleResponse<any>(response);
    return transformTaskFromDB(data);
  },

  // Update task
  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformTaskToDB(updates))
    });
    const data = await handleResponse<any>(response);
    return transformTaskFromDB(data);
  },

  // Delete task
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE'
    });
    await handleResponse<void>(response);
  }
};

// ================== EVENTS API ==================

export const eventAPI = {
  // Get all events
  getAll: async (): Promise<CalendarEvent[]> => {
    const response = await fetch(`${API_BASE_URL}/api/events`);
    const data = await handleResponse<any[]>(response);
    return data.map(transformEventFromDB);
  },

  // Get single event
  getById: async (id: string): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`);
    const data = await handleResponse<any>(response);
    return transformEventFromDB(data);
  },

  // Create new event
  create: async (event: CalendarEvent): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformEventToDB(event))
    });
    const data = await handleResponse<any>(response);
    return transformEventFromDB(data);
  },

  // Update event
  update: async (id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformEventToDB(updates))
    });
    const data = await handleResponse<any>(response);
    return transformEventFromDB(data);
  },

  // Delete event
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'DELETE'
    });
    await handleResponse<void>(response);
  }
};

// ================== PROJECTS API ==================

export const projectAPI = {
  // Get all projects
  getAll: async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE_URL}/api/projects`);
    const data = await handleResponse<any[]>(response);
    return data.map(transformProjectFromDB);
  },

  // Get single project
  getById: async (id: string): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`);
    const data = await handleResponse<any>(response);
    return transformProjectFromDB(data);
  },

  // Create new project
  create: async (project: Project): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformProjectToDB(project))
    });
    const data = await handleResponse<any>(response);
    return transformProjectFromDB(data);
  },

  // Update project
  update: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformProjectToDB(updates))
    });
    const data = await handleResponse<any>(response);
    return transformProjectFromDB(data);
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'DELETE'
    });
    await handleResponse<void>(response);
  }
};

// ================== HEALTH CHECK ==================

export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
};

// ================== DATA TRANSFORMERS ==================

function transformTaskFromDB(data: any): Task {
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    source: data.source,
    priority: data.priority,
    dueDate: data.due_date,
    estimatedMinutes: data.estimated_minutes,
    status: data.status,
    project: data.project,
    assignee: data.assignee,
    contextLink: data.context_link,
    aiAnalysis: data.ai_analysis
  };
}

function transformTaskToDB(task: Partial<Task>): any {
  const dbTask: any = {};
  if (task.id) dbTask.id = task.id;
  if (task.title) dbTask.title = task.title;
  if (task.description !== undefined) dbTask.description = task.description;
  if (task.source) dbTask.source = task.source;
  if (task.priority) dbTask.priority = task.priority;
  if (task.dueDate !== undefined) dbTask.due_date = task.dueDate;
  if (task.estimatedMinutes !== undefined) dbTask.estimated_minutes = task.estimatedMinutes;
  if (task.status) dbTask.status = task.status;
  if (task.project !== undefined) dbTask.project = task.project;
  if (task.assignee !== undefined) dbTask.assignee = task.assignee;
  if (task.contextLink !== undefined) dbTask.context_link = task.contextLink;
  if (task.aiAnalysis !== undefined) dbTask.ai_analysis = task.aiAnalysis;
  return dbTask;
}

function transformEventFromDB(data: any): CalendarEvent {
  return {
    id: data.id,
    title: data.title,
    start: data.start_time,
    end: data.end_time,
    type: data.type,
    attendees: data.attendees || []
  };
}

function transformEventToDB(event: Partial<CalendarEvent>): any {
  const dbEvent: any = {};
  if (event.id) dbEvent.id = event.id;
  if (event.title) dbEvent.title = event.title;
  if (event.start) dbEvent.start_time = event.start;
  if (event.end) dbEvent.end_time = event.end;
  if (event.type) dbEvent.type = event.type;
  if (event.attendees !== undefined) dbEvent.attendees = event.attendees;
  return dbEvent;
}

function transformProjectFromDB(data: any): Project {
  return {
    id: data.id,
    name: data.name,
    status: data.status,
    progress: data.progress,
    nextMilestone: data.next_milestone,
    milestoneDate: data.milestone_date
  };
}

function transformProjectToDB(project: Partial<Project>): any {
  const dbProject: any = {};
  if (project.id) dbProject.id = project.id;
  if (project.name) dbProject.name = project.name;
  if (project.status) dbProject.status = project.status;
  if (project.progress !== undefined) dbProject.progress = project.progress;
  if (project.nextMilestone) dbProject.next_milestone = project.nextMilestone;
  if (project.milestoneDate) dbProject.milestone_date = project.milestoneDate;
  return dbProject;
}

export { APIError };