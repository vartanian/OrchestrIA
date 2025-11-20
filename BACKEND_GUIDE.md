# OrchestrIA Backend Implementation Guide

This app currently runs in "Serverless Mode" using the browser's LocalStorage. To make this a production application, you need to set up a real backend.

## Prerequisites
1. Node.js (v18+)
2. PostgreSQL Database
3. Python 3.9+ (for optional data science worker)

---

## Step 1: Node.js API Server (Express)

Create a folder `server` and initialize:
```bash
npm init -y
npm install express pg cors dotenv body-parser
```

Create `server/index.js`:

```javascript
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3001;

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

// Routes
// 1. Get Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY priority DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Task
app.post('/api/tasks', async (req, res) => {
  const { title, priority, estimatedMinutes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, priority, estimated_minutes, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, priority, estimatedMinutes, 'todo']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Task (Used by AI Agent)
app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
```

---

## Step 2: Database Schema

Run this SQL in your PostgreSQL instance:

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20),
    status VARCHAR(20) DEFAULT 'todo',
    estimated_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    type VARCHAR(50)
);
```

---

## Step 3: Python AI Worker (Optional)

If you want to run complex data analysis (like Monte Carlo simulations for project risk) outside of the browser, create `worker.py`.

```python
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)

@app.route('/analyze-risk', methods=['POST'])
def analyze_risk():
    data = request.json
    # Simulate 1000 project scenarios based on task completion velocity
    velocities = np.random.normal(loc=data['avg_velocity'], scale=2.0, size=1000)
    probability_of_delay = np.mean(velocities < data['required_velocity'])
    
    return jsonify({
        "risk_score": float(probability_of_delay),
        "status": "at_risk" if probability_of_delay > 0.5 else "on_track"
    })

if __name__ == '__main__':
    app.run(port=5000)
```

---

## Step 4: Integrating with Frontend

1. Open `context/StoreContext.tsx` in the frontend.
2. Remove the `localStorage` logic.
3. Replace `useEffect` with `fetch` calls to your new API:

```typescript
// Example replacement in StoreContext.tsx
useEffect(() => {
    fetch('http://localhost:3001/api/tasks')
        .then(res => res.json())
        .then(data => setTasks(data));
}, []);
```
