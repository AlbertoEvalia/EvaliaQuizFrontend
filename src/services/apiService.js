// client/src/services/apiService.js - KORRIGIERTE VERSION
import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // Backend-URL

export const generateQuestions = async (language, count) => {
  try {
    const response = await axios.post(`${API_URL}/questions`, {
      language,
      count
    });
    return response.data.questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

export const evaluateAnswer = async (question, answer, language, expectedAnswer) => {
  try {
    const response = await axios.post(`${API_URL}/evaluate`, {
      question,
      answer,
      language,
      expectedAnswer
    });

    // KORREKTUR: Backend Response korrekt mappen
    const backendResult = response.data;
    
    // Backend sendet: { success: true, score: 100, feedback: "Richtig!", isCorrect: true }
    // Frontend erwartet: { score: number, feedback: string, isCorrect: boolean }
    const mappedResult = {
      score: backendResult.score || 0,
      feedback: backendResult.feedback || "No feedback available",
      isCorrect: backendResult.isCorrect || false
    };

    console.log('=== API RESPONSE DEBUG ===');
    console.log('Backend Result:', backendResult);
    console.log('Backend Result stringified:', JSON.stringify(backendResult, null, 2));
    console.log('Mapped Frontend Result:', mappedResult);
    console.log('Raw Response Data:', response.data);
    console.log('Response Status:', response.status);
    console.log('==============================');

    return mappedResult;
  } catch (error) {
    console.error('Error evaluating answer:', error);
    
    // Spezifische Fehlerbehandlung
    if (error.response?.status === 500) {
      throw new Error('Server error occurred');
    } else if (error.response?.status === 408) {
      throw new Error('Evaluation timeout');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
};

// Health check
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Zusätzliche Utility-Funktion für Batch-Evaluation
export const evaluateAllAnswers = async (questionsAndAnswers, language) => {
  try {
    const evaluationPromises = questionsAndAnswers.map(({ question, answer }) =>
      evaluateAnswer(question, answer, language)
    );
    
    const results = await Promise.all(evaluationPromises);
    return results;
  } catch (error) {
    console.error('Error evaluating all answers:', error);
    throw error;
  }
};