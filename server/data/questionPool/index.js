// src/data/questionPool/index.js
// Haupt-Export für alle Sprachen

import { QUESTIONS_DE } from './questions_de.js';
import { QUESTIONS_EN } from './questions_en.js';
import { QUESTIONS_FR } from './questions_fr.js';
import { QUESTIONS_ES } from './questions_es.js';
import { QUESTIONS_IT } from './questions_it.js';


// Haupt-Pool mit allen Sprachen
export const QUESTION_POOL = {
  de: QUESTIONS_DE,
  en: QUESTIONS_EN,
  fr: QUESTIONS_FR,
  es: QUESTIONS_ES,
  it: QUESTIONS_IT
};


// TOPIC-GRUPPEN für intelligente Verteilung (alle Sprachen)
const TOPIC_GROUPS = {
  "Mathematik & Astronomie": {
    en: ["Mathematics", "Astronomy"],
    de: ["Mathematik", "Astronomie"],
    fr: ["Mathématiques", "Astronomie"],
    es: ["Matemáticas", "Astronomía"],
    it: ["Matematica", "Astronomia"]
  },
  "Geschichte": {
    en: ["History"],
    de: ["Geschichte"],
    fr: ["Histoire"],
    es: ["Historia"],
    it: ["Storia"]
  },
  "Geographie": {
    en: ["Geography"],
    de: ["Geographie"],
    fr: ["Géographie"],
    es: ["Geografía"],
    it: ["Geografia"]
  },
  "Kunst & Kultur": {
    en: ["Art", "Literature", "Music"],
    de: ["Kunst", "Literatur", "Musik"],
    fr: ["Art", "Littérature", "Musique"],
    es: ["Arte", "Literatura", "Música"],
    it: ["Arte", "Letteratura", "Musica"]
  },
  "Naturwissenschaften": {
    en: ["Biology", "Chemistry"],
    de: ["Biologie", "Chemie"],
    fr: ["Biologie", "Chimie"],
    es: ["Biología", "Química"],
    it: ["Biologia", "Chimica"]
  }
};


// INTELLIGENTE QUESTION SELECTION mit 5-Gruppen-Verteilung
export const getRandomQuestionsFromPool = (language, count = 20) => {
  const pool = QUESTION_POOL[language.toLowerCase()] || QUESTION_POOL.de || [];
  const langCode = language.toLowerCase();
  
  console.log(`🎯 INTELLIGENTE GRUPPENVERTEILUNG für ${language} (${count} Fragen)`);
  
  // Fallback wenn Pool leer ist
  if (pool.length === 0) {
    console.log(`⚠️ Kein Pool für ${language}, verwende deutschen Pool als Fallback`);
    return getRandomQuestionsFromPool('de', count);
  }
  
  // Ziel: 5 Gruppen gleichmäßig verteilt
  const questionsPerGroup = Math.floor(count / 5); // 20→4, 50→10, 100→20
  const extraQuestions = count % 5; // Rest verteilen
  
  const selectedQuestions = [];
  const groupStats = {};
  
  // Für jede Gruppe Fragen auswählen
  Object.entries(TOPIC_GROUPS).forEach(([groupName, topics], groupIndex) => {
    const topicsForLang = topics[langCode] || topics.de || [];
    
    // Alle verfügbaren Fragen für diese Gruppe sammeln
    const groupQuestions = pool.filter(q => 
      topicsForLang.some(topic => topic.toLowerCase() === q.topic.toLowerCase())
    );
    
    // Anzahl Fragen für diese Gruppe berechnen
    let targetCount = questionsPerGroup;
    if (groupIndex < extraQuestions) {
      targetCount += 1; // Erste Gruppen bekommen die Extra-Fragen
    }
    
    // Zufällige Auswahl aus der Gruppe
    const shuffledGroupQuestions = shuffleArray([...groupQuestions]);
    const selectedFromGroup = shuffledGroupQuestions.slice(0, Math.min(targetCount, shuffledGroupQuestions.length));
    
    selectedQuestions.push(...selectedFromGroup);
    groupStats[groupName] = selectedFromGroup.length;
    
    console.log(`📚 ${groupName}: ${selectedFromGroup.length} Fragen aus [${topicsForLang.join(', ')}]`);
  });
  
  console.log(`✅ FINALE VERTEILUNG:`, groupStats);
  console.log(`📊 Total: ${selectedQuestions.length}/${count} Fragen`);
  
  // Falls noch Fragen fehlen, fülle mit zufälligen Fragen auf
  if (selectedQuestions.length < count) {
    const usedQuestions = new Set(selectedQuestions.map(q => q.question));
    const remainingQuestions = pool.filter(q => !usedQuestions.has(q.question));
    const additionalNeeded = count - selectedQuestions.length;
    
    const shuffledRemaining = shuffleArray(remainingQuestions);
    selectedQuestions.push(...shuffledRemaining.slice(0, additionalNeeded));
    
    console.log(`🔄 Zusätzlich ${additionalNeeded} Fragen hinzugefügt`);
  }
  
  // Final shuffle für gute Mischung
  return shuffleArray(selectedQuestions);
};
// Pool-Statistiken
export const getPoolStats = () => {
  const stats = {};
  Object.keys(QUESTION_POOL).forEach(lang => {
    stats[lang] = QUESTION_POOL[lang].length;
  });
  return stats;
};

// Shuffle-Funktion
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Fragen nach Topic filtern
export const getQuestionsByTopic = (language, topic) => {
  const pool = QUESTION_POOL[language.toLowerCase()] || QUESTION_POOL.de || [];
  return pool.filter(q => q.topic === topic);
};

// Alle verfügbaren Topics für eine Sprache
export const getAvailableTopics = (language) => {
  const pool = QUESTION_POOL[language.toLowerCase()] || QUESTION_POOL.de || [];
  return [...new Set(pool.map(q => q.topic))];
};

// Topic-Gruppen für ResultsScreen
export const getTopicGroups = () => {
  return TOPIC_GROUPS;
};