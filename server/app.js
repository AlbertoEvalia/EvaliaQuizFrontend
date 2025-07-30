// server/app.js
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';  // ← KORRIGIERT!

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'EVALIA Server läuft!', 
    timestamp: new Date().toISOString() 
  });
});

export default app;