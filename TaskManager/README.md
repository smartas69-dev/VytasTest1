# TaskManager Application

A full-stack in-memory CRUD (Create, Read, Update, Delete) TaskManager application built with Node.js, Express, and vanilla JavaScript.

## Features

- ✅ **Web Interface** - Beautiful, responsive UI for managing tasks
- ✅ **Real-time Statistics** - Track total, pending, in-progress, and completed tasks
- ✅ **Filter Tasks** - View tasks by status (all, pending, in-progress, completed)
- ✅ **Create Tasks** - Add new tasks with title, description, and status
- ✅ **Edit Tasks** - Update existing tasks inline
- ✅ **Delete Tasks** - Remove tasks individually
- ✅ **RESTful API** - Full CRUD API endpoints
- ✅ **Input Validation** - Client and server-side validation
- ✅ **In-memory Storage** - No database required
- ✅ **Responsive Design** - Works on desktop and mobile devices

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
npm start
```

3. **Access the application:**
   - **Web Interface:** Open your browser and navigate to `http://localhost:3000`
   - **API Endpoint:** `http://localhost:3000/tasks`

## Using the Web Interface

The web application provides an intuitive interface for managing tasks:

1. **Dashboard** - View statistics showing total tasks and breakdown by status
2. **Add Task** - Fill in the form on the left to create a new task
3. **Filter Tasks** - Click filter buttons to view tasks by status
4. **Edit Task** - Click "Edit" button on any task to modify it
5. **Delete Task** - Click "Delete" button to remove a task
6. **Real-time Updates** - All changes are reflected immediately

### Web Interface Features:
- 📊 Real-time statistics dashboard
- 🎨 Beautiful gradient design with smooth animations
- 📱 Fully responsive (works on mobile and desktop)
- 🔍 Filter tasks by status
- ✏️ Inline editing
- 🔔 Success/error notifications
- 🎯 Color-coded task status

## API Endpoints

### Root
- **GET** `/` - API documentation

### Create Task
- **POST** `/tasks`
- **Body:**
```json
{
  "title": "Task title (required)",
  "description": "Task description (optional)",
  "status": "pending|in-progress|completed (optional, default: pending)"
}
```
- **Response:** Created task with ID and timestamps

### Get All Tasks
- **GET** `/tasks`
- **Query Parameters:**
  - `status` (optional): Filter by status (pending, in-progress, completed)
- **Response:** Array of tasks

### Get Task by ID
- **GET** `/tasks/:id`
- **Response:** Single task object

### Update Task (Full Update)
- **PUT** `/tasks/:id`
- **Body:** Same as POST (all fields required)
- **Response:** Updated task

### Update Task (Partial Update)
- **PATCH** `/tasks/:id`
- **Body:** Any combination of title, description, or status
- **Response:** Updated task

### Delete Task
- **DELETE** `/tasks/:id`
- **Response:** Confirmation message with deleted task

### Delete All Tasks
- **DELETE** `/tasks`
- **Response:** Confirmation message with count

## Task Object Structure

```json
{
  "id": 1,
  "title": "Complete project",
  "description": "Finish the TaskManager API",
  "status": "in-progress",
  "createdAt": "2026-05-06T18:43:00.000Z",
  "updatedAt": "2026-05-06T18:43:00.000Z"
}
```

## Usage Examples

### Using cURL

**Create a task:**
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Buy groceries\",\"description\":\"Milk, eggs, bread\",\"status\":\"pending\"}"
```

**Get all tasks:**
```bash
curl http://localhost:3000/tasks
```

**Get tasks by status:**
```bash
curl http://localhost:3000/tasks?status=pending
```

**Get a specific task:**
```bash
curl http://localhost:3000/tasks/1
```

**Update a task (full):**
```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Buy groceries\",\"description\":\"Milk, eggs, bread, cheese\",\"status\":\"completed\"}"
```

**Update a task (partial):**
```bash
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"completed\"}"
```

**Delete a task:**
```bash
curl -X DELETE http://localhost:3000/tasks/1
```

**Delete all tasks:**
```bash
curl -X DELETE http://localhost:3000/tasks
```

### Using PowerShell

**Create a task:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/tasks -Method Post -ContentType "application/json" -Body '{"title":"Buy groceries","description":"Milk, eggs, bread","status":"pending"}'
```

**Get all tasks:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/tasks -Method Get
```

**Get a specific task:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/tasks/1 -Method Get
```

**Update a task:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/tasks/1 -Method Patch -ContentType "application/json" -Body '{"status":"completed"}'
```

**Delete a task:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/tasks/1 -Method Delete
```

## Validation Rules

- **Title:** Required, must be a non-empty string
- **Description:** Optional, must be a string if provided
- **Status:** Optional, must be one of: `pending`, `in-progress`, `completed`

## Error Responses

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

## Notes

- Data is stored in memory and will be lost when the server restarts
- Task IDs are auto-incremented integers
- All timestamps are in ISO 8601 format (UTC)
- The server runs on port 3000 by default

## License

ISC