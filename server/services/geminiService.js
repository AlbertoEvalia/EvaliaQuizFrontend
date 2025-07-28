import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRandomQuestionsFromPool, getPoolStats, getTopicGroups } from '../data/questionPool/index.js';

// Nur noch für Evaluation benötigt
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY missing - nur Pool-Modus verfügbar');
}

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Sprach-Konfiguration
const LANGUAGE_CONFIG = {
  'en': { name: 'English', geminiName: 'English', instruction: 'Ask and answer in English' },
  'de': { name: 'German', geminiName: 'German', instruction: 'Stelle Fragen und antworte auf Deutsch' },
  'fr': { name: 'French', geminiName: 'French', instruction: 'Posez des questions et répondez en français' },
  'es': { name: 'Spanish', geminiName: 'Spanish', instruction: 'Haz preguntas y responde en español' },
  'it': { name: 'Italian', geminiName: 'Italian', instruction: 'Fai domande e rispondi in italiano' }
};

const getLanguageConfig = (language) => {
  const langKey = language.toLowerCase();
  return LANGUAGE_CONFIG[langKey] || 
    Object.values(LANGUAGE_CONFIG).find(config => 
      config.name.toLowerCase() === langKey || config.geminiName.toLowerCase() === langKey
    ) || LANGUAGE_CONFIG.en;
};

const extractJSON = (text) => {
  const jsonMatch = text.match(/{[\s\S]*}|\[[\s\S]*]/);
  try {
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
  } catch (error) {
    console.error('JSON parse failed:', error);
    throw new Error('Invalid JSON response');
  }
};

// ========================================
// 🎯 NEUE POOL-ONLY FRAGENGENERIERUNG
// ========================================

export const generateQuestions = async (language = 'en', count = 20, usePoolOnly = true) => {
  const langConfig = getLanguageConfig(language);
  const timestamp = Date.now();
  
  console.log(`🎯 PURE POOL MODE: ${count} Fragen für ${langConfig.name}`);
  
  try {
    // Pool-Statistiken anzeigen
    const poolStats = getPoolStats();
    console.log(`📊 Verfügbare Pool-Größen:`, poolStats);
    
    const availablePoolSize = poolStats[language.toLowerCase()] || 0;
    
    // Prüfen ob genug Fragen vorhanden
    if (availablePoolSize === 0) {
      console.log(`⚠️ Kein Pool für ${language} vorhanden`);
      
      // Fallback auf deutsche Fragen wenn möglich
      if (language !== 'de' && poolStats.de > 0) {
        console.log(`🔄 Fallback: Verwende deutschen Pool (${poolStats.de} Fragen)`);
        return generateQuestions('de', count, true);
      }
      
      throw new Error(`Keine Pool-Fragen für ${language} verfügbar`);
    }
    
    if (availablePoolSize < count) {
      console.log(`⚠️ Pool hat nur ${availablePoolSize} Fragen, aber ${count} angefragt`);
      console.log(`📝 Empfehlung: Pool erweitern oder weniger Fragen anfordern`);
    }
    
    // Intelligente Pool-Auswahl mit Gruppenverteilung
    const poolQuestions = getRandomQuestionsFromPool(language, count);
    
    // Analyse der finalen Verteilung
    const topicGroups = getTopicGroups();
    const langCode = language.toLowerCase();
    const finalStats = {};
    
    Object.entries(topicGroups).forEach(([groupName, topics]) => {
      const topicsForLang = topics[langCode] || topics.de || [];
      const groupCount = poolQuestions.filter(q => 
        topicsForLang.some(topic => topic.toLowerCase() === q.topic.toLowerCase())
      ).length;
      finalStats[groupName] = groupCount;
    });
    
    // Formatierung für Quiz-System
    const formattedQuestions = poolQuestions.map((q, index) => ({
      question: q.question,
      topic: q.topic,
      referenceAnswer: q.answer,
      language: language,
      languageName: langConfig.name,
      generatedAt: timestamp,
      seed: `pool-${timestamp}-${index}`,
      source: 'curated_pool',
      // Zusätzliche Metadaten für Debugging
      difficulty: q.difficulty || 'medium',
      category: q.category || 'general',
      originalIndex: index
    }));
    
    console.log(`✅ FINALE STATISTIKEN:`);
    console.log(`📊 Gruppenverteilung:`, finalStats);
    console.log(`🎯 Verwendete Fragen: ${formattedQuestions.length}/${count}`);
    console.log(`🔄 Pool-Abdeckung: ${Math.round((formattedQuestions.length/availablePoolSize)*100)}%`);
    console.log(`✨ Pool-Only Generierung erfolgreich!`);
    
    return formattedQuestions;
    
  } catch (error) {
    console.error(`❌ Pool-Only Generierung fehlgeschlagen:`, error.message);
    
    // Letzter Fallback: Minimaler Pool mit verfügbaren Fragen
    try {
      const emergencyQuestions = getRandomQuestionsFromPool(language, Math.min(count, 10));
      console.log(`🆘 Notfall-Fallback: ${emergencyQuestions.length} Fragen`);
      
      return emergencyQuestions.map((q, index) => ({
        question: q.question,
        topic: q.topic,
        referenceAnswer: q.answer,
        language: language,
        languageName: langConfig.name,
        generatedAt: timestamp,
        seed: `emergency-${timestamp}-${index}`,
        source: 'emergency_pool'
      }));
      
    } catch (fallbackError) {
      console.error(`❌ Auch Notfall-Fallback fehlgeschlagen:`, fallbackError.message);
      throw new Error(`Keine Fragen verfügbar für ${language}. Pool muss erweitert werden.`);
    }
  }
};

// ========================================
// 🔍 VERBESSERTE POOL-EVALUATION
// ========================================

export const evaluateAnswer = async (question, answer, language = 'en') => {
  const langConfig = getLanguageConfig(language);
  
  console.log(`🔍 Pool-Evaluation: "${answer}" (${langConfig.name})`);
  
  // Fallback wenn kein Gemini verfügbar
  if (!genAI) {
    console.log(`⚠️ Gemini nicht verfügbar - verwende einfache String-Matching`);
    return simpleEvaluation(question, answer, language);
  }
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { temperature: 0.1, maxOutputTokens: 400 } // Weniger kreativ!
  });

  // PRÄZISER EVALUATION-PROMPT
  const prompt = `Question: "${question}"
Answer: "${answer}"
Language: ${langConfig.geminiName}

🎯 PRECISE CURATED POOL EVALUATION - Be strict and factual!

STRICT SCORING RULES:
100 = EXACT correct answer (perfect match of facts)
90-95 = Correct answer with minor spelling variations (1-2 letters off)
80-85 = Correct answer but incomplete (partial names, missing details)
60-75 = Shows some knowledge but factually incomplete
40-55 = Related to topic but factually wrong
20-35 = Wrong category/type (e.g., "Sun" when asked for "Planet")
0-15 = Completely wrong or nonsensical

CRITICAL RULES:
❌ WRONG CATEGORY = LOW SCORE: If question asks for "Planet" and answer is "Star", score 20-35 max
❌ FACTUAL ERRORS = LOW SCORE: Incorrect facts get 0-55, not high scores
❌ DON'T INVENT TYPOS: "armstrong" vs "Armstrong" is just capitalization, not a typo
❌ BE FACTUAL: Only award high scores (80+) for factually correct answers

ACCEPTABLE VARIATIONS:
✅ Capitalization: "armstrong" = "Armstrong" = 100 points
✅ Minor spelling: "Shakespear" = "Shakespeare" = 90 points  
✅ Partial names: "Einstein" = "Albert Einstein" = 95 points
✅ Synonyms: "Car" = "Automobile" = 100 points

EXAMPLES:
"Welcher Planet ist heißeste?" + "Sonne" = 25 (wrong category - sun is star, not planet)
"Welcher Planet ist heißeste?" + "Venus" = 100 (correct!)
"Wer war erster Mensch auf Mond?" + "armstrong" = 100 (correct, just lowercase)
"Wer war erster Mensch auf Mond?" + "Neil Armstrong" = 100 (perfect!)
"Wer schrieb Hamlet?" + "Shakespear" = 90 (1 letter typo)
"Was ist 2+2?" + "Vier" = 100 (written form of number)

SPECIFIC CASES:
📅 YEARS: ±1 year = 60-70 points max, ±2-5 years = 40-50 points
📅 CENTURIES: "20" for "20. Jahrhundert" = 90-95 points (incomplete but correct)
📅 CENTURIES: "20th" for "20. Jahrhundert" = 100 points (equivalent)

EXAMPLES:
"In welchem Jahr entdeckte Kolumbus Amerika?" + "1493" = 65 (1 year off)
"In welchem Jahrhundert endete Zarenherrschaft?" + "20" = 95 (incomplete but correct)
"In welchem Jahrhundert endete Zarenherrschaft?" + "20. Jahrhundert" = 100 (perfect)


BE STRICT BUT FAIR - Reward correct facts, penalize wrong facts!

Return JSON:
{"score": 0-100, "feedback": "Brief encouraging ${langConfig.geminiName} response", "isCorrect": true/false}`;

  try {
    const result = await model.generateContent(prompt);
    const evaluation = extractJSON(result.response.text());
    
    const { score, feedback, isCorrect } = evaluation;
    
    if (typeof score !== 'number' || !feedback || typeof isCorrect !== 'boolean') {
      throw new Error('Invalid evaluation response structure');
    }
    
    console.log(`✅ Pool-Evaluation: Score ${score}, Korrekt: ${isCorrect}`);
    return { score, feedback, isCorrect };
    
  } catch (error) {
    console.error('❌ Gemini-Evaluation fehlgeschlagen:', error.message);
    console.log('🔄 Fallback auf String-Matching');
    return simpleEvaluation(question, answer, language);
  }
};

// ========================================
// 🔧 FALLBACK EVALUATION OHNE GEMINI
// ========================================

const simpleEvaluation = (question, answer, language) => {
  const langConfig = getLanguageConfig(language);
  
  // Einfache String-basierte Evaluation
  const normalizedAnswer = answer.toLowerCase().trim();
  
  // Sehr grundlegende Bewertung
  let score = 0;
  let feedback = '';
  let isCorrect = false;
  
  if (normalizedAnswer.length === 0) {
    score = 0;
    feedback = langConfig.name === 'German' ? 'Bitte gib eine Antwort ein.' : 'Please provide an answer.';
  } else if (normalizedAnswer.length < 2) {
    score = 20;
    feedback = langConfig.name === 'German' ? 'Die Antwort ist sehr kurz.' : 'The answer is very short.';
  } else if (normalizedAnswer.length > 2) {
    score = 60; // Moderate Bewertung wenn nicht leer
    feedback = langConfig.name === 'German' ? 'Antwort erhalten - für genauere Bewertung ist eine KI-Evaluation empfohlen.' : 'Answer received - AI evaluation recommended for accurate scoring.';
  }
  
  isCorrect = score >= 70;
  
  console.log(`🔧 Einfache Evaluation: Score ${score}`);
  return { score, feedback, isCorrect };
};

// ========================================
// 🛠️ POOL-MANAGEMENT FUNKTIONEN
// ========================================

export const getPoolInformation = () => {
  const stats = getPoolStats();
  const topicGroups = getTopicGroups();
  
  return {
    totalQuestions: Object.values(stats).reduce((sum, count) => sum + count, 0),
    languageStats: stats,
    topicGroups,
    availableLanguages: Object.keys(stats).filter(lang => stats[lang] > 0),
    recommendations: generatePoolRecommendations(stats)
  };
};

const generatePoolRecommendations = (stats) => {
  const recommendations = [];
  
  Object.entries(stats).forEach(([lang, count]) => {
    if (count === 0) {
      recommendations.push(`❌ ${lang.toUpperCase()}: Keine Fragen vorhanden - Pool erstellen erforderlich`);
    } else if (count < 20) {
      recommendations.push(`⚠️ ${lang.toUpperCase()}: Nur ${count} Fragen - mindestens 50 empfohlen`);
    } else if (count < 50) {
      recommendations.push(`📝 ${lang.toUpperCase()}: ${count} Fragen - 100+ für bessere Vielfalt empfohlen`);
    } else {
      recommendations.push(`✅ ${lang.toUpperCase()}: ${count} Fragen - ausreichend für Quizzes`);
    }
  });
  
  return recommendations;
};

// Test-Funktion für Pool-System
export const testPoolSystem = async (language = 'de') => {
  console.log(`🧪 POOL-SYSTEM TEST für ${language.toUpperCase()}`);
  
  try {
    const info = getPoolInformation();
    console.log('📊 Pool-Informationen:', info);
    
    const testQuestions = await generateQuestions(language, 10);
    console.log(`✅ Test erfolgreich: ${testQuestions.length} Fragen generiert`);
    
    return {
      success: true,
      questionsGenerated: testQuestions.length,
      poolInfo: info
    };
    
  } catch (error) {
    console.error('❌ Pool-Test fehlgeschlagen:', error.message);
    return {
      success: false,
      error: error.message,
      poolInfo: getPoolInformation()
    };
  }
};