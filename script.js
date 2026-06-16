// API Configuration
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const todoTitle = document.getElementById('todoTitle');
const todoDescription = document.getElementById('todoDescription');
const todoPriority = document.getElementById('todoPriority');
const todoDueDate = document.getElementById('todoDueDate');
const addBtn = document.getElementById('addBtn');
const todosList = document.getElementById('todosList');
const clearBtn = document.getElementById('clearBtn');
const todoCount = document.getElementById('todoCount');
const filterBtns = document.querySelectorAll('.filter-btn');
const userDisplay = document.getElementById('userDisplay');
const logoutBtn = document.getElementById('logoutBtn');

// State
let todos = [];
let currentFilter = 'all';
let editingId = null;
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
        // Redirect to login page
        window.location.href = '/login.html';
        return;
    }

    // Load user info
    loadUserInfo();
    loadTodos();
    setupEventListeners();
});

// Load user information
function loadUserInfo() {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const userId = localStorage.getItem('userId');

    if (username) {
        userDisplay.textContent = `👤 ${username}`;
        currentUser = { id: userId, username, email };
    }
}

// Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    clearBtn.addEventListener('click', clearAllTodos);
    logoutBtn.addEventListener('click', logout);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTodos();
        });
    });

    // Allow adding todo with Enter key
    todoTitle.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        window.location.href = '/login.html';
    }
}

// Get headers with user ID
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'user-id': localStorage.getItem('userId')
    };
    return headers;
}

// Load todos from server
async function loadTodos() {
    try {
        const response = await fetch(`${API_URL}/todos`, {
            headers: getHeaders()
        });
        
        if (response.status === 401) {
            logout();
            return;
        }

        const result = await response.json();

        if (result.success) {
            todos = result.data;
            renderTodos();
        }
    } catch (error) {
        console.error('Error loading todos:', error);
        showNotification('Error loading todos', 'error');
    }
}

// Add new todo
async function addTodo() {
    const title = todoTitle.value.trim();
    const description = todoDescription.value.trim();
    const priority = todoPriority.value;
    const dueDate = todoDueDate.value;

    if (!title) {
        showNotification('Please enter a todo title', 'error');
        todoTitle.focus();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                title,
                description,
                priority,
                dueDate: dueDate || null
            })
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const result = await response.json();

        if (result.success) {
            todoTitle.value = '';
            todoDescription.value = '';
            todoPriority.value = 'medium';
            todoDueDate.value = '';
            showNotification('Todo added successfully', 'success');
            loadTodos();
        } else {
            showNotification(result.error || 'Error adding todo', 'error');
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        showNotification('Error adding todo', 'error');
    }
}

// Toggle todo completion
async function toggleTodo(id, currentStatus) {
    try {
        const response = await fetch(`${API_URL}/todos/${id}/toggle`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({
                completed: !currentStatus
            })
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const result = await response.json();

        if (result.success) {
            loadTodos();
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
        showNotification('Error updating todo', 'error');
    }
}

// Edit todo
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Create and show edit modal
    const modal = createEditModal(todo);
    document.body.appendChild(modal);
    modal.classList.add('active');

    // Setup modal event listeners
    const saveBtn = modal.querySelector('.modal-save');
    const cancelBtn = modal.querySelector('.modal-cancel');

    saveBtn.addEventListener('click', async () => {
        const newTitle = modal.querySelector('#editTitle').value.trim();
        const newDescription = modal.querySelector('#editDescription').value.trim();
        const newPriority = modal.querySelector('#editPriority').value;
        const newDueDate = modal.querySelector('#editDueDate').value;

        if (!newTitle) {
            showNotification('Title cannot be empty', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/todos/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({
                    title: newTitle,
                    description: newDescription,
                    priority: newPriority,
                    dueDate: newDueDate || null
                })
            });

            if (response.status === 401) {
                logout();
                return;
            }

            const result = await response.json();

            if (result.success) {
                modal.remove();
                showNotification('Todo updated successfully', 'success');
                loadTodos();
            }
        } catch (error) {
            console.error('Error updating todo:', error);
            showNotification('Error updating todo', 'error');
        }
    });

    cancelBtn.addEventListener('click', () => {
        modal.remove();
    });

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const result = await response.json();

        if (result.success) {
            showNotification('Todo deleted successfully', 'success');
            loadTodos();
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        showNotification('Error deleting todo', 'error');
    }
}

// Clear all todos
async function clearAllTodos() {
    if (!confirm('Are you sure you want to delete ALL todos? This cannot be undone.')) return;

    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const result = await response.json();

        if (result.success) {
            showNotification('All todos cleared', 'success');
            loadTodos();
        }
    } catch (error) {
        console.error('Error clearing todos:', error);
        showNotification('Error clearing todos', 'error');
    }
}

// Render todos
function renderTodos() {
    // Filter todos based on current filter
    let filteredTodos = todos;

    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    // Update counter
    updateCounter();

    // Render empty state or todos
    if (filteredTodos.length === 0) {
        if (currentFilter === 'all' && todos.length === 0) {
            todosList.innerHTML = '<div class="empty-state"><p>✨ No todos yet. Add one to get started!</p></div>';
        } else {
            todosList.innerHTML = `<div class="empty-state"><p>No ${currentFilter} todos</p></div>`;
        }
        return;
    }

    todosList.innerHTML = filteredTodos.map(todo => createTodoElement(todo)).join('');

    // Add event listeners to dynamically created elements
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = parseInt(e.target.dataset.id);
            const todo = todos.find(t => t.id === id);
            toggleTodo(id, todo.completed);
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            editTodo(id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteTodo(id);
        });
    });
}

// Create todo element HTML
function createTodoElement(todo) {
    const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : null;
    const completed = todo.completed ? 'checked' : '';

    return `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                data-id="${todo.id}"
                ${completed}
            >
            <div class="todo-content">
                <div class="todo-text">${escapeHtml(todo.title)}</div>
                ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                <div class="todo-meta">
                    <span class="priority-badge priority-${todo.priority}">
                        ${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                    </span>
                    ${dueDate ? `<span class="due-date">📅 ${dueDate}</span>` : ''}
                </div>
            </div>
            <div class="todo-actions">
                <button class="todo-btn edit-btn" data-id="${todo.id}">Edit</button>
                <button class="todo-btn delete-btn" data-id="${todo.id}">Delete</button>
            </div>
        </div>
    `;
}

// Create edit modal
function createEditModal(todo) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const dueDate = todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">Edit Todo</div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="editTitle" value="${escapeHtml(todo.title)}" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="editDescription">${escapeHtml(todo.description || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>Priority</label>
                    <select id="editPriority">
                        <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" id="editDueDate" value="${dueDate}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-cancel">Cancel</button>
                <button class="modal-btn modal-save">Save</button>
            </div>
        </div>
    `;

    return modal;
}

// Update todo counter
function updateCounter() {
    const count = todos.filter(t => !t.completed).length;
    todoCount.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
