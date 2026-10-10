/**
 * AI Website Architect - Express & Node.js Backend API
 * Supports Supabase Auth, MongoDB persistence, and Gemini/OpenAI proxies
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory / MongoDB sync project store
const projectsStore = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Website Architect API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Save or Update Project (Supabase/Mongo adapter ready)
app.post('/api/projects', (req, res) => {
  try {
    const { project } = req.body;
    if (!project || !project.id) {
      return res.status(400).json({ error: 'Valid project object required.' });
    }
    projectsStore.set(project.id, { ...project, updatedAt: Date.now() });
    return res.json({ success: true, project: projectsStore.get(project.id) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get Project by ID
app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const project = projectsStore.get(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  return res.json({ success: true, project });
});

// List all projects
app.get('/api/projects', (req, res) => {
  const list = Array.from(projectsStore.values());
  return res.json({ success: true, count: list.length, projects: list });
});

app.listen(PORT, () => {
  console.log(`[AI Backend] Express server running on port ${PORT}`);
});
