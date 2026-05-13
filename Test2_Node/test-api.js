const http = require('http');

const BASE_URL = 'http://localhost:3001';
let createdTaskId = null;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testGetAllTasks() {
  console.log('\n📋 TEST 1: GET /api/tasks - Get all tasks');
  try {
    const response = await makeRequest('GET', '/api/tasks');
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Response:`, JSON.stringify(response.body, null, 2));
    return response.statusCode === 200;
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return false;
  }
}

async function testCreateTask() {
  console.log('\n📝 TEST 2: POST /api/tasks - Create a new task');
  const newTask = {
    title: 'Test Task from API Test',
    description: 'This is a test task created by the automated test script',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-05-20'
  };
  
  try {
    const response = await makeRequest('POST', '/api/tasks', newTask);
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Response:`, JSON.stringify(response.body, null, 2));
    
    if (response.body && response.body.data && response.body.data._id) {
      createdTaskId = response.body.data._id;
      console.log(`💾 Saved Task ID: ${createdTaskId}`);
    }
    
    return response.statusCode === 201;
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return false;
  }
}

async function testGetSingleTask() {
  if (!createdTaskId) {
    console.log('\n⚠️  TEST 3: SKIPPED - No task ID available');
    return false;
  }
  
  console.log(`\n🔍 TEST 3: GET /api/tasks/${createdTaskId} - Get single task`);
  try {
    const response = await makeRequest('GET', `/api/tasks/${createdTaskId}`);
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Response:`, JSON.stringify(response.body, null, 2));
    return response.statusCode === 200;
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return false;
  }
}

async function testUpdateTask() {
  if (!createdTaskId) {
    console.log('\n⚠️  TEST 4: SKIPPED - No task ID available');
    return false;
  }
  
  console.log(`\n✏️  TEST 4: PUT /api/tasks/${createdTaskId} - Update task`);
  const updateData = {
    status: 'in-progress',
    priority: 'medium'
  };
  
  try {
    const response = await makeRequest('PUT', `/api/tasks/${createdTaskId}`, updateData);
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Response:`, JSON.stringify(response.body, null, 2));
    return response.statusCode === 200;
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return false;
  }
}

async function testDeleteTask() {
  if (!createdTaskId) {
    console.log('\n⚠️  TEST 5: SKIPPED - No task ID available');
    return false;
  }
  
  console.log(`\n🗑️  TEST 5: DELETE /api/tasks/${createdTaskId} - Delete task`);
  try {
    const response = await makeRequest('DELETE', `/api/tasks/${createdTaskId}`);
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Response:`, JSON.stringify(response.body, null, 2));
    return response.statusCode === 200;
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return false;
  }
}

async function testInvalidTaskId() {
  console.log('\n🚫 TEST 6: GET /api/tasks/invalid-id - Test error handling');
  try {
    const response = await makeRequest('GET', '/api/tasks/invalid-id-12345');
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Response:`, JSON.stringify(response.body, null, 2));
    return response.statusCode === 400 || response.statusCode === 404 || response.statusCode === 500;
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return false;
  }
}

async function testCreateInvalidTask() {
  console.log('\n❌ TEST 7: POST /api/tasks - Create task without required fields');
  const invalidTask = {
    description: 'Task without title'
  };
  
  try {
    const response = await makeRequest('POST', '/api/tasks', invalidTask);
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Response:`, JSON.stringify(response.body, null, 2));
    return response.statusCode === 400;
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Tests for TaskManager2');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  results.push({ name: 'Get All Tasks', passed: await testGetAllTasks() });
  results.push({ name: 'Create Task', passed: await testCreateTask() });
  results.push({ name: 'Get Single Task', passed: await testGetSingleTask() });
  results.push({ name: 'Update Task', passed: await testUpdateTask() });
  results.push({ name: 'Delete Task', passed: await testDeleteTask() });
  results.push({ name: 'Invalid Task ID', passed: await testInvalidTaskId() });
  results.push({ name: 'Invalid Task Data', passed: await testCreateInvalidTask() });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${index + 1}. ${result.name}: ${status}`);
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 Results: ${passedCount}/${totalCount} tests passed`);
  console.log('='.repeat(60));
  
  process.exit(passedCount === totalCount ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});

// Made with Bob
