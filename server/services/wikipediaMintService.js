// server/services/wikipediaMintService.js
// Wikipedia-basierte Allgemeinkultur-Fragen (MINT + Kunst/Kultur) - Translation-Safe

import fetch from 'node-fetch';

class WikipediaMintService {
  constructor() {
    this.baseUrl = 'https://query.wikidata.org/sparql';
    this.restCountriesUrl = 'https://restcountries.com/v3.1';
    this.cache = new Map();
  }

  // 🧪 CHEMIE: Nur die 15 wichtigsten Elemente (Allgemeinwissen)
  async getChemistryQuestions(count = 3) {
    const cacheKey = 'chemistry_basic_elements';
    
    if (!this.cache.has(cacheKey)) {
      // Statische Liste der wichtigsten Elemente (die jeder kennen sollte)
      const basicElements = [
        {elementLabel: 'Hydrogen', symbol: 'H', atomicNumber: 1},
        {elementLabel: 'Helium', symbol: 'He', atomicNumber: 2},
        {elementLabel: 'Carbon', symbol: 'C', atomicNumber: 6},
        {elementLabel: 'Nitrogen', symbol: 'N', atomicNumber: 7},
        {elementLabel: 'Oxygen', symbol: 'O', atomicNumber: 8},
        {elementLabel: 'Sodium', symbol: 'Na', atomicNumber: 11},
        {elementLabel: 'Magnesium', symbol: 'Mg', atomicNumber: 12},
        {elementLabel: 'Aluminum', symbol: 'Al', atomicNumber: 13},
        {elementLabel: 'Chlorine', symbol: 'Cl', atomicNumber: 17},
        {elementLabel: 'Potassium', symbol: 'K', atomicNumber: 19},
        {elementLabel: 'Calcium', symbol: 'Ca', atomicNumber: 20},
        {elementLabel: 'Iron', symbol: 'Fe', atomicNumber: 26},
        {elementLabel: 'Copper', symbol: 'Cu', atomicNumber: 29},
        {elementLabel: 'Silver', symbol: 'Ag', atomicNumber: 47},
        {elementLabel: 'Gold', symbol: 'Au', atomicNumber: 79}
      ];
      
      this.cache.set(cacheKey, basicElements);
    }

    const elements = this.cache.get(cacheKey);
    const selected = this.shuffleArray(elements).slice(0, count);
    
    return selected.map(el => ({
      question: `Which element has the symbol ${el.symbol}?`,
      topic: 'Chemistry',
      answer: el.elementLabel,
      difficulty: 'medium',
      source: 'Curated Chemistry',
      metadata: { atomicNumber: el.atomicNumber, type: 'basic_elements' }
    }));
  }

  // 🌍 GEOGRAPHIE: Nur wichtige/bekannte Länder (nicht Mikronesien!)
  async getGeographyQuestions(count = 6) {
    const cacheKey = 'geography_major_countries';
    
    if (!this.cache.has(cacheKey)) {
      // Wichtigste Länder für Allgemeinbildung (Translation-Safe)
      const majorCountries = [
        {country: 'Germany', capital: 'Berlin'},
        {country: 'France', capital: 'Paris'},
        {country: 'Italy', capital: 'Rome'},
        {country: 'Spain', capital: 'Madrid'},
        {country: 'United Kingdom', capital: 'London'},
        {country: 'Russia', capital: 'Moscow'},
        {country: 'China', capital: 'Beijing'},
        {country: 'Japan', capital: 'Tokyo'},
        {country: 'India', capital: 'New Delhi'},
        {country: 'USA', capital: 'Washington D.C.'},
        {country: 'Canada', capital: 'Ottawa'},
        {country: 'Brazil', capital: 'Brasília'},
        {country: 'Australia', capital: 'Canberra'},
        {country: 'Egypt', capital: 'Cairo'},
        {country: 'South Africa', capital: 'Cape Town'},
        {country: 'Argentina', capital: 'Buenos Aires'},
        {country: 'Turkey', capital: 'Ankara'},
        {country: 'Greece', capital: 'Athens'},
        {country: 'Sweden', capital: 'Stockholm'},
        {country: 'Norway', capital: 'Oslo'}
      ];
      
      this.cache.set(cacheKey, majorCountries);
    }

    const countries = this.cache.get(cacheKey);
    const selected = this.shuffleArray(countries).slice(0, count);
    
    return selected.map(c => ({
      question: `What is the capital of ${c.country}?`,
      topic: 'Geography',
      answer: c.capital,
      difficulty: 'medium',
      source: 'Curated Geography',
      metadata: { country: c.country, type: 'major_capitals' }
    }));
  }

  // 🔢 MATHEMATIK: Praktische Alltagsmathematik
  async getMathQuestions(count = 5) {
    const questions = [];
    
    // Prozentrechnung (40%)
    for (let i = 0; i < Math.ceil(count * 0.4); i++) {
      const percentage = [10, 15, 20, 25, 30, 40, 50][Math.floor(Math.random() * 7)];
      const base = [100, 200, 300, 400, 500][Math.floor(Math.random() * 5)];
      const answer = (percentage / 100) * base;
      
      questions.push({
        question: `What is ${percentage}% of ${base}?`,
        topic: 'Mathematics',
        answer: answer.toString(),
        difficulty: 'easy',
        source: 'Generated Math',
        metadata: { type: 'percentage' }
      });
    }
    
    // Quadratwurzeln (30%) - nur perfekte Quadrate
    const perfectSquares = [
      {num: 4, root: 2}, {num: 9, root: 3}, {num: 16, root: 4},
      {num: 25, root: 5}, {num: 36, root: 6}, {num: 49, root: 7},
      {num: 64, root: 8}, {num: 81, root: 9}, {num: 100, root: 10}
    ];
    
    for (let i = 0; i < Math.ceil(count * 0.3); i++) {
      const square = perfectSquares[Math.floor(Math.random() * perfectSquares.length)];
      questions.push({
        question: `What is the square root of ${square.num}?`,
        topic: 'Mathematics',
        answer: square.root.toString(),
        difficulty: 'easy',
        source: 'Generated Math',
        metadata: { type: 'square_root' }
      });
    }
    
    // Geometrie (30%) - Grundformen
    const shapes = [
      {name: 'triangle', sides: 3}, {name: 'square', sides: 4},
      {name: 'pentagon', sides: 5}, {name: 'hexagon', sides: 6},
      {name: 'octagon', sides: 8}
    ];
    
    for (let i = 0; i < Math.ceil(count * 0.3); i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      questions.push({
        question: `How many sides does a ${shape.name} have?`,
        topic: 'Mathematics',
        answer: shape.sides.toString(),
        difficulty: 'easy',
        source: 'Generated Math',
        metadata: { type: 'geometry' }
      });
    }
    
    return questions.slice(0, count);
  }

  // 🌌 ASTRONOMIE: Sonnensystem-Basics (Translation-Safe)
  async getAstronomyQuestions(count = 3) {
    const astronomyFacts = [
      {
        question: 'Which planet is closest to the sun?',
        answer: 'Mercury',
        difficulty: 'easy'
      },
      {
        question: 'Which is the largest planet in our solar system?',
        answer: 'Jupiter',
        difficulty: 'easy'
      },
      {
        question: 'Which planet is known as the "Red Planet"?',
        answer: 'Mars',
        difficulty: 'medium'
      },
      {
        question: 'How many planets are there in our solar system?',
        answer: '8',
        difficulty: 'easy'
      },
      {
        question: 'Which planet has the most rings?',
        answer: 'Saturn',
        difficulty: 'medium'
      },
      {
        question: 'What is the natural satellite of Earth called?',
        answer: 'Moon',
        difficulty: 'easy'
      }
    ];
    
    return this.shuffleArray(astronomyFacts)
      .slice(0, count)
      .map(fact => ({
        ...fact,
        topic: 'Astronomy',
        source: 'Curated Astronomy',
        metadata: { type: 'solar_system' }
      }));
  }

  // 🧬 BIOLOGIE: Alltags-Biologie (Translation-Safe & Biologisch korrekt)
  async getBiologyQuestions(count = 2) {
    const bioFacts = [
      {
        question: 'Which organ pumps blood through the body?',
        answer: 'Heart',
        difficulty: 'easy'
      },
      {
        question: 'How many legs do spiders typically have?',  // ✅ Klarstellung
        answer: '8',
        difficulty: 'easy'
      },
      {
        question: 'How many chambers does the human heart have?',
        answer: '4',
        difficulty: 'medium'
      },
      {
        question: 'Which gas do plants absorb for photosynthesis?',
        answer: 'Carbon dioxide',
        difficulty: 'medium'
      },
      {
        question: 'How many legs do insects typically have?',  // ✅ Biologisch präzise
        answer: '6',
        difficulty: 'easy'
      },
      {
        question: 'What is the largest mammal?',
        answer: 'Blue whale',
        difficulty: 'medium'
      },
      {
        question: 'Which gas do humans breathe in?',
        answer: 'Oxygen',
        difficulty: 'easy'
      }
    ];
    
    return this.shuffleArray(bioFacts)
      .slice(0, count)
      .map(fact => ({
        ...fact,
        topic: 'Biology',
        source: 'Curated Biology',
        metadata: { type: 'basic_biology' }
      }));
  }

  // 🎨 KUNST: Die 20 bekanntesten Maler (Translation-Safe)
  async getArtQuestions(count = 4) {
    const cacheKey = 'art_famous_painters';
    
    if (!this.cache.has(cacheKey)) {
      // Die 20 bekanntesten Maler/Kunstwerke (Translation-Safe Formulierungen)
      const famousArt = [
        {question: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci'},
        {question: 'Who painted "Starry Night"?', answer: 'Vincent van Gogh'},
        {question: 'Who painted the Sistine Chapel?', answer: 'Michelangelo'},
        {question: 'Who painted "Guernica"?', answer: 'Pablo Picasso'},
        {question: 'Who painted "The Last Supper"?', answer: 'Leonardo da Vinci'},
        {question: 'Who painted "The Birth of Venus"?', answer: 'Sandro Botticelli'},
        {question: 'Who painted "Girl with a Pearl Earring"?', answer: 'Johannes Vermeer'},
        {question: 'Who painted "The Night Watch"?', answer: 'Rembrandt'},
        {question: 'Who painted "The Scream"?', answer: 'Edvard Munch'},
        {question: 'Who painted "Sunflowers"?', answer: 'Vincent van Gogh'},
        {question: 'Who painted "American Gothic"?', answer: 'Grant Wood'},
        {question: 'Who painted "The Persistence of Memory"?', answer: 'Salvador Dalí'},
        {question: 'Who painted "Liberty Leading the People"?', answer: 'Eugène Delacroix'},
        {question: 'Who sculpted the statue "David"?', answer: 'Michelangelo'},  // ✅ "sculpted" statt "created"
        {question: 'Who painted "The Great Bull"?', answer: 'Pablo Picasso'}
      ];
      
      this.cache.set(cacheKey, famousArt);
    }

    const artQuestions = this.cache.get(cacheKey);
    const selected = this.shuffleArray(artQuestions).slice(0, count);
    
    return selected.map(art => ({
      question: art.question,
      topic: 'Art',
      answer: art.answer,
      difficulty: 'medium',
      source: 'Curated Art',
      metadata: { type: 'famous_paintings' }
    }));
  }

  // 🎵 MUSIK: Die bekanntesten Komponisten (Translation-Safe)
  async getMusicQuestions(count = 3) {
    const cacheKey = 'music_famous_composers';
    
    if (!this.cache.has(cacheKey)) {
      // Die bekanntesten Komponisten/Werke (Translation-Safe Formulierungen)
      const famousMusic = [
        {question: 'Who composed the "9th Symphony"?', answer: 'Ludwig van Beethoven'},
        {question: 'Who composed "Eine kleine Nachtmusik"?', answer: 'Wolfgang Amadeus Mozart'},
        {question: 'Who composed "The Four Seasons"?', answer: 'Antonio Vivaldi'},
        {question: 'Who composed the "Brandenburg Concerto"?', answer: 'Johann Sebastian Bach'},
        {question: 'Who composed "Carmen"?', answer: 'Georges Bizet'},
        {question: 'Who composed "Swan Lake"?', answer: 'Pyotr Ilyich Tchaikovsky'},
        {question: 'Who composed "The Magic Flute"?', answer: 'Wolfgang Amadeus Mozart'},
        {question: 'Who composed "Bolero"?', answer: 'Maurice Ravel'},
        {question: 'Who composed "Moonlight Sonata"?', answer: 'Ludwig van Beethoven'},
        {question: 'Who composed "La Traviata"?', answer: 'Giuseppe Verdi'}
      ];
      
      this.cache.set(cacheKey, famousMusic);
    }

    const musicQuestions = this.cache.get(cacheKey);
    const selected = this.shuffleArray(musicQuestions).slice(0, count);
    
    return selected.map(music => ({
      question: music.question,
      topic: 'Music',
      answer: music.answer,
      difficulty: 'medium',
      source: 'Curated Music',
      metadata: { type: 'famous_composers' }
    }));
  }

  // 📚 GESCHICHTE: Wichtige Ereignisse (Translation-Safe)
  async getHistoryQuestions(count = 2) {
    const historyFacts = [
      {
        question: 'In which year did World War II end?',
        answer: '1945',
        difficulty: 'medium'
      },
      {
        question: 'Who discovered America in 1492?',
        answer: 'Christopher Columbus',
        difficulty: 'medium'
      },
      {
        question: 'In which year did the Berlin Wall fall?',
        answer: '1989',
        difficulty: 'medium'
      },
      {
        question: 'Who was the first person on the moon?',
        answer: 'Neil Armstrong',
        difficulty: 'medium'
      },
      {
        question: 'In which year did World War I begin?',
        answer: '1914',
        difficulty: 'medium'
      },
      {
        question: 'In which year did the Titanic sink?',  // ✅ "sink" statt "was built"
        answer: '1912',
        difficulty: 'hard'
      }
    ];
    
    return this.shuffleArray(historyFacts)
      .slice(0, count)
      .map(fact => ({
        ...fact,
        topic: 'History',
        source: 'Curated History',
        metadata: { type: 'major_events' }
      }));
  }

  // 🎲 Utility: Array shuffeln
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 🎯 HAUPTFUNKTION: Ausgewogene Allgemeinkultur-Fragen
  async generateMintQuestions(count = 20) {
    try {
      console.log(`🎓 Generating ${count} general culture questions (MINT + Arts - Translation Safe)`);
      
      // 🎯 AUSGEWOGENE VERTEILUNG für Allgemeinkultur
      const distribution = {
        geography: Math.ceil(count * 0.25),    // 25% Geographie
        mathematics: Math.ceil(count * 0.20),  // 20% Mathematik
        art: Math.ceil(count * 0.15),          // 15% Kunst
        chemistry: Math.ceil(count * 0.12),    // 12% Chemie (reduziert!)
        astronomy: Math.ceil(count * 0.12),    // 12% Astronomie
        music: Math.ceil(count * 0.08),        // 8% Musik
        biology: Math.ceil(count * 0.08)       // 8% Biologie
      };
      
      console.log('🎨 Distribution with Arts (Translation Safe):', distribution);
      
      const [geography, mathematics, art, chemistry, astronomy, music, biology] = await Promise.all([
        this.getGeographyQuestions(distribution.geography),
        this.getMathQuestions(distribution.mathematics),
        this.getArtQuestions(distribution.art),
        this.getChemistryQuestions(distribution.chemistry),
        this.getAstronomyQuestions(distribution.astronomy),
        this.getMusicQuestions(distribution.music),
        this.getBiologyQuestions(distribution.biology)
      ]);
      
      const allQuestions = [
        ...geography,
        ...mathematics,
        ...art,
        ...chemistry,
        ...astronomy, 
        ...music,
        ...biology
      ];
      
      // Bessere Duplikate-Entfernung
      const uniqueQuestions = this.removeDuplicates(allQuestions);
      const shuffled = this.shuffleArray(uniqueQuestions);
      const final = shuffled.slice(0, count);
      
      console.log(`✅ Generated ${final.length} translation-safe general culture questions`);
      console.log('📊 Sources used:', [...new Set(final.map(q => q.source))]);
      console.log('🏷️ Topics covered:', [...new Set(final.map(q => q.topic))]);
      
      return final;
      
    } catch (error) {
      console.error('General culture question generation failed:', error);
      throw error;
    }
  }

  // 🧹 Verbesserte Duplikate-Entfernung
  removeDuplicates(questions) {
    const seen = new Set();
    const unique = [];
    
    for (const q of questions) {
      // Normalisiere für bessere Duplikate-Erkennung
      const normalized = q.question.toLowerCase()
        .replace(/[„"'']/g, '"')     // Anführungszeichen vereinheitlichen
        .replace(/\s+/g, ' ')        // Leerzeichen normalisieren
        .replace(/[¿?¡!.,;:]/g, '')  // Satzzeichen entfernen
        .trim();
      
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(q);
      } else {
        console.log(`🔄 Duplicate removed: "${q.question.substring(0, 40)}..."`);
      }
    }
    
    console.log(`🧹 Removed ${questions.length - unique.length} duplicates`);
    return unique;
  }

  // 📊 Cache-Status
  getCacheStats() {
    return {
      cached_datasets: Array.from(this.cache.keys()),
      cache_size: this.cache.size,
      strategy: 'General Culture (MINT + Arts) - Translation Safe',
      last_updated: new Date().toISOString()
    };
  }

  // 🧹 Cache löschen
  clearCache() {
    this.cache.clear();
    console.log('🧹 General culture cache cleared');
  }
}

// Export
export const wikipediaMintService = new WikipediaMintService();