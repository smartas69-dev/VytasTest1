# TaskManager2 - Node.js CRUD Application

A full-stack task management application with RESTful API and web interface, built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- ✅ Create, Read, Update, and Delete tasks
- ✅ Task status tracking (pending, in-progress, completed)
- ✅ Priority levels (low, medium, high)
- ✅ Due date management
- ✅ MongoDB database integration
- ✅ Modern web interface with responsive design
- ✅ Real-time search and filtering
- ✅ Error handling middleware
- ✅ CORS enabled
- ✅ Environment variable configuration

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. Clone or navigate to the project directory:
```bash
cd taskmanager2
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Update the `.env` file with your MongoDB connection string
   - Default configuration uses local MongoDB: `mongodb://localhost:27017/taskmanager2`
   - For MongoDB Atlas, uncomment and update the connection string in `.env`

4. Make sure MongoDB is running (if using local installation):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

## Running the Application

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001` (or the PORT specified in .env)

## Accessing the Application

### Web Interface
Open your browser and navigate to:
```
http://localhost:3001
```

The web interface provides:
- ✨ Modern, responsive design with gradient backgrounds
- 📝 Easy-to-use forms for adding and editing tasks
- 🔍 Real-time search functionality
- 🎯 Filter by status and priority
- 📱 Mobile-friendly responsive layout
- 🎨 Color-coded priority indicators
- ⚡ Instant updates without page refresh

### API Endpoints

### Base URL
```
http://localhost:3000
```

### Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get a single task by ID |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task by ID |
| DELETE | `/api/tasks/:id` | Delete a task by ID |

## API Usage Examples

### 1. Get All Tasks
```bash
GET http://localhost:3000/api/tasks
```

Response:
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### 2. Get Single Task
```bash
GET http://localhost:3000/api/tasks/:id
```

### 3. Create New Task
```bash
POST http://localhost:3000/api/tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-05-20"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-05-20T00:00:00.000Z",
    "completed": false,
    "createdAt": "2026-05-13T07:39:00.000Z",
    "updatedAt": "2026-05-13T07:39:00.000Z"
  }
}
```

### 4. Update Task
```bash
PUT http://localhost:3000/api/tasks/:id
Content-Type: application/json

{
  "status": "completed",
  "completed": true
}
```

### 5. Delete Task
```bash
DELETE http://localhost:3000/api/tasks/:id
```

## Task Schema

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| title | String | Yes | - | Task title (max 100 chars) |
| description | String | No | - | Task description (max 500 chars) |
| status | String | No | 'pending' | Task status: pending, in-progress, completed |
| priority | String | No | 'medium' | Priority level: low, medium, high |
| dueDate | Date | No | - | Task due date |
| completed | Boolean | No | false | Completion status |
| createdAt | Date | Auto | - | Creation timestamp |
| updatedAt | Date | Auto | - | Last update timestamp |

## Project Structure

```
taskmanager2/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── taskController.js    # Task CRUD operations
├── middleware/
│   └── errorHandler.js      # Error handling middleware
├── models/
│   └── Task.js              # Task schema/model
├── public/                  # Frontend files
│   ├── index.html          # Main HTML page
│   ├── styles.css          # CSS styling
│   └── app.js              # Frontend JavaScript
├── routes/
│   └── taskRoutes.js        # API routes
├── .env                     # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
├── README.md               # Project documentation
└── server.js               # Application entry point
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Validation errors or invalid data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server errors

Error Response Format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Testing with cURL

### Create a task:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Testing the API","priority":"high"}'
```

### Get all tasks:
```bash
curl http://localhost:3000/api/tasks
```

### Update a task:
```bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

### Delete a task:
```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID
```

## Testing with Postman

1. Import the API endpoints into Postman
2. Set the base URL to `http://localhost:3000`
3. Use the endpoints listed above
4. Set Content-Type header to `application/json` for POST/PUT requests

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment mode | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/taskmanager2 |

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB object modeling
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing
- **nodemon**: Development auto-restart (dev dependency)

## License

ISC

## Author

Your Name

## Contributing

Feel free to submit issues and enhancement requests!