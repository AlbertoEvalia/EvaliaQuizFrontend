// server.js
import dotenv from 'dotenv';
dotenv.config({ debug: true });

import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: http://localhost:5173`);
  
  console.log('API Key geladen:', process.env.GEMINI_API_KEY ? 'JA' : 'NEIN');
  if (process.env.GEMINI_API_KEY) {
    console.log('API Key Länge:', process.env.GEMINI_API_KEY.length);
  }
});