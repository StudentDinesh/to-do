# 📋 Complete Todo List Application

A full-stack todo list application with frontend, backend, and database. Perfect for managing your daily tasks with priority levels, due dates, and status tracking.

## 📁 Project Structure

```
todo-app/
├── package.json          # Node.js dependencies
├── server.js            # Express.js backend server
├── database.js          # SQLite database configuration
├── index.html           # Frontend HTML interface
├── style.css            # Frontend styling
├── script.js            # Frontend JavaScript logic
├── todos.db             # SQLite database (created automatically)
└── README.md            # This file
```

## 🚀 Features

### Frontend Features
- ✅ Add new todos with title, description, priority, and due date
- ✅ Mark todos as completed/incomplete
- ✅ Edit existing todos
- ✅ Delete individual todos or all at once
- ✅ Filter todos (All, Active, Completed)
- ✅ Beautiful, responsive UI with gradient design
- ✅ Real-time todo counter
- ✅ Priority badges (Low, Medium, High)
- ✅ Due date display
- ✅ Notifications for user actions

### Backend Features
- ✅ RESTful API with Express.js
- ✅ CRUD operations for todos
- ✅ Data validation
- ✅ CORS support for frontend-backend communication
- ✅ Error handling
- ✅ Health check endpoint

### Database Features
- ✅ SQLite3 database with automatic initialization
- ✅ Persistent data storage
- ✅ Automatic timestamps (created, updated)
- ✅ Fields: ID, Title, Description, Completed, Priority, Due Date

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## 🔧 Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
```

This will install:
- **express** - Web server framework
- **cors** - Cross-Origin Resource Sharing
- **body-parser** - Request body parser
- **sqlite3** - Database

### Step 2: Start the Server
```bash
npm start
```

Or use:
```bash
node server.js
```

You should see:
```
✅ Todo App Server is running on http://localhost:3000
Press Ctrl+C to stop the server
```

### Step 3: Open in Browser
Navigate to: **http://localhost:3000**

That's it! The application is now running.

## 📱 How to Use

### Adding a Todo
1. Enter the todo title in the first input field
2. (Optional) Add a description in the second field
3. Select priority level (Low, Medium, High)
4. (Optional) Set a due date
5. Click "+ Add Todo" button

### Managing Todos
- **Complete**: Click the checkbox to mark a todo as completed
- **Edit**: Click the "Edit" button to modify a todo
- **Delete**: Click the "Delete" button to remove a todo
- **Clear All**: Click "Clear All" to delete all todos at once

### Filtering
- **All**: View all todos
- **Active**: View only incomplete todos
- **Completed**: View only completed todos

## 🔌 API Endpoints

### GET /api/todos
Fetch all todos
```json
Response: {
  "success": true,
  "data": [...],
  "count": 5
}
```

### GET /api/todos/:id
Fetch a single todo by ID
```json
Response: {
  "success": true,
  "data": { ... }
}
```

### POST /api/todos
Create a new todo
```json
Request Body: {
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high",
  "dueDate": "2024-12-31"
}
```

### PUT /api/todos/:id
Update a todo
```json
Request Body: {
  "title": "Updated title",
  "description": "Updated description",
  "priority": "medium",
  "dueDate": "2024-12-25"
}
```

### PATCH /api/todos/:id/toggle
Toggle todo completion status
```json
Request Body: {
  "completed": true
}
```

### DELETE /api/todos/:id
Delete a single todo

### DELETE /api/todos
Delete all todos

### GET /api/health
Health check endpoint

## 🗄️ Database Schema

### todos Table
```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  dueDate TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🎨 UI Features

- **Gradient Design**: Purple to violet gradient background
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: Slide-in notifications and hover effects
- **Color-Coded Priorities**: Different colors for Low, Medium, and High priority
- **Dark Mode Ready**: Easy to extend with theme switching

## ⚙️ Customization

### Change Server Port
Edit `server.js`:
```javascript
const PORT = 3000; // Change this to any port
```

### Change Gradient Colors
Edit `style.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* Change to your preferred colors */
```

### Modify Database Location
Edit `database.js`:
```javascript
const dbPath = path.join(__dirname, 'todos.db');
// Change path as needed
```

## 🐛 Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/

### "Port 3000 already in use"
- Change the PORT in server.js to an available port
- Or kill the process using port 3000

### "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Database locked error
- Close any other instances of the app
- Delete `todos.db` and restart the server

## 🔐 Security Notes

- This is a local development app - not for production use
- Add authentication for production use
- Validate all inputs on both client and server
- Consider using HTTPS for production
- Implement rate limiting for API

## 📝 Example Todos

Here are some todos you can try:
- 📚 Study for exams (High Priority)
- 🛒 Buy monthly groceries (Medium Priority)
- 🎬 Watch that movie (Low Priority)
- 💼 Complete project report (High Priority)

## 🚀 Future Enhancements

- User authentication and login
- Cloud synchronization
- Mobile app version
- Categories/Tags system
- Recurring todos
- Due date reminders
- Dark mode
- Import/Export functionality

## 📄 License

This project is free to use and modify.

## 👨‍💻 Author

Created as a complete full-stack todo application example.

---

**Happy Task Managing! 🎯**

For any issues or questions, check the browser console and server logs for error messages.
