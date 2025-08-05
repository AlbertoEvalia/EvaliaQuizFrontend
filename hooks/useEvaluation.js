// hooks/useEvaluation.js
import { useState, useCallback } from 'react';
import { evaluateAnswer } from '../services/apiService';

export const useEvaluation = () => {
  const [state, setState] = useState({
    scores: [],
    isLoading: false,
    error: null
  });

  // Intelligente Fallback-Evaluation basierend auf Antwortmustern
  const getSmartFallback = useCallback((question, answer) => {
    const cleanAnswer = answer.toLowerCase().trim();
    const cleanQuestion = question.toLowerCase();
    
    // Numerische Antworten
    if (/^\d+$/.test(cleanAnswer)) {
      return {
        correct: null, // Unbekannt, aber valid
        explanation: `Your answer "${answer}" appears to be a number. This might be correct depending on the question.`,
        confidence: 'low',
        fallback: true
      };
    }
    
    // Ja/Nein Antworten
    if (['yes', 'no', 'true', 'false', 'ja', 'nein', 'oui', 'non'].includes(cleanAnswer)) {
      return {
        correct: null,
        explanation: `Your answer "${answer}" is a valid yes/no response.`,
        confidence: 'medium',
        fallback: true
      };
    }
    
    // Sehr kurze Antworten (wahrscheinlich Namen, Orte, etc.)
    if (cleanAnswer.length <= 2) {
      return {
        correct: null,
        explanation: `Your answer "${answer}" is very short. Please make sure it's complete.`,
        confidence: 'low',
        fallback: true
      };
    }
    
    // Sehr lange Antworten
    if (cleanAnswer.length > 200) {
      return {
        correct: null,
        explanation: `Your answer is quite detailed. For quiz questions, shorter answers are usually expected.`,
        confidence: 'low',
        fallback: true
      };
    }
    
    // Standardfall für normale Antworten
    return {
      correct: null,
      explanation: `Your answer "${answer}" has been recorded. The evaluation service is currently unavailable.`,
      confidence: 'unknown',
      fallback: true
    };
  }, []);

  // Hauptevaluierungsfunktion mit erweiterten Retry-Strategien
  const evaluate = useCallback(async (question, answer, language) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const maxRetries = 3;
    const timeouts = [10000, 15000, 20000]; // Progressive Timeouts
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Progressive Delays
        if (attempt > 0) {
          const delay = Math.min(Math.pow(2, attempt) * 1000, 8000); // Max 8s delay
          console.log(`Retry attempt ${attempt + 1} after ${delay}ms delay`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // AbortController mit progressiven Timeouts
        const controller = new AbortController();
        const timeoutMs = timeouts[attempt] || 20000;
        
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log(`Attempt ${attempt + 1} timed out after ${timeoutMs}ms`);
        }, timeoutMs);
        
        try {
          const evaluation = await evaluateAnswer(
            question, 
            answer, 
            language, 
            controller.signal,
            { attempt: attempt + 1, maxRetries }
          );
          
          clearTimeout(timeoutId);
          
          setState(prev => ({
            scores: [...prev.scores, evaluation],
            isLoading: false,
            error: null
          }));
          
          return evaluation;
          
        } catch (apiError) {
          clearTimeout(timeoutId);
          
          if (apiError.name === 'AbortError') {
            console.log(`Attempt ${attempt + 1} was aborted due to timeout`);
            throw new Error(`Request timed out after ${timeoutMs}ms`);
          }
          
          throw apiError;
        }
        
      } catch (error) {
        console.log(`Attempt ${attempt + 1} failed:`, error.message);
        
        // Beim letzten Versuch: Smart Fallback
        if (attempt === maxRetries - 1) {
          console.log('All API attempts failed, using smart fallback evaluation');
          
          const fallbackResult = getSmartFallback(question, answer);
          
          setState(prev => ({
            scores: [...prev.scores, fallbackResult],
            isLoading: false,
            error: `Evaluation service temporarily unavailable. Answer recorded for manual review.`
          }));
          
          return fallbackResult;
        }
      }
    }
  }, [getSmartFallback]);

  // Bulk evaluation für mehrere Fragen
  const evaluateBatch = useCallback(async (evaluations) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const results = [];
    let hasErrors = false;
    
    for (const { question, answer, language } of evaluations) {
      try {
        const result = await evaluate(question, answer, language);
        results.push(result);
      } catch (error) {
        hasErrors = true;
        results.push({
          correct: null,
          explanation: "Could not evaluate this answer",
          error: error.message,
          fallback: true
        });
      }
    }
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: hasErrors ? "Some evaluations failed" : null
    }));
    
    return results;
  }, [evaluate]);

  // Health check für den Evaluation Service
  const checkServiceHealth = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/health', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
      
    } catch (error) {
      console.log('Service health check failed:', error);
      return false;
    }
  }, []);

  // Reset function
  const reset = useCallback(() => {
    setState({
      scores: [],
      isLoading: false,
      error: null
    });
  }, []);

  // Clear nur den Error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Entferne den letzten Score
  const removeLastScore = useCallback(() => {
    setState(prev => ({
      ...prev,
      scores: prev.scores.slice(0, -1)
    }));
  }, []);

  // Retry für einen spezifischen Score
  const retryEvaluation = useCallback(async (scoreIndex) => {
    if (scoreIndex < 0 || scoreIndex >= state.scores.length) {
      throw new Error('Invalid score index');
    }
    
    const score = state.scores[scoreIndex];
    if (!score.fallback) {
      throw new Error('Score was not evaluated using fallback');
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Extrahiere Original-Daten (falls verfügbar)
      const originalQuestion = score.originalQuestion || "Unknown question";
      const originalAnswer = score.originalAnswer || score.userAnswer || "Unknown answer";
      const originalLanguage = score.originalLanguage || "en";
      
      const newEvaluation = await evaluate(originalQuestion, originalAnswer, originalLanguage);
      
      setState(prev => ({
        ...prev,
        scores: prev.scores.map((s, i) => 
          i === scoreIndex ? { ...newEvaluation, retried: true } : s
        ),
        isLoading: false
      }));
      
      return newEvaluation;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Retry failed: ${error.message}`
      }));
      throw error;
    }
  }, [state.scores, evaluate]);

  return {
    ...state,
    evaluateAnswer: evaluate,
    evaluateBatch,
    checkServiceHealth,
    resetEvaluation: reset,
    clearError,
    removeLastScore,
    retryEvaluation
  };
};

// services/api.js - Erweiterte API-Funktion
