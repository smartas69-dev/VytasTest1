# Todo API - Node.js In-Memory CRUD RESTful Application

A simple RESTful API for managing todos using Node.js and Express with an in-memory database.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ In-memory database (no external database required)
- ✅ RESTful API design
- ✅ Input validation
- ✅ Error handling
- ✅ Filter todos by completion status
- ✅ Timestamps for creation and updates

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Root Endpoint
- **GET** `/` - Get API documentation

### Todo Endpoints

#### Create a Todo
- **POST** `/api/todos`
- **Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false
}
```
- **Response:** `201 Created`
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "createdAt": "2026-05-06T11:25:00.000Z",
  "updatedAt": "2026-05-06T11:25:00.000Z"
}
```

#### Get All Todos
- **GET** `/api/todos`
- **Optional Query Parameters:**
  - `completed=true` - Get only completed todos
  - `completed=false` - Get only incomplete todos
- **Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "createdAt": "2026-05-06T11:25:00.000Z",
    "updatedAt": "2026-05-06T11:25:00.000Z"
  }
]
```

#### Get a Single Todo
- **GET** `/api/todos/:id`
- **Response:** `200 OK` or `404 Not Found`
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "createdAt": "2026-05-06T11:25:00.000Z",
  "updatedAt": "2026-05-06T11:25:00.000Z"
}
```

#### Update a Todo (Full Update)
- **PUT** `/api/todos/:id`
- **Body:**
```json
{
  "title": "Buy groceries and cook",
  "description": "Milk, eggs, bread, vegetables",
  "completed": true
}
```
- **Response:** `200 OK` or `404 Not Found`

#### Update a Todo (Partial Update)
- **PATCH** `/api/todos/:id`
- **Body:** (any combination of fields)
```json
{
  "completed": true
}
```
- **Response:** `200 OK` or `404 Not Found`

#### Delete a Todo
- **DELETE** `/api/todos/:id`
- **Response:** `200 OK` or `404 Not Found`
```json
{
  "message": "Todo deleted successfully",
  "todo": {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "createdAt": "2026-05-06T11:25:00.000Z",
    "updatedAt": "2026-05-06T11:25:00.000Z"
  }
}
```

#### Delete All Todos
- **DELETE** `/api/todos`
- **Response:** `200 OK`
```json
{
  "message": "All todos deleted successfully",
  "count": 5
}
```

## Testing with cURL

### Create a todo:
```bash
curl -X POST http://localhost:3000/api/todos -H "Content-Type: application/json" -d "{\"title\":\"Buy groceries\",\"description\":\"Milk, eggs, bread\"}"
```

### Get all todos:
```bash
curl http://localhost:3000/api/todos
```

### Get a specific todo:
```bash
curl http://localhost:3000/api/todos/1
```

### Update a todo:
```bash
curl -X PUT http://localhost:3000/api/todos/1 -H "Content-Type: application/json" -d "{\"title\":\"Buy groceries\",\"completed\":true}"
```

### Partially update a todo:
```bash
curl -X PATCH http://localhost:3000/api/todos/1 -H "Content-Type: application/json" -d "{\"completed\":true}"
```

### Delete a todo:
```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

### Get completed todos only:
```bash
curl http://localhost:3000/api/todos?completed=true
```

## Testing with Postman

1. Import the endpoints into Postman
2. Set the base URL to `http://localhost:3000`
3. Use the endpoints listed above
4. Set `Content-Type: application/json` header for POST, PUT, and PATCH requests

## Data Structure

Each todo item has the following structure:

```typescript
{
  id: number,           // Auto-generated unique identifier
  title: string,        // Required, cannot be empty
  description: string,  // Optional
  completed: boolean,   // Default: false
  createdAt: string,    // ISO 8601 timestamp
  updatedAt: string     // ISO 8601 timestamp
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful GET, PUT, PATCH, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input (e.g., empty title)
- `404 Not Found` - Todo not found or endpoint not found
- `500 Internal Server Error` - Server error

Error responses include a JSON object with an `error` field:
```json
{
  "error": "Todo not found"
}
```

## Notes

- This is an in-memory database, so all data will be lost when the server restarts
- The ID counter starts at 1 and increments for each new todo
- All timestamps are in ISO 8601 format (UTC)
- Title field is required and cannot be empty
- Description field is optional

## License

ISC