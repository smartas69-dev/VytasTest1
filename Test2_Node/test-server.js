const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TaskManager2 API - Test Server (No MongoDB)',
    version: '1.0.0',
    status: 'Server is running successfully!',
    note: 'This is a test server without MongoDB connection',
    endpoints: {
      tasks: {
        getAll: 'GET /api/tasks',
        getOne: 'GET /api/tasks/:id',
        create: 'POST /api/tasks',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id',
      },
    },
  });
});

// In-memory storage for testing
let mockTasks = [
  {
    _id: '1',
    title: 'Sample Task 1',
    description: 'This is a sample task for testing',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-05-20',
    assignedTo: 'John Doe',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Sample Task 2',
    description: 'Another sample task',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2026-05-25',
    assignedTo: 'Jane Smith',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = 3;

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    count: mockTasks.length,
    data: mockTasks,
  });
});

// GET single task
app.get('/api/tasks/:id', (req, res) => {
  const task = mockTasks.find(t => t._id === req.params.id);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found',
    });
  }
  res.json({
    success: true,
    data: task,
  });
});

// POST create task
app.post('/api/tasks', (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo } = req.body;
  
  if (!title) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a title',
    });
  }
  
  const newTask = {
    _id: String(nextId++),
    title,
    description: description || '',
    status: status || 'pending',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    assignedTo: assignedTo || '',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockTasks.push(newTask);
  
  res.status(201).json({
    success: true,
    data: newTask,
  });
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  const taskIndex = mockTasks.findIndex(t => t._id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Task not found',
    });
  }
  
  const updatedTask = {
    ...mockTasks[taskIndex],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  
  mockTasks[taskIndex] = updatedTask;
  
  res.json({
    success: true,
    data: updatedTask,
  });
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = mockTasks.findIndex(t => t._id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Task not found',
    });
  }
  
  mockTasks.splice(taskIndex, 1);
  
  res.json({
    success: true,
    data: {},
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test the application`);
  console.log('\nNote: To use the full application with database:');
  console.log('1. Install MongoDB locally or use MongoDB Atlas');
  console.log('2. Update MONGODB_URI in .env file');
  console.log('3. Run: npm start');
});

// Made with Bob
