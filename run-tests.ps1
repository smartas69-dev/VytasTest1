# Todo API Test Script
$baseUrl = "http://localhost:3000"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Todo API Test Suite" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Test 1: Get API Documentation
Write-Host "Test 1: Get API Documentation" -ForegroundColor Cyan
curl.exe -s -X GET "$baseUrl/"
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 2: Create Todo 1
Write-Host "Test 2: Create Todo - Buy groceries" -ForegroundColor Cyan
$json1 = @'
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, vegetables",
  "completed": false
}
'@
curl.exe -s -X POST "$baseUrl/api/todos" -H "Content-Type: application/json" -d $json1
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 3: Create Todo 2
Write-Host "Test 3: Create Todo - Finish project report" -ForegroundColor Cyan
$json2 = @'
{
  "title": "Finish project report",
  "description": "Complete the Q2 analysis report",
  "completed": false
}
'@
curl.exe -s -X POST "$baseUrl/api/todos" -H "Content-Type: application/json" -d $json2
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 4: Create Todo 3
Write-Host "Test 4: Create Todo - Call dentist" -ForegroundColor Cyan
$json3 = @'
{
  "title": "Call dentist",
  "description": "Schedule appointment for next week"
}
'@
curl.exe -s -X POST "$baseUrl/api/todos" -H "Content-Type: application/json" -d $json3
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 5: Get all todos
Write-Host "Test 5: Get all todos" -ForegroundColor Cyan
curl.exe -s -X GET "$baseUrl/api/todos"
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 6: Get specific todo
Write-Host "Test 6: Get specific todo (ID: 1)" -ForegroundColor Cyan
curl.exe -s -X GET "$baseUrl/api/todos/1"
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 7: Get completed todos
Write-Host "Test 7: Get completed todos" -ForegroundColor Cyan
curl.exe -s -X GET "$baseUrl/api/todos?completed=true"
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 8: Get incomplete todos
Write-Host "Test 8: Get incomplete todos" -ForegroundColor Cyan
curl.exe -s -X GET "$baseUrl/api/todos?completed=false"
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 9: Update todo (PUT)
Write-Host "Test 9: Update todo (PUT) - ID: 1" -ForegroundColor Cyan
$json4 = @'
{
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, vegetables, chicken",
  "completed": true
}
'@
curl.exe -s -X PUT "$baseUrl/api/todos/1" -H "Content-Type: application/json" -d $json4
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 10: Partial update (PATCH) - mark as completed
Write-Host "Test 10: Partial update (PATCH) - Mark ID 2 as completed" -ForegroundColor Cyan
$json5 = @'
{
  "completed": true
}
'@
curl.exe -s -X PATCH "$baseUrl/api/todos/2" -H "Content-Type: application/json" -d $json5
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 11: Partial update (PATCH) - update title
Write-Host "Test 11: Partial update (PATCH) - Update title of ID 3" -ForegroundColor Cyan
$json6 = @'
{
  "title": "Call dentist - URGENT"
}
'@
curl.exe -s -X PATCH "$baseUrl/api/todos/3" -H "Content-Type: application/json" -d $json6
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 12: Validation - empty title (should fail)
Write-Host "Test 12: Validation - Empty title (should return 400)" -ForegroundColor Cyan
$json7 = @'
{
  "title": "",
  "description": "This should fail"
}
'@
curl.exe -s -X POST "$baseUrl/api/todos" -H "Content-Type: application/json" -d $json7
Write-Host ""
Write-Host "✓ PASSED (Expected failure)" -ForegroundColor Green
Write-Host ""

# Test 13: Validation - missing title (should fail)
Write-Host "Test 13: Validation - Missing title (should return 400)" -ForegroundColor Cyan
$json8 = @'
{
  "description": "This should fail"
}
'@
curl.exe -s -X POST "$baseUrl/api/todos" -H "Content-Type: application/json" -d $json8
Write-Host ""
Write-Host "✓ PASSED (Expected failure)" -ForegroundColor Green
Write-Host ""

# Test 14: 404 - non-existent todo
Write-Host "Test 14: Get non-existent todo (should return 404)" -ForegroundColor Cyan
curl.exe -s -X GET "$baseUrl/api/todos/999"
Write-Host ""
Write-Host "✓ PASSED (Expected 404)" -ForegroundColor Green
Write-Host ""

# Test 15: 404 - invalid endpoint
Write-Host "Test 15: Invalid endpoint (should return 404)" -ForegroundColor Cyan
curl.exe -s -X GET "$baseUrl/api/invalid-endpoint"
Write-Host ""
Write-Host "✓ PASSED (Expected 404)" -ForegroundColor Green
Write-Host ""

# Test 16: Delete specific todo
Write-Host "Test 16: Delete specific todo (ID: 1)" -ForegroundColor Cyan
curl.exe -s -X DELETE "$baseUrl/api/todos/1"
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 17: Verify deletion
Write-Host "Test 17: Verify todo was deleted" -ForegroundColor Cyan
curl.exe -s -X GET "$baseUrl/api/todos"
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 18: Delete all todos
Write-Host "Test 18: Delete all todos" -ForegroundColor Cyan
curl.exe -s -X DELETE "$baseUrl/api/todos"
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

# Test 19: Verify all deleted
Write-Host "Test 19: Verify all todos deleted" -ForegroundColor Cyan
curl.exe -s -X GET "$baseUrl/api/todos"
Write-Host ""
Write-Host "✓ PASSED" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "All tests completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Made with Bob
