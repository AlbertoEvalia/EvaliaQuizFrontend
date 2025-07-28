import express from 'express';
import { generateQuestions, evaluateAnswer } from '../controllers/questionController.js';

const router = express.Router();

// POST /api/questions
router.post('/questions', async (req, res) => {
  try {
    const { language = 'en', count = 20 } = req.body;
    
    if (typeof count !== 'number' || count < 1 || count > 50) {
      return res.status(400).json({
        error: "Invalid count (1-50 allowed)"
      });
    }
    
    console.log(`[QUESTIONS] Generating ${count} questions in ${language}`);
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

// POST /api/evaluate
router.post('/evaluate', async (req, res) => {
  try {
    const { question, answer, language = 'en', expectedAnswer } = req.body;
    
    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({
        error: "Question and answer required"
      });
    }
    
    console.log(`[EVALUATE] Question: "${question.substring(0, 50)}...", Answer: "${answer}", Language: ${language}, Expected: ${expectedAnswer || 'none'}`);
    
    // Timeout für die Evaluierung
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Evaluation timeout')), 12000);
    });
    
    const evaluationPromise = evaluateAnswer(question, answer, language, expectedAnswer);
    const result = await Promise.race([evaluationPromise, timeoutPromise]);
    
    console.log(`[EVALUATE] Result: ${result.isCorrect ? 'CORRECT' : 'INCORRECT'}, Score: ${result.score}`);
    
    res.json({
      success: true,
      ...result
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

// GET /api/health
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Quiz API'
  });
});

export { router as apiRouter };