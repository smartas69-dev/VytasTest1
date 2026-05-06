const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for web interface
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory database
let todos = [];
let nextId = 1;

// Helper function to find todo by ID
const findTodoById = (id) => {
  return todos.find(todo => todo.id === parseInt(id));
};

// CREATE - Add a new todo
app.post('/api/todos', (req, res) => {
  const { title, description, completed } = req.body;
  
  // Validation
  if (!title || title.trim() === '') {
    return res.status(400).json({ 
      error: 'Title is required and cannot be empty' 
    });
  }

  const newTodo = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : '',
    completed: completed || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// READ - Get all todos
app.get('/api/todos', (req, res) => {
  const { completed } = req.query;
  
  // Filter by completed status if query parameter is provided
  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    const filteredTodos = todos.filter(todo => todo.completed === isCompleted);
    return res.json(filteredTodos);
  }
  
  res.json(todos);
});

// READ - Get a single todo by ID
app.get('/api/todos/:id', (req, res) => {
  const todo = findTodoById(req.params.id);
  
  if (!todo) {
    return res.status(404).json({ 
      error: 'Todo not found' 
    });
  }
  
  res.json(todo);
});

// UPDATE - Update a todo by ID
app.put('/api/todos/:id', (req, res) => {
  const todo = findTodoById(req.params.id);
  
  if (!todo) {
    return res.status(404).json({ 
      error: 'Todo not found' 
    });
  }

  const { title, description, completed } = req.body;

  // Validation
  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ 
      error: 'Title cannot be empty' 
    });
  }

  // Update fields if provided
  if (title !== undefined) todo.title = title.trim();
  if (description !== undefined) todo.description = description.trim();
  if (completed !== undefined) todo.completed = completed;
  todo.updatedAt = new Date().toISOString();

  res.json(todo);
});

// PATCH - Partially update a todo by ID
app.patch('/api/todos/:id', (req, res) => {
  const todo = findTodoById(req.params.id);
  
  if (!todo) {
    return res.status(404).json({ 
      error: 'Todo not found' 
    });
  }

  const { title, description, completed } = req.body;

  // Validation
  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ 
      error: 'Title cannot be empty' 
    });
  }

  // Update only provided fields
  if (title !== undefined) todo.title = title.trim();
  if (description !== undefined) todo.description = description.trim();
  if (completed !== undefined) todo.completed = completed;
  todo.updatedAt = new Date().toISOString();

  res.json(todo);
});

// DELETE - Delete a todo by ID
app.delete('/api/todos/:id', (req, res) => {
  const todoIndex = todos.findIndex(todo => todo.id === parseInt(req.params.id));
  
  if (todoIndex === -1) {
    return res.status(404).json({ 
      error: 'Todo not found' 
    });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];
  res.json({ 
    message: 'Todo deleted successfully',
    todo: deletedTodo 
  });
});

// DELETE - Delete all todos
app.delete('/api/todos', (req, res) => {
  const count = todos.length;
  todos = [];
  nextId = 1;
  res.json({ 
    message: `All todos deleted successfully`,
    count: count 
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Todo API Server',
    version: '1.0.0',
    endpoints: {
      'GET /api/todos': 'Get all todos (optional query: ?completed=true/false)',
      'GET /api/todos/:id': 'Get a specific todo',
      'POST /api/todos': 'Create a new todo (body: {title, description?, completed?})',
      'PUT /api/todos/:id': 'Update a todo (body: {title?, description?, completed?})',
      'PATCH /api/todos/:id': 'Partially update a todo (body: {title?, description?, completed?})',
      'DELETE /api/todos/:id': 'Delete a specific todo',
      'DELETE /api/todos': 'Delete all todos'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Todo API server is running on http://localhost:${PORT}`);
  console.log(`Web Interface: http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api`);
});

// Made with Bob
