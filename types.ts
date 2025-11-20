export enum Priority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum Source {
  JIRA = 'JIRA',
  SLACK = 'SLACK',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  MANUAL = 'MANUAL'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  source: Source;
  priority: Priority;
  dueDate?: string; // ISO date string
  estimatedMinutes: number;
  status: 'todo' | 'in_progress' | 'done';
  project?: string;
  assignee?: string;
  contextLink?: string;
  aiAnalysis?: string; // Explanation of why AI prioritized this
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  type: 'meeting' | 'focus' | 'admin';
  attendees?: string[];
}

export interface Project {
  id: string;
  name: string;
  status: 'on_track' | 'at_risk' | 'delayed';
  progress: number; // 0-100
  nextMilestone: string;
  milestoneDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}