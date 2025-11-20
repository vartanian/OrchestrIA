import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, CalendarEvent, Project } from '../types';
import { taskAPI, eventAPI, projectAPI, APIError } from '../services/apiService';

interface StoreContextType {
  tasks: Task[];
  events: CalendarEvent[];
  projects: Project[];
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  addEvent: (event: CalendarEvent) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API on mount
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [tasksData, eventsData, projectsData] = await Promise.all([
        taskAPI.getAll(),
        eventAPI.getAll(),
        projectAPI.getAll()
      ]);
      
      setTasks(tasksData);
      setEvents(eventsData);
      setProjects(projectsData);
    } catch (err) {
      if (err instanceof APIError) {
        setError(`API Error: ${err.message}`);
        console.error('Failed to load data:', err);
      } else {
        setError('Failed to connect to backend. Using offline mode.');
        console.error('Network error:', err);
        // Fall back to localStorage if API is unavailable
        loadFromLocalStorage();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback: Load from localStorage if API is unavailable
  const loadFromLocalStorage = () => {
    try {
      const savedTasks = localStorage.getItem('orchestria_tasks');
      const savedEvents = localStorage.getItem('orchestria_events');
      const savedProjects = localStorage.getItem('orchestria_projects');
      
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedProjects) setProjects(JSON.parse(savedProjects));
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
    }
  };

  // Save to localStorage as backup (in case API is down)
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('orchestria_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('orchestria_events', JSON.stringify(events));
    }
  }, [events]);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('orchestria_projects', JSON.stringify(projects));
    }
  }, [projects]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  // Add task via API
  const addTask = async (task: Task) => {
    try {
      const newTask = await taskAPI.create(task);
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      console.error('Failed to add task:', err);
      // Fallback: Add locally
      setTasks(prev => [task, ...prev]);
      throw err;
    }
  };

  // Update task via API
  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskAPI.update(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (err) {
      console.error('Failed to update task:', err);
      // Fallback: Update locally
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      throw err;
    }
  };

  // Add event via API
  const addEvent = async (event: CalendarEvent) => {
    try {
      const newEvent = await eventAPI.create(event);
      setEvents(prev => [...prev, newEvent]);
    } catch (err) {
      console.error('Failed to add event:', err);
      // Fallback: Add locally
      setEvents(prev => [...prev, event]);
      throw err;
    }
  };

  // Update event via API
  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const updatedEvent = await eventAPI.update(id, updates);
      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
    } catch (err) {
      console.error('Failed to update event:', err);
      // Fallback: Update locally
      setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      throw err;
    }
  };

  // Update project via API
  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectAPI.update(id, updates);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    } catch (err) {
      console.error('Failed to update project:', err);
      // Fallback: Update locally
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      throw err;
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await loadData();
  };

  return (
    <StoreContext.Provider value={{ 
      tasks, 
      events, 
      projects, 
      addTask, 
      updateTask, 
      addEvent, 
      updateEvent, 
      updateProject,
      isLoading,
      error,
      refreshData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};