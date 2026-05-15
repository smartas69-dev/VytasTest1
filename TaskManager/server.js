const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for tasks
let tasks = [];
let nextId = 1;

// Validation middleware
const validateTask = (req, res, next) => {
  const { title, description, status, priority, dueDate, owner } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }
  
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' });
  }
  
  if (status !== undefined && !['pending', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be one of: pending, in-progress, completed' });
  }
  
  if (priority !== undefined && !['Low', 'Medium', 'High'].includes(priority)) {
    return res.status(400).json({ error: 'Priority must be one of: Low, Medium, High' });
  }
  
  if (dueDate !== undefined && dueDate !== '' && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({ error: 'Due date must be a valid date' });
  }
  
  if (owner !== undefined && typeof owner !== 'string') {
    return res.status(400).json({ error: 'Owner must be a string' });
  }
  
  next();
};

// CREATE - Add a new task
app.post('/tasks', validateTask, (req, res) => {
  const { title, description, status, priority, dueDate, owner } = req.body;
  
  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : '',
    status: status || 'pending',
    priority: priority || 'Medium',
    dueDate: dueDate || null,
    owner: owner ? owner.trim() : '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// READ - Get all tasks
app.get('/tasks', (req, res) => {
  const { status } = req.query;
  
  if (status) {
    const filteredTasks = tasks.filter(task => task.status === status);
    return res.json(filteredTasks);
  }
  
  res.json(tasks);
});

// READ - Get a single task by ID
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json(task);
});

// UPDATE - Update a task by ID
app.put('/tasks/:id', validateTask, (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { title, description, status, priority, dueDate, owner } = req.body;
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title.trim(),
    description: description ? description.trim() : tasks[taskIndex].description,
    status: status || tasks[taskIndex].status,
    priority: priority || tasks[taskIndex].priority,
    dueDate: dueDate !== undefined ? dueDate : tasks[taskIndex].dueDate,
    owner: owner !== undefined ? owner.trim() : tasks[taskIndex].owner,
    updatedAt: new Date().toISOString()
  };
  
  res.json(tasks[taskIndex]);
});

// PATCH - Partially update a task by ID
app.patch('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { title, description, status, priority, dueDate, owner } = req.body;
  
  // Validate only provided fields
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'Title must be a non-empty string' });
  }
  
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' });
  }
  
  if (status !== undefined && !['pending', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be one of: pending, in-progress, completed' });
  }
  
  if (priority !== undefined && !['Low', 'Medium', 'High'].includes(priority)) {
    return res.status(400).json({ error: 'Priority must be one of: Low, Medium, High' });
  }
  
  if (dueDate !== undefined && dueDate !== '' && dueDate !== null && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({ error: 'Due date must be a valid date' });
  }
  
  if (owner !== undefined && typeof owner !== 'string') {
    return res.status(400).json({ error: 'Owner must be a string' });
  }
  
  // Update only provided fields
  if (title !== undefined) tasks[taskIndex].title = title.trim();
  if (description !== undefined) tasks[taskIndex].description = description.trim();
  if (status !== undefined) tasks[taskIndex].status = status;
  if (priority !== undefined) tasks[taskIndex].priority = priority;
  if (dueDate !== undefined) tasks[taskIndex].dueDate = dueDate;
  if (owner !== undefined) tasks[taskIndex].owner = owner.trim();
  tasks[taskIndex].updatedAt = new Date().toISOString();
  
  res.json(tasks[taskIndex]);
});

// DELETE - Delete a task by ID
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json({ message: 'Task deleted successfully', task: deletedTask });
});

// DELETE - Delete all tasks
app.delete('/tasks', (req, res) => {
  const count = tasks.length;
  tasks = [];
  nextId = 1;
  res.json({ message: `All tasks deleted successfully`, count });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TaskManager API',
    endpoints: {
      'POST /tasks': 'Create a new task',
      'GET /tasks': 'Get all tasks (optional query: ?status=pending|in-progress|completed)',
      'GET /tasks/:id': 'Get a task by ID',
      'PUT /tasks/:id': 'Update a task by ID (full update)',
      'PATCH /tasks/:id': 'Partially update a task by ID',
      'DELETE /tasks/:id': 'Delete a task by ID',
      'DELETE /tasks': 'Delete all tasks'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`TaskManager API is running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT} for API documentation`);
});

// Made with Bob
