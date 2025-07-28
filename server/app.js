import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use('/api', apiRouter);
app.use(errorHandler);

// Server export
export default app;