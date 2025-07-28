// server/services/questionService.js
// WIKIPEDIA MINT STRATEGY: High-Quality MINT Questions from Wikipedia + Curated Pool

import { openTdbService } from './openTdbService.js';
import { translationService } from './translationService.js';
import { wikipediaMintService } from './wikipediaMintService.js';
import { 
  QUESTION_POOL, 
  getRandomQuestionsFromPool, 
  getPoolStats,
  getQuestionsByTopic 
} from '../data/questionPool.js';

class QuestionService {
  constructor() {
    this.recentQuestions = new Map(); // Session-basierte History
    this.strategy = 'Wikipedia MINT + Curated Pool'; // Neue Hauptstrategie
  }

  // 🎯 HAUPTFUNKTION: Wikipedia MINT + Pool Hybrid
  async generateQuestions(language = 'de', count = 20, options = {}) {
    console.log(`🌍 Generating ${count} questions for ${language} (Wikipedia MINT Strategy)`);
    
    const {
      sessionId = 'default',
      preferWikipedia = true
    } = options;

    try {
      let finalQuestions = [];

      if (preferWikipedia) {
        // 🔬 STRATEGIE 1: Wikipedia MINT (Haupt-Quelle)
        console.log('🔬 Loading questions from Wikipedia MINT sources...');
        
        try {
          const mintQuestions = await wikipediaMintService.generateMintQuestions(count);
          
          if (mintQuestions && mintQuestions.length > 0) {
            console.log(`✅ Wikipedia MINT generated ${mintQuestions.length} questions`);
            
            // Übersetzen falls nötig
            if (language === 'en') {
              finalQuestions = mintQuestions;
            } else {
              console.log(`🔄 Translating ${mintQuestions.length} MINT questions to ${language}...`);
              finalQuestions = await this.translateQuestions(mintQuestions, language);
            }
            
            // Mische mit Pool für Diversität (20% Pool)
            const poolCount = Math.ceil(count * 0.2);
            const poolQuestions = this.getPoolQuestions(language, poolCount);
            
            finalQuestions = [
              ...finalQuestions.slice(0, count - poolCount),
              ...poolQuestions
            ];
            
            finalQuestions = this.shuffleArray(finalQuestions).slice(0, count);
            
            console.log(`🎯 Wikipedia MINT Strategy: ${finalQuestions.length} questions (${finalQuestions.length - poolCount} MINT + ${poolCount} Pool)`);
          }
        } catch (mintError) {
          console.warn('⚠️ Wikipedia MINT failed, falling back:', mintError.message);
          finalQuestions = []; // Trigger fallback
        }
      }

      // 🆘 FALLBACK: Curated Pool (wenn MINT fehlschlägt oder nicht gewünscht)
      if (finalQuestions.length < count * 0.7) {
        console.log('🔄 Falling back to curated pool strategy...');
        
        const poolQuestions = this.getPoolQuestions(language, count);
        
        if (poolQuestions.length > 0) {
          finalQuestions = [...finalQuestions, ...poolQuestions];
          finalQuestions = this.removeDuplicates(finalQuestions).slice(0, count);
          console.log(`📦 Pool fallback: ${finalQuestions.length} questions`);
        }
      }

      // 🆘 EMERGENCY FALLBACK: OpenTDB (nur wenn alles andere fehlschlägt)
      if (finalQuestions.length < count * 0.5) {
        console.log('🆘 Emergency fallback to OpenTDB...');
        
        try {
          const openTdbQuestions = await openTdbService.getQuestions(count, [], 'mixed');
          
          if (openTdbQuestions && openTdbQuestions.length > 0) {
            // Übersetzen falls nötig
            const translatedQuestions = language === 'en' ? 
              openTdbQuestions : 
              await this.translateQuestions(openTdbQuestions, language);
            
            finalQuestions = [...finalQuestions, ...translatedQuestions];
            finalQuestions = this.removeDuplicates(finalQuestions).slice(0, count);
            console.log(`🆘 OpenTDB emergency: ${finalQuestions.length} total questions`);
          }
        } catch (openTdbError) {
          console.error('🚨 OpenTDB emergency failed:', openTdbError.message);
        }
      }

      // Final Checks
      if (finalQuestions.length === 0) {
        throw new Error('No questions could be generated from any source');
      }

      // Update History
      this.updateQuestionHistory(sessionId, finalQuestions);

      // Format for App
      const formattedQuestions = this.formatForApp(finalQuestions, language);
      
      console.log(`✅ Final result: ${formattedQuestions.length} questions`);
      console.log('📊 Sources used:', [...new Set(formattedQuestions.map(q => q.source))]);
      console.log('🏷️ Topics covered:', [...new Set(formattedQuestions.map(q => q.topic))]);
      
      return formattedQuestions;

    } catch (error) {
      console.error('🚨 Question generation completely failed:', error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  // 📦 Pool-Fragen holen (verbessert)
  getPoolQuestions(language, count) {
    try {
      const poolStats = getPoolStats();
      const available = poolStats[language.toLowerCase()] || poolStats['en'] || 0;
      
      if (available === 0) {
        console.warn(`⚠️ No pool questions available for ${language}`);
        return [];
      }

      console.log(`📦 Getting ${count} questions from pool (${available} available)`);
      const poolQuestions = getRandomQuestionsFromPool(language.toLowerCase(), count);
      
      return poolQuestions.map(q => ({
        ...q,
        source: 'Curated Pool',
        difficulty: q.difficulty || 'medium'
      }));
      
    } catch (error) {
      console.error('Pool questions failed:', error);
      return [];
    }
  }

  // 🔄 Fragen übersetzen (verbessert)
  async translateQuestions(questions, targetLanguage) {
    if (!questions || questions.length === 0) return [];
    
    try {
      console.log(`🔄 Translating ${questions.length} questions to ${targetLanguage}...`);
      
      const translated = await translationService.translateQuestions(questions, targetLanguage);
      
      if (translated && translated.length > 0) {
        console.log(`✅ Translation complete: ${translated.length} questions`);
        return translated;
      } else {
        console.warn('⚠️ Translation returned empty results, using original');
        return questions;
      }
      
    } catch (translationError) {
      console.warn('⚠️ Translation failed, using original questions:', translationError.message);
      return questions;
    }
  }

  // 🧹 Duplikate entfernen
  removeDuplicates(questions) {
    const seen = new Set();
    const unique = [];
    
    for (const q of questions) {
      const key = q.question.toLowerCase().replace(/[^\w\s]/g, '').trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(q);
      }
    }
    
    console.log(`🧹 Removed ${questions.length - unique.length} duplicates`);
    return unique;
  }

  // 🧠 Question History Management
  getRecentQuestionFingerprints(sessionId) {
    if (!this.recentQuestions.has(sessionId)) {
      this.recentQuestions.set(sessionId, new Set());
    }
    return this.recentQuestions.get(sessionId);
  }

  updateQuestionHistory(sessionId, questions) {
    const fingerprints = this.getRecentQuestionFingerprints(sessionId);
    
    questions.forEach(q => {
      const fingerprint = this.getQuestionFingerprint(q);
      fingerprints.add(fingerprint);
    });

    // Cleanup: Nur letzte 100 Fragen behalten
    if (fingerprints.size > 100) {
      const fingerprintsArray = Array.from(fingerprints);
      const toKeep = fingerprintsArray.slice(-100);
      this.recentQuestions.set(sessionId, new Set(toKeep));
    }

    console.log(`🧠 Updated history for ${sessionId}: ${fingerprints.size} questions`);
  }

  getQuestionFingerprint(question) {
    const normalized = question.question.toLowerCase()
      .replace(/[¿?¡!.,;:]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Standard: Erste 3 wichtige Wörter
    const keywords = normalized.split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3)
      .sort()
      .join('|');
    
    return keywords || normalized.substring(0, 20);
  }

  // LEGACY METHODS (Rückwärts-Kompatibilität mit der alten API)

  // Fragen für Übersetzung filtern
  filterQuestionsForTranslation(questions) {
    return questions.filter(q => {
      if (!q || !q.question) return false;
      if (q.question.length > 150) return false;
      
      const properNouns = (q.question.match(/[A-Z][a-z]+/g) || []).length;
      if (properNouns > 4) return false;
      
      if (q.question.includes('°F') || q.question.includes('mph') || q.question.includes('$')) {
        return false;
      }
      
      return true;
    });
  }

  // Topics für OpenTDB anpassen
  mapTopicsForOpenTdb(topics) {
    const topicMapping = {
      'Mathematik': 'Mathematics',
      'Mathematics': 'Mathematics', 
      'Matemáticas': 'Mathematics',
      'Mathématiques': 'Mathematics',
      'Matematica': 'Mathematics',
      
      'Physik': 'Science',
      'Physics': 'Science',
      'Física': 'Science',
      'Physique': 'Science',
      'Fisica': 'Science',
      
      'Geschichte': 'History',
      'History': 'History',
      'Historia': 'History',
      'Histoire': 'History',
      'Storia': 'History',
      
      'Geographie': 'Geography',
      'Geography': 'Geography',
      'Geografía': 'Geography',
      'Géographie': 'Geography',
      'Geografia': 'Geography',
      
      'Kunst': 'Art',
      'Art': 'Art',
      'Arte': 'Art'
    };

    return topics.map(topic => topicMapping[topic] || 'General').filter(Boolean);
  }

  // Format für App
  formatForApp(questions, language) {
    return questions.map((q, index) => ({
      id: `q_${Date.now()}_${index}`,
      question: q.question,
      topic: q.topic || 'Allgemein',
      answer: q.answer,
      choices: q.choices || null,
      difficulty: q.difficulty || 'medium',
      source: q.source || 'Generated',
      language: language,
      originalLanguage: q.originalLanguage || 'en',
      quality: this.assessQuestionQuality(q),
      metadata: q.metadata || {}
    }));
  }

  // Qualitätsbewertung
  assessQuestionQuality(question) {
    if (!question || !question.question) return 50;
    
    let score = 100;
    
    // Abzug für sehr lange Fragen
    if (question.question.length > 100) score -= 10;
    if (question.question.length > 150) score -= 20;
    
    // Abzug für viele Eigennamen
    const properNouns = (question.question.match(/[A-Z][a-z]+/g) || []).length;
    if (properNouns > 3) score -= 10;
    
    // Bonus für MINT-Kategorien
    if (['Mathematics', 'Science', 'Geography', 'Mathematik', 'Chemie', 'Geographie'].includes(question.topic)) {
      score += 10;
    }
    
    // Bonus für Wikipedia/Pool-Quellen
    if (['Wikidata', 'Curated Pool', 'Generated'].includes(question.source)) {
      score += 15;
    }
    
    return Math.max(score, 50);
  }

  // Utility-Methoden
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Cache Management
  clearCache() {
    if (translationService && translationService.clearCache) {
      translationService.clearCache();
    }
    if (wikipediaMintService && wikipediaMintService.clearCache) {
      wikipediaMintService.clearCache();
    }
    this.recentQuestions.clear();
    console.log('🗑️ All caches cleared');
  }

  clearSessionHistory(sessionId) {
    this.recentQuestions.delete(sessionId);
    console.log(`🧹 Cleared history for session: ${sessionId}`);
  }

  // Service Status
  async getServiceStatus() {
    const poolStats = getPoolStats();
    const status = {
      strategy: this.strategy,
      wikipedia: false,
      openTdb: false,
      pool: poolStats,
      sessions: this.recentQuestions.size,
      supportedLanguages: Object.keys(poolStats),
      timestamp: new Date().toISOString()
    };

    // Test Wikipedia MINT
    try {
      const testMint = await wikipediaMintService.generateMintQuestions(1);
      status.wikipedia = testMint.length > 0;
    } catch (error) {
      status.wikipedia = false;
      status.wikipediaError = error.message;
    }

    // Test OpenTDB
    try {
      const testOpenTdb = await openTdbService.getQuestions(1);
      status.openTdb = testOpenTdb.length > 0;
    } catch (error) {
      status.openTdb = false; 
      status.openTdbError = error.message;
    }

    return status;
  }

  // Sprachstatistiken
  getLanguageStrategy(language) {
    return {
      primary: 'Wikipedia MINT',
      secondary: 'Curated Pool',
      tertiary: language === 'en' ? 'Direct' : 'Google Translate',
      description: `High-quality MINT questions from Wikipedia + curated pool for ${language}`,
      quality: 'Wikipedia-grade accuracy',
      scalability: 'Unlimited via Wikipedia APIs',
      features: [
        'Wikipedia/Wikidata chemistry elements',
        'REST Countries geography data', 
        'Generated perfect math questions',
        'Curated pool backup',
        'Multi-source redundancy'
      ]
    };
  }
}

// Singleton Export
const questionService = new QuestionService();

// Default Export
export default questionService;

// Named Exports für direkte Verwendung
export const generateQuestions = (language, count, options) => 
  questionService.generateQuestions(language, count, options);