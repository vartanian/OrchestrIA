import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3001;

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Helper function to normalize priority
const normalizePriority = (priority) => {
  if (!priority) return 'MEDIUM';
  return priority.toUpperCase();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ================== TASKS API ==================

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tasks 
      ORDER BY 
        CASE priority 
          WHEN 'CRITICAL' THEN 1 
          WHEN 'HIGH' THEN 2 
          WHEN 'MEDIUM' THEN 3 
          WHEN 'LOW' THEN 4 
        END,
        created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get single task by ID
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { 
      id,
      title, 
      description, 
      source, 
      priority, 
      due_date, 
      estimated_minutes, 
      status, 
      project, 
      assignee, 
      context_link, 
      ai_analysis 
    } = req.body;

    // Normalize priority to uppercase
    const normalizedPriority = normalizePriority(priority);

    const result = await pool.query(
      `INSERT INTO tasks (
        id, title, description, source, priority, due_date, 
        estimated_minutes, status, project, assignee, context_link, ai_analysis
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *`,
      [
        id || `t${Date.now()}`,
        title, 
        description || '', 
        source || 'MANUAL', 
        normalizedPriority, 
        due_date || null,
        estimated_minutes || 30, 
        status || 'todo', 
        project || null, 
        assignee || null, 
        context_link || null, 
        ai_analysis || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update task (including status changes from AI)
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    
    // Normalize priority if it's being updated
    if (updates.priority) {
      updates.priority = normalizePriority(updates.priority);
    }
    
    // Build dynamic UPDATE query
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const query = `UPDATE tasks SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;
    
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully', task: result.rows[0] });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================== EVENTS API ==================

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM events 
      ORDER BY start_time ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get single event
app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new event
app.post('/api/events', async (req, res) => {
  try {
    const { id, title, start_time, end_time, type, attendees } = req.body;

    const result = await pool.query(
      `INSERT INTO events (id, title, start_time, end_time, type, attendees) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        id || `e${Date.now()}`,
        title,
        start_time,
        end_time,
        type || 'meeting',
        JSON.stringify(attendees || [])
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update event (including rescheduling from AI)
app.patch('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const query = `UPDATE events SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;
    
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully', event: result.rows[0] });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================== PROJECTS API ==================

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const { id, name, status, progress, next_milestone, milestone_date } = req.body;

    const result = await pool.query(
      `INSERT INTO projects (id, name, status, progress, next_milestone, milestone_date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        id || `p${Date.now()}`,
        name,
        status || 'on_track',
        progress || 0,
        next_milestone,
        milestone_date
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update project
app.patch('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const query = `UPDATE projects SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;
    
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully', project: result.rows[0] });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================== ERROR HANDLING ==================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ================== START SERVER ==================

app.listen(port, () => {
  console.log(`🚀 OrchestrIA Backend running on http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});