import { Task, Priority, Source, CalendarEvent, Project } from '../types';

const now = new Date();

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Review Q2 Financial Forecast',
    description: 'Finance team needs approval on the revised budget before EOD.',
    source: Source.EMAIL,
    priority: Priority.CRITICAL,
    estimatedMinutes: 45,
    status: 'todo',
    project: 'Corporate Strategy',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0).toISOString(),
    contextLink: 'mailto:cfo@company.com',
    aiAnalysis: 'High urgency detected from email subject "URGENT: Q2 Budget". Deadline is today.'
  },
  {
    id: 't2',
    title: 'Fix API Rate Limiting Bug',
    description: 'Ticket PROJ-124: Users reporting 429 errors unexpectedly.',
    source: Source.JIRA,
    priority: Priority.HIGH,
    estimatedMinutes: 120,
    status: 'in_progress',
    project: 'Platform Scale',
    contextLink: 'jira.company.com/browse/PROJ-124'
  },
  {
    id: 't3',
    title: 'Prepare Slide Deck for All-Hands',
    description: 'Need to draft the product roadmap section.',
    source: Source.SLACK,
    priority: Priority.MEDIUM,
    estimatedMinutes: 60,
    status: 'todo',
    project: 'Internal Comms',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString()
  },
  {
    id: 't4',
    title: 'Approve Design Assets for Campaign',
    description: 'Review the Figma file for the new landing page.',
    source: Source.JIRA,
    priority: Priority.LOW,
    estimatedMinutes: 15,
    status: 'todo',
    project: 'Marketing Launch'
  }
];

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Daily Standup',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30).toISOString(),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(),
    type: 'meeting',
    attendees: ['team@company.com']
  },
  {
    id: 'e2',
    title: 'Deep Work: API Architecture',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30).toISOString(),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30).toISOString(),
    type: 'focus'
  },
  {
    id: 'e3',
    title: 'Vendor Sync',
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString(),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30).toISOString(),
    type: 'meeting'
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Project Apollo',
    status: 'on_track',
    progress: 75,
    nextMilestone: 'Beta Launch',
    milestoneDate: '2024-06-15'
  },
  {
    id: 'p2',
    name: 'Platform Migration',
    status: 'at_risk',
    progress: 40,
    nextMilestone: 'Database Switchover',
    milestoneDate: '2024-05-30'
  },
  {
    id: 'p3',
    name: 'Mobile App Refresh',
    status: 'delayed',
    progress: 20,
    nextMilestone: 'Design Approval',
    milestoneDate: '2024-05-10'
  }
];