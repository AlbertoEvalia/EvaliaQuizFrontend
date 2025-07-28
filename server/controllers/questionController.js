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
    generationConfig: { temperature: 0.2, maxOutputTokens: 400 }
  });

  // OPTIMIERTE Evaluation speziell für Pool-Fragen
  const prompt = `Question: "${question}"
Answer: "${answer}"
Language: ${langConfig.geminiName}

🎯 CURATED POOL EVALUATION - Verified questions with known correct answers.

LIBERAL SCORING RULES for Pool Questions:
100 = Correct answer (be very generous with variations!)
90-95 = Very close (minor spelling, alternative names, 1-3 typos)
80-85 = Close but incomplete (partial answers that show understanding)
60-75 = Shows knowledge but missing key parts
40-55 = Related to topic but not quite right
20-35 = Wrong answer but in right domain
0-15 = Completely wrong or nonsensical

GENEROUS ACCEPTANCE CRITERIA:
✅ SPELLING: Accept up to 3 character mistakes in any word
✅ NAMES: Accept partial names (Einstein = Albert Einstein)
✅ DATES: Accept ±1 year for historical events
✅ NUMBERS: Accept minor variations (rounding)
✅ SYNONYMS: Accept equivalent terms (car = automobile)
✅ LANGUAGES: Accept translations/transliterations
✅ CASE: Ignore all capitalization differences
✅ ARTICLES: Ignore "the", "a", "an", "der", "die", "das", etc.

EXAMPLES:
"Wer schrieb Faust?" + "Goethe" = 100 ✅
"Wer schrieb Faust?" + "Johann Wolfgang von Goethe" = 100 ✅  
"Wer schrieb Faust?" + "Göthe" = 95 ✅ (1 Tippfehler)
"Who painted the Mona Lisa?" + "Da Vinci" = 100 ✅
"Who painted the Mona Lisa?" + "Leonardo" = 95 ✅ (partial name)
"When did WWII end?" + "1945" = 100 ✅
"When did WWII end?" + "1944" = 75 ✅ (±1 Jahr)
"What is 2+2?" + "4" = 100 ✅
"What is 2+2?" + "four" = 100 ✅ (written form)

Be encouraging and generous - these are educational questions!

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