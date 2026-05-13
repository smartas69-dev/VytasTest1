// API Base URL
const API_URL = 'http://localhost:3001/api/tasks';

// State
let allTasks = [];
let editingTaskId = null;

// DOM Elements
const taskForm = document.getElementById('taskForm');
const editTaskForm = document.getElementById('editTaskForm');
const tasksContainer = document.getElementById('tasksContainer');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const refreshBtn = document.getElementById('refreshBtn');
const editModal = document.getElementById('editModal');
const closeModal = document.querySelector('.close');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    taskForm.addEventListener('submit', handleAddTask);
    editTaskForm.addEventListener('submit', handleUpdateTask);
    searchInput.addEventListener('input', filterTasks);
    filterStatus.addEventListener('change', filterTasks);
    filterPriority.addEventListener('change', filterTasks);
    refreshBtn.addEventListener('click', loadTasks);
    closeModal.addEventListener('click', closeEditModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// Load all tasks
async function loadTasks() {
    try {
        showLoading();
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.success) {
            allTasks = result.data;
            filterTasks();
            showMessage('Tasks loaded successfully', 'success');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showError('Failed to load tasks. Make sure the server is running.');
        tasksContainer.innerHTML = '<div class="empty-state">Failed to load tasks. Please check if the server is running.</div>';
    }
}

// Add new task
async function handleAddTask(e) {
    e.preventDefault();
    
    const formData = new FormData(taskForm);
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        dueDate: formData.get('dueDate') || undefined,
        assignedTo: formData.get('assignedTo') || undefined
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Task added successfully!', 'success');
            taskForm.reset();
            loadTasks();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showError('Failed to add task: ' + error.message);
    }
}

// Update task
async function handleUpdateTask(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('editTaskId').value;
    const formData = new FormData(editTaskForm);
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        dueDate: formData.get('dueDate') || undefined,
        assignedTo: formData.get('assignedTo') || undefined
    };
    
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Task updated successfully!', 'success');
            closeEditModal();
            loadTasks();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Failed to update task: ' + error.message);
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Task deleted successfully!', 'success');
            loadTasks();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showError('Failed to delete task: ' + error.message);
    }
}

// Open edit modal
function openEditModal(task) {
    editingTaskId = task._id;
    document.getElementById('editTaskId').value = task._id;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editDescription').value = task.description || '';
    document.getElementById('editStatus').value = task.status;
    document.getElementById('editPriority').value = task.priority;
    document.getElementById('editAssignedTo').value = task.assignedTo || '';
    
    if (task.dueDate) {
        const date = new Date(task.dueDate);
        document.getElementById('editDueDate').value = date.toISOString().split('T')[0];
    } else {
        document.getElementById('editDueDate').value = '';
    }
    
    editModal.style.display = 'block';
}

// Close edit modal
function closeEditModal() {
    editModal.style.display = 'none';
    editingTaskId = null;
    editTaskForm.reset();
}

// Filter tasks
function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    const priorityFilter = filterPriority.value;
    
    let filteredTasks = allTasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                            (task.description && task.description.toLowerCase().includes(searchTerm));
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });
    
    displayTasks(filteredTasks);
}

// Display tasks
function displayTasks(tasks) {
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<div class="empty-state">No tasks found. Add your first task!</div>';
        return;
    }
    
    tasksContainer.innerHTML = tasks.map(task => createTaskCard(task)).join('');
}

// Create task card HTML
function createTaskCard(task) {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
    const createdDate = new Date(task.createdAt).toLocaleDateString();
    const assignedTo = task.assignedTo ? task.assignedTo : 'Unassigned';
    
    return `
        <div class="task-card priority-${task.priority}">
            <div class="task-header">
                <div>
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <div class="task-badges">
                        <span class="badge badge-status ${task.status}">${task.status}</span>
                        <span class="badge badge-priority ${task.priority}">${task.priority}</span>
                    </div>
                </div>
            </div>
            
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            
            <div class="task-meta">
                <div>👤 Assigned: ${escapeHtml(assignedTo)}</div>
                <div>📅 Due: ${dueDate}</div>
                <div>🕒 Created: ${createdDate}</div>
            </div>
            
            <div class="task-actions">
                <button class="btn btn-edit" onclick='openEditModal(${JSON.stringify(task).replace(/'/g, "'")})'>
                    ✏️ Edit
                </button>
                <button class="btn btn-danger" onclick="deleteTask('${task._id}')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `;
}

// Utility functions
function showLoading() {
    tasksContainer.innerHTML = '<div class="loading">Loading tasks...</div>';
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function showError(message) {
    showMessage(message, 'error');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally accessible
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.deleteTask = deleteTask;

// Made with Bob
