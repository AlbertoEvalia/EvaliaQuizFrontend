// src/services/questionService.js
// CLEAN STRATEGY: OpenTDB (English) + Translation für alle Sprachen

import openTdbService from './openTdbService.js';
import translationService from './translationService.js';

class QuestionService {
  constructor() {
    this.englishMasterSource = true; // Neue Strategie!
  }

  // 🆕 NEUE SAUBERE Strategie: Alles von Englisch übersetzen
  async generateQuestions(language = 'de', count = 20, topics = [], difficulty = 'mixed') {
    console.log(`🌍 Generating ${count} questions for ${language} (English master source)`);
    
    try {
      // 1. IMMER englische Fragen von OpenTDB laden
      console.log('📚 Loading English questions from OpenTDB...');
      const englishQuestions = await openTdbService.getQuestions(
        count + 2, // Etwas mehr für Qualitätsfilterung
        this.mapTopicsForOpenTdb(topics),
        difficulty
      );

      if (!englishQuestions || englishQuestions.length === 0) {
        throw new Error('No questions available from OpenTDB');
      }

      console.log(`✅ Loaded ${englishQuestions.length} English questions`);

      // 2. Qualitätsfilterung (entferne zu schwere/komplexe Fragen)
      const filteredQuestions = this.filterQuestionsForTranslation(englishQuestions);
      
      // 3. Auf gewünschte Anzahl reduzieren
      const selectedQuestions = this.shuffleArray(filteredQuestions).slice(0, count);

      // 4. Übersetzen (falls nicht englisch)
      let finalQuestions;
      if (language === 'en') {
        finalQuestions = selectedQuestions;
        console.log('🇬🇧 English questions ready (no translation needed)');
      } else {
        console.log(`🔄 Translating ${selectedQuestions.length} questions to ${language}...`);
        finalQuestions = await translationService.translateQuestions(selectedQuestions, language);
        console.log(`✅ Translation complete for ${language}`);
      }

      // 5. Format für App
      return this.formatForApp(finalQuestions, language);

    } catch (error) {
      console.error('🚨 Question generation failed:', error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  // Fragen für Übersetzung filtern (entferne problematische)
  filterQuestionsForTranslation(questions) {
    return questions.filter(q => {
      // Entferne sehr lange Fragen (schwer zu übersetzen)
      if (q.question.length > 150) return false;
      
      // Entferne Fragen mit vielen Eigennamen (übersetzen sich schlecht)
      const properNouns = (q.question.match(/[A-Z][a-z]+/g) || []).length;
      if (properNouns > 4) return false;
      
      // Entferne Fragen mit Zahlen/Formeln im Text (Context geht verloren)
      if (q.question.includes('°F') || q.question.includes('mph') || q.question.includes('$')) {
        return false;
      }
      
      // Behalte den Rest
      return true;
    });
  }

  // Topics für OpenTDB anpassen
  mapTopicsForOpenTdb(topics) {
    const topicMapping = {
      // Multi-Language → OpenTDB
      'Mathematik': 'Mathematik',
      'Mathematics': 'Mathematik',
      'Matemáticas': 'Mathematik',
      'Mathématiques': 'Mathematik',
      'Matematica': 'Mathematik',
      
      'Physik': 'Physik',
      'Physics': 'Physik',
      'Física': 'Physik',
      'Physique': 'Physik',
      'Fisica': 'Physik',
      
      'Geschichte': 'Geschichte',
      'History': 'Geschichte',
      'Historia': 'Geschichte',
      'Histoire': 'Geschichte',
      'Storia': 'Geschichte',
      
      'Geographie': 'Geographie',
      'Geography': 'Geographie',
      'Geografía': 'Geographie',
      'Géographie': 'Geographie',
      'Geografia': 'Geographie',
      
      'Kunst': 'Kunst',
      'Art': 'Kunst',
      'Arte': 'Kunst',
      'Arte': 'Kunst', // ES/IT
      
      'Sport': 'Sport',
      'Sports': 'Sport',
      'Deportes': 'Sport',
      'Sports': 'Sport', // FR
      'Sport': 'Sport' // IT
    };

    return topics.map(topic => topicMapping[topic] || 'Allgemeinwissen').filter(Boolean);
  }

  // Format für App (einheitlich für alle Sprachen)
  formatForApp(questions, language) {
    return questions.map((q, index) => ({
      id: `q_${Date.now()}_${index}`,
      question: q.question,
      topic: q.topic,
      answer: q.answer,
      choices: q.choices,
      difficulty: q.difficulty || 'medium',
      source: q.source || 'OpenTDB',
      language: language,
      originalLanguage: q.originalLanguage || 'en',
      translatedFrom: q.translatedFrom,
      translatedTo: q.translatedTo,
      quality: this.assessQuestionQuality(q)
    }));
  }

  // Qualitätsbewertung für Analytics
  assessQuestionQuality(question) {
    let score = 100;
    
    // Abzug für sehr lange Fragen
    if (question.question.length > 100) score -= 10;
    if (question.question.length > 150) score -= 20;
    
    // Abzug für viele Eigennamen
    const properNouns = (question.question.match(/[A-Z][a-z]+/g) || []).length;
    if (properNouns > 3) score -= 10;
    
    // Bonus für bestimmte Kategorien
    if (['Mathematics', 'Science & Nature', 'Geography'].includes(question.originalCategory)) {
      score += 10; // Diese übersetzen sich gut
    }
    
    return Math.max(score, 50); // Minimum 50%
  }

  // Array shuffeln
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Service Status (erweitert)
  async getServiceStatus() {
    const status = {
      openTdb: false,
      translation: translationService.getCacheStats(),
      strategy: 'English Master + Translation',
      supportedLanguages: ['en', 'de', 'es', 'fr', 'it'],
      timestamp: new Date().toISOString()
    };

    try {
      // OpenTDB testen
      const testQuestions = await openTdbService.getQuestions(1);
      status.openTdb = testQuestions.length > 0;
    } catch (error) {
      status.openTdb = false;
    }

    return status;
  }

  // Sprachstatistiken (neue Strategie)
  getLanguageStrategy(language) {
    return {
      primary: 'OpenTDB (English)',
      secondary: language === 'en' ? 'Direct' : 'Google Translate',
      description: language === 'en' 
        ? 'Direct access to 4000+ OpenTDB questions'
        : `4000+ OpenTDB questions translated to ${language}`,
      quality: language === 'en' ? 'Native' : 'Translated',
      scalability: 'Unlimited'
    };
  }

  // Cache-Management
  clearCache() {
    translationService.clearCache();
    console.log('🗑️ All caches cleared');
  }
}

// Singleton Export
const questionService = new QuestionService();

export default questionService;