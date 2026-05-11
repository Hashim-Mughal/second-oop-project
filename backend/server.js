// =============================================================
// BEFORE REFACTORING — server.js
//
// VIOLATION: No Composition Root concept — dependencies are not
// injected; routes directly import models. There is no wiring
// layer. Everything is global and tightly coupled.
// =============================================================

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const userRoutes    = require('./src/routes/userRoutes');
const taskRoutes    = require('./src/routes/taskRoutes');
const commentRoutes = require('./src/routes/commentRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mount routes
app.use('/api/users',                  userRoutes);
app.use('/api/tasks',                  taskRoutes);
app.use('/api/tasks/:taskId/comments', commentRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'Task Manager API — Before Refactoring' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
