// server/services/translationService.js
// Google Translate Service mit Multiple Choice Filtering

import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

class BackendTranslationService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY; // Gleicher Key!
    this.baseUrl = 'https://translation.googleapis.com/language/translate/v2';
    this.cache = new Map(); // In-Memory Cache
  }

  // Text übersetzen
  async translateText(text, targetLanguage, sourceLanguage = 'en') {
    if (sourceLanguage === targetLanguage || !text) {
      return text;
    }

    if (!this.apiKey) {
      console.warn('Google API Key missing for translation');
      return text;
    }

    // Cache prüfen
    const cacheKey = `${sourceLanguage}-${targetLanguage}-${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      console.log(`🌐 Backend translating: "${text.substring(0, 50)}..." (${sourceLanguage} → ${targetLanguage})`);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Google Translate API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Translation Error: ${data.error.message}`);
      }

      const translatedText = data.data.translations[0].translatedText;
      
      // Cache speichern
      this.cache.set(cacheKey, translatedText);
      
      console.log(`✅ Translated: "${text.substring(0, 30)}..." → "${translatedText.substring(0, 30)}..."`);
      return translatedText;

    } catch (error) {
      console.error('Translation failed:', error.message);
      return text; // Fallback: Original
    }
  }

  // 🆕 Prüfe ob übersetzte Frage noch Multiple Choice ist
  isTranslatedQuestionValid(originalQuestion, translatedQuestion) {
    const translatedLower = translatedQuestion.toLowerCase();
    
    // Deutsche Multiple Choice Indikatoren
    const germanMultipleChoicePatterns = [
      'welche der folgenden',
      'welche von den folgenden',
      'welche der nachstehenden',
      'welche von diesen',
      'welches der folgenden',
      'welches von den folgenden',
      'was von den folgenden',
      'alle folgenden außer',
      'alle außer',
      'mit ausnahme von',
      'ausgenommen'
    ];

    // Prüfe deutsche Multiple Choice Patterns
    for (const pattern of germanMultipleChoicePatterns) {
      if (translatedLower.includes(pattern)) {
        console.log(`🚫 Translation created multiple choice: "${translatedQuestion.substring(0, 50)}..."`);
        return false;
      }
    }

    return true;
  }

  // Quiz-Frage übersetzen
  async translateQuestion(question, targetLanguage) {
    if (targetLanguage === 'en') {
      return question;
    }

    try {
      // Parallel übersetzen für Performance
      const [translatedQuestion, translatedTopic, translatedAnswer] = await Promise.all([
        this.translateText(question.question, targetLanguage),
        this.translateText(question.topic, targetLanguage),
        this.translateText(question.answer, targetLanguage)
      ]);

      // 🆕 Prüfe ob Translation Multiple Choice erstellt hat
      if (!this.isTranslatedQuestionValid(question.question, translatedQuestion)) {
        console.log(`🚫 Skipping question due to multiple choice translation`);
        return null; // Skip diese Frage
      }

      // Multiple Choice übersetzen (falls vorhanden) - sollte null sein nach Filter
      let translatedChoices = question.choices;
      if (question.choices && Array.isArray(question.choices)) {
        translatedChoices = await Promise.all(
          question.choices.map(choice => this.translateText(choice, targetLanguage))
        );
      }

      return {
        ...question,
        question: translatedQuestion,
        topic: translatedTopic,
        answer: translatedAnswer,
        choices: translatedChoices,
        originalQuestion: question.question,
        originalTopic: question.topic,
        translatedFrom: 'en',
        translatedTo: targetLanguage,
        source: `${question.source || 'OpenTDB'} (translated)`
      };

    } catch (error) {
      console.error('Question translation failed:', error);
      
      // Fallback: Original mit Kennzeichnung
      return {
        ...question,
        topic: `${question.topic} (EN)`,
        source: `${question.source || 'OpenTDB'} (English)`
      };
    }
  }

  // Batch-Übersetzung für Performance
  async translateQuestions(questions, targetLanguage) {
    if (targetLanguage === 'en' || !questions.length) {
      return questions;
    }

    console.log(`🌍 Backend translating ${questions.length} questions to ${targetLanguage} (with multiple choice filter)`);

    const translatedQuestions = [];
    const batchSize = 3; // 🆕 Reduziert für bessere Rate Limiting

    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.all(
          batch.map(q => this.translateQuestion(q, targetLanguage))
        );
        
        // 🆕 Filtere null Ergebnisse (Multiple Choice)
        const validResults = batchResults.filter(result => result !== null);
        translatedQuestions.push(...validResults);
        
        // Längere Pause zwischen Batches für Rate Limiting
        if (i + batchSize < questions.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
      } catch (error) {
        console.error(`Batch translation failed:`, error);
        
        // Fallback für failed batch
        const fallbackBatch = batch.map(q => ({
          ...q,
          topic: `${q.topic} (EN)`,
          source: `${q.source || 'OpenTDB'} (Translation Failed)`
        }));
        
        translatedQuestions.push(...fallbackBatch);
      }
    }

    const successCount = translatedQuestions.filter(q => q.translatedTo === targetLanguage).length;
    console.log(`✅ Translation complete: ${successCount}/${questions.length} questions translated (${questions.length - translatedQuestions.length} filtered out)`);
    
    return translatedQuestions;
  }

  // Service Status
  getStatus() {
    return {
      enabled: !!this.apiKey,
      cacheSize: this.cache.size,
      apiAvailable: !!this.apiKey,
      filtering: 'Multiple Choice aware'
    };
  }

  // Cache leeren (für Memory Management)
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Backend translation cache cleared');
  }
}

export const translationService = new BackendTranslationService();