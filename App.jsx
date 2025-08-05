import { useState, useEffect } from 'react';
import { TRANSLATIONS } from './data/translations';
import LanguageSelector from './components/LanguageSelector/LanguageSelector';
import DifficultySelector from './components/DifficultySelector/DifficultySelector';
import QuizQuestion from './components/QuizQuestion/QuizQuestion';
import ResultsScreen from './components/ResultsScreen/ResultsScreen';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import ErrorScreen from './components/ErrorScreen/ErrorScreen';
import Header from './components/Header/Header';
import LegalLink from './components/LegalLink/LegalLink';
import AdComponent from './components/AdComponent/AdComponent';
import UpgradePrompt from './components/UpgradePrompt/UpgradePrompt';

// Legal Pages
import Impressum from './components/LegalPages/Impressum';
import Datenschutz from './components/LegalPages/Datenschutz';
import AGB from './components/LegalPages/AGB';
import Kontakt from './components/LegalPages/Kontakt';
import CookieBanner from './components/LegalPages/CookieBanner';

// Backend API Services - Backend macht alles (OpenTDB + Translation + Pool)
import { generateQuestions, evaluateAnswer } from './services/apiService';

export default function App() {
  const [language, setLanguage] = useState('en');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const [status, setStatus] = useState('language');
  const [questionCount, setQuestionCount] = useState(20);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [currentPage, setCurrentPage] = useState('quiz');
  
  // UpgradePrompt States
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [userType, setUserType] = useState('free'); // 'free' | 'registered'

  // 🧠 VERBESSERTE Question History mit intelligenter Rotation
  const [askedQuestions, setAskedQuestions] = useState(new Set());
  const [sessionRound, setSessionRound] = useState(1); // Track der aktuellen Runde

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Standard Ad-Strategie: 3 Ads bei 20 Fragen für Free User
  const getAdPositions = (totalQuestions) => {
    console.log(`🎯 Ad positions for userType: ${userType}, questions: ${totalQuestions}`);
    if (totalQuestions === 20) {
      return userType === 'free' ? [5, 10, 15] : [];
    }
    return [];
  };

  // 🔍 VERBESSERTE Ähnliche Fragen erkennen
  const areQuestionsSimilar = (question1, question2) => {
    // Normalisiere Fragen für Vergleich
    const normalize = (str) => str.toLowerCase()
      .replace(/[¿?¡!.,;:„"'']/g, '') // Erweiterte Satzzeichen
      .replace(/\s+/g, ' ') // Normalisiere Leerzeichen
      .replace(/(normalerweise|typically|usually|generally)/g, '') // Entferne Modifikatoren
      .trim();

    const q1 = normalize(question1);
    const q2 = normalize(question2);

    // Exakte Übereinstimmung
    if (q1 === q2) return true;

    // Ähnlichkeit durch gemeinsame Schlüsselwörter
    const getKeywords = (str) => str.split(' ').filter(word => word.length > 3);
    const keywords1 = getKeywords(q1);
    const keywords2 = getKeywords(q2);
    
    // Wenn >= 80% der Keywords übereinstimmen (verschärft von 70%)
    const commonKeywords = keywords1.filter(word => keywords2.includes(word));
    const similarity = commonKeywords.length / Math.max(keywords1.length, keywords2.length);
    
    return similarity >= 0.8;
  };

  // 🔍 VERBESSERTE Fragen-Fingerprint mit schärferer Erkennung
  const getQuestionFingerprint = (question) => {
    let normalized = question.toLowerCase()
      .replace(/[¿?¡!.,;:„"'']/g, '')
      .replace(/\s+/g, ' ')
      .replace(/(normalerweise|typically|usually|generally)/g, '') // Entferne Modifikatoren
      .trim();
    
    // 🎯 SCHÄRFERE Erkennung ähnlicher Fragen
    
    // Spinnen-Fragen zusammenfassen
    if ((normalized.includes('beine') || normalized.includes('legs')) && 
        (normalized.includes('spinne') || normalized.includes('spider'))) {
      return 'SPIDER_LEGS_QUESTION';
    }
    
    // Insekten-Fragen zusammenfassen
    if ((normalized.includes('beine') || normalized.includes('legs')) && 
        (normalized.includes('insekt') || normalized.includes('insect'))) {
      return 'INSECT_LEGS_QUESTION';
    }
    
    // Chemie Symbol-Fragen zusammenfassen nach Element
    if (normalized.includes('symbol') || normalized.includes('elemento')) {
      const elementMatch = normalized.match(/symbol\s+([a-z]+)/);
      if (elementMatch) {
        return `CHEMISTRY_SYMBOL_${elementMatch[1].toUpperCase()}`;
      }
    }
    
    // Hauptstadt-Fragen zusammenfassen nach Land
    if (normalized.includes('hauptstadt') || normalized.includes('capital')) {
      const countryMatch = normalized.match(/(deutschland|frankreich|spanien|italien|germany|france|spain|italy|usa|china|japan)/);
      if (countryMatch) {
        return `CAPITAL_${countryMatch[1].toUpperCase()}`;
      }
    }
    
    // Planeten-Fragen zusammenfassen
    if (normalized.includes('planet')) {
      if (normalized.includes('größte') || normalized.includes('largest')) {
        return 'LARGEST_PLANET_QUESTION';
      }
      if (normalized.includes('nächsten') || normalized.includes('closest')) {
        return 'CLOSEST_PLANET_QUESTION';
      }
      if (normalized.includes('rote') || normalized.includes('red')) {
        return 'RED_PLANET_QUESTION';
      }
    }
    
    // Kunst-Fragen zusammenfassen nach Werk
    if (normalized.includes('malte') || normalized.includes('painted')) {
      if (normalized.includes('mona lisa')) return 'ART_MONA_LISA';
      if (normalized.includes('sternennacht') || normalized.includes('starry night')) return 'ART_STARRY_NIGHT';
      if (normalized.includes('guernica')) return 'ART_GUERNICA';
      if (normalized.includes('sixtinisch') || normalized.includes('sistine')) return 'ART_SISTINE_CHAPEL';
    }
    
    // Musik-Fragen zusammenfassen nach Werk
    if (normalized.includes('komponierte') || normalized.includes('composed')) {
      if (normalized.includes('9') || normalized.includes('neunte')) return 'MUSIC_9TH_SYMPHONY';
      if (normalized.includes('nachtmusik')) return 'MUSIC_NACHTMUSIK';
      if (normalized.includes('jahreszeiten') || normalized.includes('seasons')) return 'MUSIC_FOUR_SEASONS';
    }
    
    // Standard: Erste 4 wichtige Wörter (erweitert von 3)
    const keywords = normalized.split(' ')
      .filter(word => word.length > 3)
      .slice(0, 4)
      .sort()
      .join('|');
    
    return keywords || normalized.substring(0, 25);
  };

  // 🧠 INTELLIGENTE Session-Rotation statt kompletter Reset
  const handleIntelligentSessionManagement = () => {
    const currentHistory = Array.from(askedQuestions);
    console.log(`🧠 Current session history: ${currentHistory.length} questions, Round: ${sessionRound}`);
    
    // Nach jeder 3. Runde: Lasse nur die neuesten 30 Fragen
    if (sessionRound % 3 === 0 && currentHistory.length > 30) {
      const recentQuestions = new Set(currentHistory.slice(-30));
      setAskedQuestions(recentQuestions);
      console.log(`🔄 Rotated history: ${currentHistory.length} → ${recentQuestions.size} questions kept`);
    }
    
    // Nach jeder 5. Runde: Kompletter Reset für maximale Variation
    if (sessionRound % 5 === 0) {
      setAskedQuestions(new Set());
      console.log(`🔥 Complete history reset after round ${sessionRound}`);
    }
  };

  // 🧹 VERBESSERTE Duplikate filtern mit schärferer Erkennung
  const filterDuplicateQuestions = (newQuestions) => {
    const filtered = [];
    const currentFingerprints = new Set(askedQuestions);
    
    for (const question of newQuestions) {
      const fingerprint = getQuestionFingerprint(question.question);
      
      // Prüfe gegen bereits gestellte Fragen
      if (!currentFingerprints.has(fingerprint)) {
        // Zusätzlich: Prüfe gegen bereits gefilterte Fragen in dieser Session
        const isDuplicateInBatch = filtered.some(existing => 
          areQuestionsSimilar(question.question, existing.question)
        );
        
        if (!isDuplicateInBatch) {
          filtered.push(question);
          currentFingerprints.add(fingerprint);
        } else {
          console.log(`🔄 Batch duplicate filtered: "${question.question.substring(0, 40)}..."`);
        }
      } else {
        console.log(`🧠 History duplicate filtered: "${question.question.substring(0, 40)}..."`);
      }
    }
    
    console.log(`🧹 Duplicate filter: ${newQuestions.length} → ${filtered.length} questions (${newQuestions.length - filtered.length} duplicates removed)`);
    return filtered;
  };

  // Score berechnen für UpgradePrompt
  const calculateCorrectAnswers = () => {
    if (!scores || scores.length === 0) return 0;
    
    return scores.reduce((count, score) => {
      let isCorrect = false;
      
      if (typeof score === 'object' && score !== null) {
        const numericScore = score.score;
        if (typeof numericScore === 'number') {
          isCorrect = numericScore >= 70; // 70%+ = richtig
        } else if (numericScore === 1 || numericScore === '1') {
          isCorrect = true;
        }
      } else {
        if (typeof score === 'number') {
          isCorrect = score >= 70;
        } else if (score === 1 || score === '1') {
          isCorrect = true;
        }
      }
      
      return count + (isCorrect ? 1 : 0);
    }, 0);
  };

  // Sprach-Mapping für Backend
  const getBackendLanguage = (langCode) => {
    const languageMap = {
      'en': 'English',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian'
    };
    return languageMap[langCode] || 'English';
  };

  // Navigation zu Legal Pages
  const handleNavigateToLegalPage = (page) => {
    setCurrentPage(page);
  };

  // Zurück zum Quiz
  const handleBackToQuiz = () => {
    setCurrentPage('quiz');
  };

  // UpgradePrompt Handlers
  const handleRegister = (email) => {
    console.log('User registered with email:', email);
    setUserType('registered');
    setShowUpgradePrompt(false);
    
    // TODO: Hier später lokale Speicherung hinzufügen
    alert(`Welcome ${email}! You're now registered! 🎉`);
  };

  const handleCloseUpgradePrompt = () => {
    setShowUpgradePrompt(false);
  };

  // Debug-Logging (erweitert)
  useEffect(() => {
    console.log('App State Update:', {
      status,
      language,
      questionCount,
      currentIndex,
      questionsLength: questions.length,
      scoresLength: scores.length,
      error: error,
      isSubmitting,
      showAd,
      currentPage,
      userType,
      showUpgradePrompt,
      askedQuestionsCount: askedQuestions.size,
      sessionRound: sessionRound
    });
  }, [status, language, questionCount, currentIndex, questions.length, scores.length, error, isSubmitting, showAd, currentPage, userType, showUpgradePrompt, askedQuestions, sessionRound]);

  // 🔄 VERBESSERTE loadQuestions mit intelligenter Session-Verwaltung
  const loadQuestions = async () => {
    setStatus('loading');
    setError(null);
    setIsSubmitting(false);
    
    try {
      console.log(`🚀 Loading ${questionCount} questions for ${language} from backend (Round ${sessionRound})`);
      
      // Intelligente Session-Verwaltung vor dem Laden neuer Fragen
      handleIntelligentSessionManagement();
      
      // Backend macht OpenTDB + Translation + Pool intelligent
      const generated = await generateQuestions(language, questionCount + 8); // Mehr Buffer für bessere Filterung
      
      if (!generated?.length) {
        throw new Error('No questions received from backend');
      }
      
      console.log(`📝 Generated ${generated.length} questions from ${generated[0]?.source || 'backend'} source`);
      
      // Filtere Duplikate mit verbesserter Logik
      const filtered = filterDuplicateQuestions(generated);
      const finalQuestions = filtered.slice(0, questionCount);
      
      // Update Question History mit neuen Fingerprints
      const newFingerprints = new Set(askedQuestions);
      finalQuestions.forEach(q => {
        newFingerprints.add(getQuestionFingerprint(q.question));
      });
      setAskedQuestions(newFingerprints);
      
      console.log(`✅ Questions loaded: ${finalQuestions.length}/${questionCount}, Total History: ${newFingerprints.size}, Round: ${sessionRound}`);
      console.log('📊 Question sources:', [...new Set(finalQuestions.map(q => q.source))]);
      
      setQuestions(finalQuestions);
      setCurrentIndex(0);
      setScores([]);
      setStatus('quiz');
      
    } catch (err) {
      console.error('🚨 Load error:', err);
      setError(err.message || 'Failed to load questions');
      setStatus('error');
    }
  };

  const handleAnswerSubmit = async (answer) => {
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate submission');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const currentQuestion = questions[currentIndex];
      const backendLanguage = getBackendLanguage(language);
      
      console.log('Evaluating answer:', {
        question: currentQuestion.question,
        answer: answer,
        language: backendLanguage,
        currentIndex: currentIndex,
        totalQuestions: questions.length
      });
      
      // Backend macht Antwort-Bewertung
      const evaluation = await evaluateAnswer(
        currentQuestion.question,
        answer,
        backendLanguage
      );
      
      console.log('Evaluation result:', evaluation);
      
      setScores(prev => [...prev, evaluation]);

      const nextIndex = currentIndex + 1;
      
      // Ads nur für Free User
      if (userType === 'free') {
        const adPositions = getAdPositions(questions.length);
        
        if (adPositions.includes(nextIndex) && nextIndex < questions.length) {
          console.log(`Showing ad after question ${currentIndex + 1} (position ${nextIndex})`);
          setShowAd(true);
          return;
        }
      }

      if (nextIndex >= questions.length) {
        console.log('Quiz completed, showing results');
        setStatus('results');
        
        // UpgradePrompt nur für Free User zeigen
        if (userType === 'free') {
          setTimeout(() => {
            setShowUpgradePrompt(true);
          }, 2000); // 2 Sekunden nach Results anzeigen
        }
      } else {
        console.log(`Moving to question ${nextIndex + 1} of ${questions.length}`);
        setCurrentIndex(nextIndex);
        setStatus('quiz');
      }
    } catch (err) {
      console.error('Eval error:', err);
      setError(err.message || 'Evaluation failed');
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdComplete = () => {
    console.log('Ad completed, continuing quiz');
    setShowAd(false);
    
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      setStatus('results');
      
      // UpgradePrompt nach Ad + Results nur für Free User
      if (userType === 'free') {
        setTimeout(() => {
          setShowUpgradePrompt(true);
        }, 2000);
      }
    } else {
      setCurrentIndex(nextIndex);
      setStatus('quiz');
    }
  };

  // 🔄 INTELLIGENTER Restart mit Session-Round-Management
  const handleRestart = () => {
    setQuestions([]);
    setScores([]);
    setCurrentIndex(0);
    setStatus('language');
    setError(null);
    setIsSubmitting(false);
    setShowAd(false);
    setCurrentPage('quiz');
    setShowUpgradePrompt(false);
    
    // Erhöhe Session-Round für intelligente Rotation
    setSessionRound(prev => prev + 1);
    
    console.log(`🔄 Restarting quiz - Round ${sessionRound + 1}, History size: ${askedQuestions.size}`);
  };

  // 🔥 Kompletter Reset für Debug/Tests (optional)
  const handleFullReset = () => {
    setAskedQuestions(new Set()); // Kompletter History-Reset
    setSessionRound(1); // Reset auf Round 1
    handleRestart();
    console.log('🔥 Full reset - clearing all history and resetting to round 1');
  };

  const handleStart = () => {
    setStatus('difficulty');
  };

  const currentQuestion = questions[currentIndex];

  // Legal Pages anzeigen
  if (currentPage === 'impressum') {
    return <Impressum onBack={handleBackToQuiz} translations={t} />;
  }
  if (currentPage === 'datenschutz') {
    return <Datenschutz onBack={handleBackToQuiz} translations={t} />;
  }
  if (currentPage === 'agb') {
    return <AGB onBack={handleBackToQuiz} translations={t} />;
  }
  if (currentPage === 'kontakt') {
    return <Kontakt onBack={handleBackToQuiz} translations={t} />;
  }

  // Ad-Screen anzeigen (nur für Free User)
  if (showAd && userType === 'free') {
    return (
      <AdComponent
        onAdComplete={handleAdComplete}
        onShowUpgrade={() => setShowUpgradePrompt(true)}
        translations={t}
        questionNumber={currentIndex + 1}
        totalQuestions={questionCount}
        language={language}
        userType={userType}
      />
    );
  }

  // Quiz-Screens mit Legal Link
  const renderQuizWithLegal = (content) => (
    <div className="app-container">
      {content}
      <CookieBanner />
      
      {/* UpgradePrompt Overlay */}
      {showUpgradePrompt && (
        <UpgradePrompt
          isVisible={showUpgradePrompt}
          onRegister={handleRegister}
          onClose={handleCloseUpgradePrompt}
          translations={t}
          userScore={calculateCorrectAnswers()}
          totalQuestions={questionCount}
          userType={userType}
        />
      )}
    </div>
  );

  switch (status) {
    case 'language':
      return (
        <div className="app-container">
          <LanguageSelector
            selectedLanguage={language}
            onLanguageSelect={(lang) => setLanguage(lang)}
            onStart={handleStart}
            translations={t}
            showLegalLink={true}
            onNavigateToLegal={handleNavigateToLegalPage}
          />
          <CookieBanner />
          
          {/* UpgradePrompt */}
          {showUpgradePrompt && (
            <UpgradePrompt
              isVisible={showUpgradePrompt}
              onRegister={handleRegister}
              onClose={handleCloseUpgradePrompt}
              translations={t}
              userScore={calculateCorrectAnswers()}
              totalQuestions={questionCount}
              userType={userType}
            />
          )}
        </div>
      );

    case 'difficulty':
      return (
        <div className="app-container">
          <DifficultySelector
            onSelect={(count) => {
              setQuestionCount(count);
              loadQuestions();
            }}
            translations={t}
            showLegalLink={true}
            onNavigateToLegal={handleNavigateToLegalPage}
            userType={userType}
          />
          <CookieBanner />
        </div>
      );

    case 'quiz':
      if (!currentQuestion) {
        return (
          <div className="app-container">
            <LoadingScreen isLoading={true} translations={t} />
            <CookieBanner />
          </div>
        );
      }
      
      return renderQuizWithLegal(
        <>
          <Header
            currentIndex={currentIndex}
            questionCount={questionCount}
            translations={t}
            language={language}
          />
          <QuizQuestion
            question={currentQuestion.question}
            topic={currentQuestion.topic}
            currentIndex={currentIndex}
            questionCount={questionCount}
            onSubmit={handleAnswerSubmit}
            translations={t}
            isSubmitting={isSubmitting}
            showLegalLink={true}
            onNavigateToLegal={handleNavigateToLegalPage}
            key={`question-${currentIndex}`}
          />
        </>
      );

    case 'results':
      return renderQuizWithLegal(
        <ResultsScreen
          questions={questions}
          scores={scores}
          language={language}
          translations={t}
          onRestart={handleRestart}
          showLegalLink={true}
          onNavigateToLegal={handleNavigateToLegalPage}
          userType={userType}
        />
      );

    case 'error':
      return renderQuizWithLegal(
        <ErrorScreen
          translations={t}
          onRetry={handleRestart}
          errorMessage={error}
        />
      );

    case 'loading':
    default:
      return renderQuizWithLegal(
        <>
          <LoadingScreen isLoading={true} translations={t} />
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#FFF' }}>
            Round {sessionRound}
          </div>
        </>
      );
  }
}