@echo off
echo.
echo ========================================
echo Todo API Test Suite
echo ========================================
echo.

set BASE_URL=http://localhost:3000

echo Test 1: Get API Documentation
curl -s -X GET %BASE_URL%/
echo.
echo.

echo Test 2: Create Todo - Buy groceries
curl -s -X POST %BASE_URL%/api/todos -H "Content-Type: application/json" -d "{\"title\":\"Buy groceries\",\"description\":\"Milk, eggs, bread, vegetables\",\"completed\":false}"
echo.
echo.

echo Test 3: Create Todo - Finish project report
curl -s -X POST %BASE_URL%/api/todos -H "Content-Type: application/json" -d "{\"title\":\"Finish project report\",\"description\":\"Complete the Q2 analysis report\",\"completed\":false}"
echo.
echo.

echo Test 4: Create Todo - Call dentist
curl -s -X POST %BASE_URL%/api/todos -H "Content-Type: application/json" -d "{\"title\":\"Call dentist\",\"description\":\"Schedule appointment for next week\"}"
echo.
echo.

echo Test 5: Get all todos
curl -s -X GET %BASE_URL%/api/todos
echo.
echo.

echo Test 6: Get specific todo (ID: 1)
curl -s -X GET %BASE_URL%/api/todos/1
echo.
echo.

echo Test 7: Get completed todos
curl -s -X GET "%BASE_URL%/api/todos?completed=true"
echo.
echo.

echo Test 8: Get incomplete todos
curl -s -X GET "%BASE_URL%/api/todos?completed=false"
echo.
echo.

echo Test 9: Update todo (PUT) - ID: 1
curl -s -X PUT %BASE_URL%/api/todos/1 -H "Content-Type: application/json" -d "{\"title\":\"Buy groceries and cook dinner\",\"description\":\"Milk, eggs, bread, vegetables, chicken\",\"completed\":true}"
echo.
echo.

echo Test 10: Partial update (PATCH) - Mark ID 2 as completed
curl -s -X PATCH %BASE_URL%/api/todos/2 -H "Content-Type: application/json" -d "{\"completed\":true}"
echo.
echo.

echo Test 11: Partial update (PATCH) - Update title of ID 3
curl -s -X PATCH %BASE_URL%/api/todos/3 -H "Content-Type: application/json" -d "{\"title\":\"Call dentist - URGENT\"}"
echo.
echo.

echo Test 12: Validation - Empty title (should return 400)
curl -s -X POST %BASE_URL%/api/todos -H "Content-Type: application/json" -d "{\"title\":\"\",\"description\":\"This should fail\"}"
echo.
echo.

echo Test 13: Validation - Missing title (should return 400)
curl -s -X POST %BASE_URL%/api/todos -H "Content-Type: application/json" -d "{\"description\":\"This should fail\"}"
echo.
echo.

echo Test 14: Get non-existent todo (should return 404)
curl -s -X GET %BASE_URL%/api/todos/999
echo.
echo.

echo Test 15: Invalid endpoint (should return 404)
curl -s -X GET %BASE_URL%/api/invalid-endpoint
echo.
echo.

echo Test 16: Delete specific todo (ID: 1)
curl -s -X DELETE %BASE_URL%/api/todos/1
echo.
echo.

echo Test 17: Verify todo was deleted
curl -s -X GET %BASE_URL%/api/todos
echo.
echo.

echo Test 18: Delete all todos
curl -s -X DELETE %BASE_URL%/api/todos
echo.
echo.

echo Test 19: Verify all todos deleted
curl -s -X GET %BASE_URL%/api/todos
echo.
echo.

echo ========================================
echo All tests completed!
echo ========================================
echo.

@REM Made with Bob
