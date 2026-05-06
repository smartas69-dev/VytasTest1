// Simple test script for TaskManager API
const http = require('http');

const BASE_URL = 'http://localhost:3000';
let testsPassed = 0;
let testsFailed = 0;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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

// Test function
async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
  }
}

// Run tests
async function runTests() {
  console.log('\n🧪 Running TaskManager API Tests...\n');

  // Test 1: Create a task
  let taskId;
  await test('Create a new task', async () => {
    const response = await makeRequest('POST', '/tasks', {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'pending'
    });
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    if (!response.data.id) throw new Error('Task ID not returned');
    taskId = response.data.id;
  });

  // Test 2: Get all tasks
  await test('Get all tasks', async () => {
    const response = await makeRequest('GET', '/tasks');
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!Array.isArray(response.data)) throw new Error('Response is not an array');
    if (response.data.length === 0) throw new Error('No tasks returned');
  });

  // Test 3: Get task by ID
  await test('Get task by ID', async () => {
    const response = await makeRequest('GET', `/tasks/${taskId}`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.id !== taskId) throw new Error('Wrong task returned');
  });

  // Test 4: Update task (PUT)
  await test('Update task with PUT', async () => {
    const response = await makeRequest('PUT', `/tasks/${taskId}`, {
      title: 'Updated Task',
      description: 'Updated description',
      status: 'in-progress'
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.status !== 'in-progress') throw new Error('Status not updated');
  });

  // Test 5: Partial update (PATCH)
  await test('Partial update with PATCH', async () => {
    const response = await makeRequest('PATCH', `/tasks/${taskId}`, {
      status: 'completed'
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.status !== 'completed') throw new Error('Status not updated');
  });

  // Test 6: Filter by status
  await test('Filter tasks by status', async () => {
    const response = await makeRequest('GET', '/tasks?status=completed');
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!Array.isArray(response.data)) throw new Error('Response is not an array');
  });

  // Test 7: Validation - empty title
  await test('Validation: Reject empty title', async () => {
    const response = await makeRequest('POST', '/tasks', {
      title: '',
      description: 'Test'
    });
    if (response.status !== 400) throw new Error(`Expected 400, got ${response.status}`);
  });

  // Test 8: Validation - invalid status
  await test('Validation: Reject invalid status', async () => {
    const response = await makeRequest('POST', '/tasks', {
      title: 'Test',
      status: 'invalid-status'
    });
    if (response.status !== 400) throw new Error(`Expected 400, got ${response.status}`);
  });

  // Test 9: Delete task
  await test('Delete task by ID', async () => {
    const response = await makeRequest('DELETE', `/tasks/${taskId}`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test 10: Get deleted task (should fail)
  await test('Verify task is deleted', async () => {
    const response = await makeRequest('GET', `/tasks/${taskId}`);
    if (response.status !== 404) throw new Error(`Expected 404, got ${response.status}`);
  });

  // Test 11: Create multiple tasks and delete all
  await test('Delete all tasks', async () => {
    await makeRequest('POST', '/tasks', { title: 'Task 1' });
    await makeRequest('POST', '/tasks', { title: 'Task 2' });
    const response = await makeRequest('DELETE', '/tasks');
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    
    const getTasks = await makeRequest('GET', '/tasks');
    if (getTasks.data.length !== 0) throw new Error('Tasks not deleted');
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log('='.repeat(50) + '\n');

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Wait for server to be ready
setTimeout(() => {
  runTests().catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}, 1000);

// Made with Bob
