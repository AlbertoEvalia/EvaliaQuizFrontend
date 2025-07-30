// server/routes/api.js
// Rekonstruierte Version basierend auf deiner ursprünglichen Struktur

import express from 'express';
import { generateQuestions, evaluateAnswer } from '../services/geminiService.js';

const router = express.Router();

// POST /api/questions - Fragen generieren
router.post('/questions', async (req, res) => {
  try {
    const { language = 'de', count = 20 } = req.body;
    
    // Validierung
    if (typeof count !== 'number' || count < 1 || count > 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid count (1-100 allowed)"
      });
    }

    console.log(`[QUESTIONS] Generating ${count} questions in ${language}`);
    
    // Fragen über geminiService generieren
    const questions = await generateQuestions(language, count);
    
    console.log(`[QUESTIONS] Generated ${questions.length} questions`);
    
    res.json({
      success: true,
      count: questions.length,
      questions
    });
    
  } catch (error) {
    console.error(`[QUESTIONS] Error: ${error.message}`);
    
    res.status(500).json({
      success: false,
      error: "Could not generate questions",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/questions - Alternative für GET-Requests (falls Frontend das nutzt)
router.get('/questions', async (req, res) => {
  try {
    const { language = 'de', count = 20 } = req.query;
    const questionCount = parseInt(count);
    
    // Validierung
    if (isNaN(questionCount) || questionCount < 1 || questionCount > 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid count (1-100 allowed)"
      });
    }

    console.log(`[QUESTIONS-GET] Generating ${questionCount} questions in ${language}`);
    
    // Fragen über geminiService generieren
    const questions = await generateQuestions(language, questionCount);
    
    console.log(`[QUESTIONS-GET] Generated ${questions.length} questions`);
    
    res.json({
      success: true,
      count: questions.length,
      questions
    });
    
  } catch (error) {
    console.error(`[QUESTIONS-GET] Error: ${error.message}`);
    
    res.status(500).json({
      success: false,
      error: "Could not generate questions",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/evaluate - Antwort bewerten
router.post('/evaluate', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { question, answer, language = 'de', expectedAnswer } = req.body;
    
    // Validierung
    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Question and answer required"
      });
    }

    console.log(`[EVALUATE] Question: "${question.substring(0, 50)}...", Answer: "${answer}", Language: ${language}, Expected: ${expectedAnswer || 'none'}`);
    
    // Timeout für die Evaluierung
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Evaluation timeout')), 12000);
    });

    // Evaluation über geminiService
    const evaluationPromise = evaluateAnswer(question, answer, language);
    const result = await Promise.race([evaluationPromise, timeoutPromise]);
    
    console.log(`[EVALUATE] Result: ${result.isCorrect ? 'CORRECT' : 'INCORRECT'}, Score: ${result.score}`);
    
    res.json({
      success: true,
      evaluation: result,
      ...result  // Für Backward-Compatibility
    });
    
  } catch (error) {
    console.error(`[EVALUATE] Error: ${error.message}`);
    
    // Spezifische Behandlung für verschiedene Fehlertypen
    if (error.message === 'Evaluation timeout') {
      return res.status(408).json({
        success: false,
        error: "Evaluation timed out",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      error: "Evaluation failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/health - Gesundheitscheck
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Quiz API',
    version: '2.0.0',
    uptime: process.uptime()
  });
});

// GET /api/pool/status - Pool-Informationen
router.get('/pool/status', async (req, res) => {
  try {
    const { getPoolStats } = await import('../data/questionPool/index.js');
    const poolStats = getPoolStats();
    
    res.json({
      success: true,
      poolStats,
      totalQuestions: Object.values(poolStats).reduce((sum, count) => sum + count, 0),
      availableLanguages: Object.keys(poolStats).filter(lang => poolStats[lang] > 0),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Could not load pool status',
      details: error.message
    });
  }
});

// GET /api/info - System-Informationen
router.get('/info', (req, res) => {
  res.json({
    success: true,
    system: {
      name: 'EVALIA Quiz API',
      version: '2.0.0',
      mode: 'pool_only',
      features: {
        questionPool: true,
        aiGeneration: false,
        aiEvaluation: !!process.env.GEMINI_API_KEY,
        multiLanguage: true
      },
      supportedLanguages: ['de', 'en', 'fr', 'es', 'it'],
      maxQuestionsPerRequest: 100,
      defaultQuestionCount: 20
    },
    endpoints: {
      'POST /questions': 'Generate questions (body: {language, count})',
      'GET /questions': 'Generate questions (query: ?language=de&count=20)',
      'POST /evaluate': 'Evaluate answer (body: {question, answer, language})',
      'GET /health': 'Health check',
      'GET /pool/status': 'Pool statistics',
      'GET /info': 'System information'
    },
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'EVALIA Quiz API v2.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: '/api/info'
  });
});

// Export als named export für Kompatibilität
export { router as apiRouter };

// Zusätzlich default export
export default router;