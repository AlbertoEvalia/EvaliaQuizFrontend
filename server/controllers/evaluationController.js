// controllers/evaluationController.js - KORRIGIERT
import { evaluateAnswerWithExpected } from '../services/geminiService.js';

// Fallback-Evaluation ohne erwartete Antwort
const evaluateAnswerFallback = async (question, answer, language) => {
  // Einfache Keyword-basierte Evaluation
  const answerLower = answer.toLowerCase().trim();
  
  // Sehr einfache Heuristiken für häufige richtige Antworten
  const commonCorrectAnswers = {
    'sauerstoff': ['sauerstoff', 'o2', 'oxygen'],
    'berlin': ['berlin'],
    '1989': ['1989'],
    'jupiter': ['jupiter'],
    'einstein': ['einstein', 'albert einstein'],
    'washington': ['washington', 'george washington'],
    'elf': ['11', 'elf'],
    'acht': ['8', 'acht']
  };
  
  // Prüfe ob Antwort in bekannten richtigen Antworten ist
  for (const [correct, variations] of Object.entries(commonCorrectAnswers)) {
    if (variations.some(variant => answerLower.includes(variant))) {
      return {
        success: true,
        score: 100,
        feedback: "Richtig!",
        isCorrect: true
      };
    }
  }
  
  // Wenn nicht in bekannten Antworten, versuche intelligente Bewertung
  if (answerLower.length > 0) {
    return {
      success: true,
      score: 50, // Teilpunkte für Versuch
      feedback: "Antwort erhalten. Genaue Bewertung noch nicht verfügbar.",
      isCorrect: false
    };
  }
  
  return {
    success: true,
    score: 0,
    feedback: "Keine Antwort eingegeben.",
    isCorrect: false
  };
};

export const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, language } = req.body;
    
    console.log(`Evaluating: "${answer}" for question: "${question.substring(0, 50)}..."`);
    
    // Validierung der Eingaben
    if (!question || !answer || !language) {
      return res.status(400).json({
        success: false,
        error: "Question, answer, and language are required"
      });
    }
    
    // Zusätzliche Validierung für unterstützte Sprachen
    const supportedLanguages = ['German', 'English', 'French', 'Spanish', 'Italian'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Language '${language}' is not supported. Supported languages: ${supportedLanguages.join(', ')}`
      });
    }
    
    let evaluation;
    
    try {
      // Versuche AI-Evaluation mit Mock expectedAnswer
  
      
      evaluation = await evaluateAnswerWithExpected(question, answer, language, null);
      
      // Konvertiere zum erwarteten Format
      const result = {
        success: true,
        score: evaluation.score || 0,
        feedback: evaluation.feedback || "Bewertung durchgeführt.",
        isCorrect: evaluation.isCorrect || false
      };
      
      console.log(`AI Evaluation completed:`, result);
      res.json(result);
      
    } catch (aiError) {
      console.log(`AI evaluation failed, using fallback:`, aiError.message);
      
      // Fallback zu einfacher Evaluation
      evaluation = await evaluateAnswerFallback(question, answer, language);
      
      console.log(`Fallback evaluation completed:`, evaluation);
      res.json(evaluation);
    }
    
  } catch (error) {
    console.error("Evaluation Error:", error);
    
    // Spezifische Fehlerbehandlung
    if (error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: "Evaluation timeout - please try again",
        details: error.message
      });
    }
    
    if (error.message.includes('Invalid JSON')) {
      return res.status(502).json({
        success: false,
        error: "AI service returned invalid response", 
        details: error.message
      });
    }
    
    // Allgemeine Fehlerbehandlung - immer eine Antwort senden
    res.status(200).json({
      success: true,
      score: 0,
      feedback: "Bewertung nicht möglich.",
      isCorrect: false,
      error: error.message
    });
  }
};