/**
 * Express backend server for Impact Flow
 * Provides REST API with file-based SQLite persistence
 */

import express from 'express';
import cors from 'cors';
import { initializeDatabase, getDatabase } from './database';
import profileRoutes from './routes/profiles';
import projectRoutes from './routes/projects';
import criteriaRoutes from './routes/criteria';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database before starting server
initializeDatabase();

// Routes
app.use('/api/profiles', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/criteria', criteriaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] Database file: ./data/impact-flow.db`);
});
