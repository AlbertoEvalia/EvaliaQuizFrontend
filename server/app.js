// server/app.js
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';
import authRouter from './routes/auth.js'; // ← NEU

const app = express();

// Middleware
app.use(cors({
  origin: ['https://evaliaquiz.com', 'https://evalia-quiz-frontend.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', apiRouter);
app.use('/api/auth', authRouter); // ← NEU

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'EVALIA Server läuft!',
    timestamp: new Date().toISOString()
  });
});

export default app;