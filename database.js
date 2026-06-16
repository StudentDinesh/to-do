const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the current directory
const dbPath = path.join(__dirname, 'todos.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table initialized successfully');
    }
  });

  // Create todos table
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      dueDate TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Todos table initialized successfully');
    }
  });
}

// Get all todos for a user
function getAllTodos(userId, callback) {
  db.all('SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC', [userId], callback);
}

// Get single todo by ID
function getTodoById(id, userId, callback) {
  db.get('SELECT * FROM todos WHERE id = ? AND userId = ?', [id, userId], callback);
}

// Create new todo
function createTodo(userId, title, description, priority, dueDate, callback) {
  db.run(
    'INSERT INTO todos (userId, title, description, priority, dueDate) VALUES (?, ?, ?, ?, ?)',
    [userId, title, description, priority, dueDate],
    function(err) {
      if (err) {
        callback(err);
      } else {
        callback(null, { id: this.lastID, userId, title, description, priority, dueDate, completed: 0 });
      }
    }
  );
}

// Update todo
function updateTodo(id, userId, title, description, priority, dueDate, callback) {
  db.run(
    'UPDATE todos SET title = ?, description = ?, priority = ?, dueDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?',
    [title, description, priority, dueDate, id, userId],
    callback
  );
}

// Toggle todo completion status
function toggleTodo(id, userId, completed, callback) {
  db.run(
    'UPDATE todos SET completed = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?',
    [completed ? 1 : 0, id, userId],
    callback
  );
}

// Delete todo
function deleteTodo(id, userId, callback) {
  db.run('DELETE FROM todos WHERE id = ? AND userId = ?', [id, userId], callback);
}

// Delete all todos
function deleteAllTodos(userId, callback) {
  db.run('DELETE FROM todos WHERE userId = ?', [userId], callback);
}

// User Authentication Functions

// Register new user
function registerUser(username, email, password, callback) {
  db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, password],
    function(err) {
      if (err) {
        callback(err);
      } else {
        callback(null, { id: this.lastID, username, email });
      }
    }
  );
}

// Login user (get user by username)
function getUserByUsername(username, callback) {
  db.get('SELECT * FROM users WHERE username = ?', [username], callback);
}

// Get user by email
function getUserByEmail(email, callback) {
  db.get('SELECT * FROM users WHERE email = ?', [email], callback);
}

// Close database
function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
  });
}

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  deleteAllTodos,
  registerUser,
  getUserByUsername,
  getUserByEmail,
  closeDatabase
};
