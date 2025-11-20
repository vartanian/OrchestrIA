-- OrchestrIA Database Schema
-- PostgreSQL 12+

-- ================== TASKS TABLE ==================

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source VARCHAR(50) DEFAULT 'MANUAL',
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    due_date TIMESTAMP,
    estimated_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    project VARCHAR(100),
    assignee VARCHAR(100),
    context_link TEXT,
    ai_analysis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project);

-- ================== EVENTS TABLE ==================

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    type VARCHAR(50) DEFAULT 'meeting' CHECK (type IN ('meeting', 'focus', 'admin')),
    attendees JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for calendar queries
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

-- ================== PROJECTS TABLE ==================

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'delayed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    next_milestone VARCHAR(255),
    milestone_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_milestone_date ON projects(milestone_date);

-- ================== SEED DATA (OPTIONAL) ==================
-- Insert mock data for testing (comment out for production)

INSERT INTO tasks (id, title, description, source, priority, estimated_minutes, status, project, due_date, context_link, ai_analysis)
VALUES 
('t1', 'Review Q2 Financial Forecast', 'Finance team needs approval on the revised budget before EOD.', 'EMAIL', 'CRITICAL', 45, 'todo', 'Corporate Strategy', 
 CURRENT_TIMESTAMP + INTERVAL '8 hours', 'mailto:cfo@company.com', 
 'High urgency detected from email subject "URGENT: Q2 Budget". Deadline is today.'),

('t2', 'Fix API Rate Limiting Bug', 'Ticket PROJ-124: Users reporting 429 errors unexpectedly.', 'JIRA', 'HIGH', 120, 'in_progress', 'Platform Scale', 
 NULL, 'jira.company.com/browse/PROJ-124', NULL),

('t3', 'Prepare Slide Deck for All-Hands', 'Need to draft the product roadmap section.', 'SLACK', 'MEDIUM', 60, 'todo', 'Internal Comms', 
 CURRENT_TIMESTAMP + INTERVAL '2 days', NULL, NULL),

('t4', 'Approve Design Assets for Campaign', 'Review the Figma file for the new landing page.', 'JIRA', 'LOW', 15, 'todo', 'Marketing Launch', 
 NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, start_time, end_time, type, attendees)
VALUES 
('e1', 'Daily Standup', 
 DATE_TRUNC('day', CURRENT_TIMESTAMP) + INTERVAL '9 hours 30 minutes',
 DATE_TRUNC('day', CURRENT_TIMESTAMP) + INTERVAL '10 hours',
 'meeting', '["team@company.com"]'::jsonb),

('e2', 'Deep Work: API Architecture', 
 DATE_TRUNC('day', CURRENT_TIMESTAMP) + INTERVAL '10 hours 30 minutes',
 DATE_TRUNC('day', CURRENT_TIMESTAMP) + INTERVAL '12 hours 30 minutes',
 'focus', '[]'::jsonb),

('e3', 'Vendor Sync', 
 DATE_TRUNC('day', CURRENT_TIMESTAMP) + INTERVAL '14 hours',
 DATE_TRUNC('day', CURRENT_TIMESTAMP) + INTERVAL '14 hours 30 minutes',
 'meeting', '["vendor@example.com"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, name, status, progress, next_milestone, milestone_date)
VALUES 
('p1', 'Project Apollo', 'on_track', 75, 'Beta Launch', CURRENT_DATE + INTERVAL '30 days'),
('p2', 'Platform Migration', 'at_risk', 40, 'Database Switchover', CURRENT_DATE + INTERVAL '10 days'),
('p3', 'Mobile App Refresh', 'delayed', 20, 'Design Approval', CURRENT_DATE - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- ================== FUNCTIONS ==================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================== VIEWS (OPTIONAL) ==================

-- View for active tasks
CREATE OR REPLACE VIEW active_tasks AS
SELECT * FROM tasks WHERE status != 'done' ORDER BY 
    CASE priority 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        WHEN 'LOW' THEN 4 
    END;

-- View for today's events
CREATE OR REPLACE VIEW todays_events AS
SELECT * FROM events 
WHERE DATE(start_time) = CURRENT_DATE 
ORDER BY start_time;

-- View for at-risk projects
CREATE OR REPLACE VIEW at_risk_projects AS
SELECT * FROM projects WHERE status IN ('at_risk', 'delayed');
