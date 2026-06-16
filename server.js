const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));

// Simple password hashing function
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Routes

// ===== AUTHENTICATION ROUTES =====

// POST - Sign Up
app.post('/api/auth/signup', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validation
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Check if user already exists
  db.getUserByUsername(username, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (user) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    db.getUserByEmail(email, (err, userEmail) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (userEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password and create user
      const hashedPassword = hashPassword(password);
      db.registerUser(username, email, hashedPassword, (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          user: { id: result.id, username: result.username, email: result.email }
        });
      });
    });
  });
});

// POST - Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.getUserByUsername(username, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
});

// ===== TODO ROUTES =====

// GET - Fetch all todos for a user
app.get('/api/todos', (req, res) => {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  db.getAllTodos(userId, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({
        success: true,
        data: rows || [],
        count: rows ? rows.length : 0
      });
    }
  });
});

// GET - Fetch single todo by ID
app.get('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  db.getTodoById(id, userId, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Todo not found' });
    } else {
      res.json({ success: true, data: row });
    }
  });
});

// POST - Create new todo
app.post('/api/todos', (req, res) => {
  const { title, description, priority, dueDate } = req.body;
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.createTodo(userId, title, description || '', priority || 'medium', dueDate || null, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ success: true, message: 'Todo created successfully', data: result });
    }
  });
});

// PUT - Update todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, priority, dueDate } = req.body;
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.updateTodo(id, userId, title, description || '', priority || 'medium', dueDate || null, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true, message: 'Todo updated successfully' });
    }
  });
});

// PATCH - Toggle todo completion status
app.patch('/api/todos/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  db.toggleTodo(id, userId, completed, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true, message: 'Todo status updated successfully' });
    }
  });
});

// DELETE - Delete single todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  db.deleteTodo(id, userId, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true, message: 'Todo deleted successfully' });
    }
  });
});

// DELETE - Delete all todos
app.delete('/api/todos', (req, res) => {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  db.deleteAllTodos(userId, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true, message: 'All todos deleted successfully' });
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Serve login page for root path if not authenticated
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Todo App Server is running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.closeDatabase();
  process.exit(0);
});
