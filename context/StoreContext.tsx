import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, CalendarEvent, Project, Priority, Source } from '../types';
import { MOCK_TASKS, MOCK_EVENTS, MOCK_PROJECTS } from '../services/mockData';

interface StoreContextType {
  tasks: Task[];
  events: CalendarEvent[];
  projects: Project[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('orchestria_tasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('orchestria_events');
    return saved ? JSON.parse(saved) : MOCK_EVENTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('orchestria_projects');
    return saved ? JSON.parse(saved) : MOCK_PROJECTS;
  });

  // Persistence effects
  useEffect(() => { localStorage.setItem('orchestria_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('orchestria_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('orchestria_projects', JSON.stringify(projects)); }, [projects]);

  const addTask = (task: Task) => setTasks(prev => [task, ...prev]);
  
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addEvent = (event: CalendarEvent) => setEvents(prev => [...prev, event]);

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <StoreContext.Provider value={{ 
      tasks, events, projects, 
      addTask, updateTask, addEvent, updateEvent, updateProject 
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