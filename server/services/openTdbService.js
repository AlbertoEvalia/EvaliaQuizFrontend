// server/services/openTdbService.js
// OpenTDB Integration mit MINT + grundlegendem Allgemeinwissen

import fetch from 'node-fetch';

const OPENTDB_BASE_URL = 'https://opentdb.com/api.php';

// MINT + sehr grundlegendes Allgemeinwissen
const CATEGORY_MAPPING = {
  'Mathematics': 19,
  'Science': 17,
  'Geography': 22,
  'History': 23,      // Nur sehr grundlegende Geschichte
  'Art': 25,          // Nur weltbekannte Künstler/Komponisten
  'General': 9        // Sehr selektiv
};

class BackendOpenTdbService {
  constructor() {
    this.sessionToken = null;
  }

  // Session Token für Duplicate Prevention
  async getSessionToken() {
    if (this.sessionToken) return this.sessionToken;

    try {
      const response = await fetch('https://opentdb.com/api_token.php?command=request');
      const data = await response.json();
      
      if (data.response_code === 0) {
        this.sessionToken = data.token;
        console.log('✅ OpenTDB Session Token obtained');
        return this.sessionToken;
      }
    } catch (error) {
      console.warn('Failed to get OpenTDB session token:', error.message);
    }
    
    return null;
  }

  // Session Token zurücksetzen
  async resetSessionToken() {
    if (this.sessionToken) {
      try {
        await fetch(`https://opentdb.com/api_token.php?command=reset&token=${this.sessionToken}`);
        console.log('🔄 OpenTDB Session Token reset');
      } catch (error) {
        console.warn('Failed to reset session token:', error.message);
      }
    }
  }

  // Fragen von OpenTDB abrufen
  async getQuestions(count = 20, topics = [], difficulty = 'mixed') {
    try {
      console.log(`📚 Backend loading ${count} questions (MINT + basic knowledge)`);
      
      // Session Token abrufen
      const token = await this.getSessionToken();
      
      // Erweiterte sichere Kategorien (MINT + Basics)
      const defaultTopics = ['Science', 'Geography', 'Mathematics', 'History', 'Art'];
      const safeTopics = topics.length > 0 ? 
        topics.filter(topic => Object.keys(CATEGORY_MAPPING).includes(topic)) :
        defaultTopics;
        
      if (safeTopics.length === 0) {
        safeTopics.push('Science'); // Fallback
      }
      
      console.log(`🎯 Using categories: ${safeTopics.join(', ')}`);
      
      let allQuestions = [];
      const questionsPerCategory = Math.max(1, Math.ceil(count / safeTopics.length));
      
      for (const topic of safeTopics) {
        const categoryId = CATEGORY_MAPPING[topic] || CATEGORY_MAPPING['Science'];
        
        // 🆕 Weniger Fragen laden, da Filter nicht mehr so aggressiv
        const requestCount = questionsPerCategory * 8; // 8x statt 15x
        
        const categoryQuestions = await this.fetchFromCategory(
          requestCount,
          categoryId,
          difficulty,
          token
        );
        
        // 🆕 Filtere für grundlegendes Allgemeinwissen
        const filteredQuestions = categoryQuestions.filter(q => 
          this.isBasicKnowledge(q) && q.type !== 'boolean'
        );
        console.log(`📊 Category ${topic}: ${categoryQuestions.length} raw → ${filteredQuestions.length} basic knowledge`);
        
        allQuestions.push(...filteredQuestions);
      }

      // Auf gewünschte Anzahl begrenzen und shuffeln
      const shuffled = this.shuffleArray(allQuestions);
      const finalQuestions = shuffled.slice(0, count);
      
      console.log(`✅ OpenTDB loaded ${finalQuestions.length} basic knowledge questions`);
      return finalQuestions.map(q => this.formatQuestion(q));

    } catch (error) {
      console.error('OpenTDB service failed:', error);
      throw new Error(`OpenTDB failed: ${error.message}`);
    }
  }

  // 🎯 Prüfe ob Frage grundlegendes Allgemeinwissen ist
  isBasicKnowledge(question) {
    const questionText = question.question.toLowerCase();
    
    // 1. FILTER: True/False und Multiple Choice ausschließen
    if (question.type === 'boolean') {
      console.log(`🚫 Filtered boolean: "${question.question.substring(0, 50)}..."`);
      return false;
    }
    
    const mcPatterns = [
      'which of the following', 'which of these', 'which one of',
      'select the', 'choose the', 'pick the', 'identify the',
      'all of the following except', 'except for'
    ];
    
    for (const pattern of mcPatterns) {
      if (questionText.includes(pattern)) {
        console.log(`🚫 Filtered MC: "${question.question.substring(0, 50)}..."`);
        return false;
      }
    }

    // 2. 🚫 NUR die härtesten Filter - sehr spezifische Sachen
    const definitelyTooHardPatterns = [
      // Corporate/Modern (eindeutig zu spezifisch)
      'microsoft', 'apple', 'google', 'facebook', 'amazon',
      'bill gates', 'steve jobs', 'mark zuckerberg', 'elon musk',
      
      // Pop-Kultur/Entertainment
      'movie', 'film', 'actor', 'actress', 'tv show',
      'netflix', 'disney', 'hollywood', 'celebrity',
      
      // Gaming/Tech
      'video game', 'computer', 'internet', 'smartphone',
      'nintendo', 'playstation', 'xbox',
      
      // Sprichwörter/Redewendungen
      'proverb', 'saying', 'phrase', 'idiom',
      'sprichwort', 'redewendung',
      
      // Sehr spezifische Namen/Begriffe
      'romanisierte', 'romanized', 'transliteration',
      'vollständige titel', 'complete title',
      
      // Sternzeichen/Astrologie (nicht wissenschaftlich)
      'sternzeichen', 'zodiac', 'horoscope', 'astrology',
      
      // Währungen/Geld (zu länderspezifisch)
      'dollar', 'euro', 'pound', 'penny', 'banknote',
      
      // Model-Nummern
      /\b[A-Z]-?\d+\b/, /\bmark \d+\b/, /\bversion \d+\b/,
      
      // Sehr komplexe Phrasen
      'according to', 'based on', 'commonly known as',
      'also known as', 'nicknamed', 'referred to as'
    ];
    
    for (const pattern of definitelyTooHardPatterns) {
      if (typeof pattern === 'string' && questionText.includes(pattern)) {
        console.log(`🚫 Too hard/specific: "${question.question.substring(0, 50)}..."`);
        return false;
      } else if (pattern instanceof RegExp && pattern.test(questionText)) {
        console.log(`🚫 Regex filtered: "${question.question.substring(0, 50)}..."`);
        return false;
      }
    }

    // 3. 🎯 FREEMIUM SWEET SPOT CHECK
    // Prüfe ob Frage im "educated adult" Bereich liegt (nicht zu einfach, nicht zu schwer)
    
    // ❌ ZU EINFACH (langweilig)
    const tooObviousPatterns = [
      /^what color is (the sky|grass|sun)/i,
      /^how many legs does a (dog|cat|bird) have/i,
      /^what do we breathe/i,
      /^is water wet/i,
      /^how many days in a week/i,
      /^what is 1 \+ 1/i
    ];
    
    for (const pattern of tooObviousPatterns) {
      if (pattern.test(questionText)) {
        console.log(`🚫 Too obvious: "${question.question.substring(0, 50)}..."`);
        return false;
      }
    }
    
    // ❌ ZU SCHWER (Universitätsniveau)
    const universityLevelPatterns = [
      // Chemie (Uni-Level)
      "avogadro", "molarity", "ph of pure water", "electron configuration",
      "molecular orbital", "rate constant", "reduction potential",
      "standard enthalpy", "gibbs free energy", "van der waals",
      
      // Mathe (Uni-Level)
      "derivative", "integral", "differential equation", "riemann hypothesis",
      "taylor series", "fourier transform", "limit as x approaches",
      
      // Physik (Uni-Level)  
      "schrödinger", "quantum mechanics", "general relativity",
      "planck constant", "uncertainty principle", "wave function",
      
      // Biologie (Uni-Level)
      "krebs cycle", "electron transport chain", "rna polymerase",
      "dna replication mechanism", "protein synthesis pathway"
    ];
    
    for (const pattern of universityLevelPatterns) {
      if (questionText.includes(pattern)) {
        console.log(`🚫 University level: "${question.question.substring(0, 50)}..."`);
        return false;
      }
    }
    
    // ✅ FREEMIUM SWEET SPOT - Oberstufenwissen
    const goodFreemiumPatterns = [
      // Geographie (Hauptstädte, aber nicht die offensichtlichen)
      /^what is the capital of (australia|canada|brazil|switzerland)/i,
      /^which country has the most/i,
      /^where is mount everest/i,
      
      // Naturwissenschaften (Schulwissen)
      /^what is the chemical symbol for (iron|gold|silver|copper)/i,
      /^which gas makes up most of earth's atmosphere/i,
      /^how many hearts does .* have/i,
      /^what is the largest (planet|mammal|organ)/i,
      
      // Geschichte (wichtige Jahre/Events)
      /^when did world war .* (start|end)/i,
      /^in what year did .* happen/i,
      /^who discovered america/i,
      
      // Mathe (praktisch)
      /^what is \d+% of \d+/i,
      /^how many degrees in a (circle|triangle)/i,
      /^what is the square root of (16|25|36|49|64|81|100)/i
    ];
    
    for (const pattern of goodFreemiumPatterns) {
      if (pattern.test(questionText)) {
        console.log(`✅ Freemium sweet spot: "${question.question.substring(0, 50)}..."`);
        return true;
      }
    }
    
    // 4. ✅ WENN NICHTS GEFUNDEN, DANN WAHRSCHEINLICH OK
    // (Aber nur wenn es durch die ersten Filter kam)
    console.log(`✅ Acceptable question: "${question.question.substring(0, 50)}..."`);
    return true;
  }

  // Fragen aus einer Kategorie
  async fetchFromCategory(amount, categoryId, difficulty, token) {
    let url = `${OPENTDB_BASE_URL}?amount=${amount}&category=${categoryId}`;
    
    // 🆕 Bevorzuge easy/medium für basic knowledge
    if (difficulty === 'mixed') {
      // Keine Difficulty setzen, lass OpenTDB mischen
    } else if (difficulty === 'hard') {
      // Auch bei "hard" nicht zu schwer machen
      url += `&difficulty=medium`;
    } else {
      url += `&difficulty=${difficulty}`;
    }
    
    if (token) {
      url += `&token=${token}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    // Token erschöpft? Reset und retry
    if (data.response_code === 4 && token) {
      await this.resetSessionToken();
      const retryUrl = url.replace(`&token=${token}`, '');
      const retryResponse = await fetch(retryUrl);
      const retryData = await retryResponse.json();
      return retryData.results || [];
    }

    if (data.response_code !== 0) {
      console.warn(`OpenTDB Error Code ${data.response_code} for category ${categoryId}`);
      return [];
    }

    return data.results || [];
  }

  // Frage formatieren
  formatQuestion(openTdbQuestion) {
    return {
      question: this.decodeHtml(openTdbQuestion.question),
      topic: this.mapCategory(openTdbQuestion.category),
      answer: this.decodeHtml(openTdbQuestion.correct_answer),
      choices: null,
      difficulty: openTdbQuestion.difficulty,
      originalCategory: openTdbQuestion.category,
      source: 'OpenTDB',
      type: openTdbQuestion.type
    };
  }

  // Kategorie-Mapping
  mapCategory(openTdbCategory) {
    const categoryMap = {
      'Science & Nature': 'Science',
      'Science: Mathematics': 'Mathematics', 
      'Geography': 'Geography',
      'History': 'History',
      'Art': 'Art',
      'Entertainment: Books': 'Literature',
      'General Knowledge': 'General'
    };
    
    return categoryMap[openTdbCategory] || 'General';
  }

  // HTML Entities dekodieren
  decodeHtml(html) {
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'",
      '&apos;': "'",
      '&nbsp;': ' ',
      '&hellip;': '...',
      '&mdash;': '—',
      '&ndash;': '–'
    };
    
    return html.replace(/&[#\w]+;/g, entity => entities[entity] || entity);
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

  // Service Status
  async getStatus() {
    try {
      const testQuestions = await this.getQuestions(1);
      return {
        available: testQuestions.length > 0,
        sessionToken: !!this.sessionToken,
        filtering: 'MINT + Basic Knowledge'
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
}

export const openTdbService = new BackendOpenTdbService();