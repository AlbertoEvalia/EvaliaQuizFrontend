import { useState, useEffect } from 'react';
import { TRANSLATIONS } from './data/translations';
import LanguageSelector from './components/LanguageSelector/LanguageSelector';
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

// Backend API Services
import { generateQuestions, evaluateAnswer } from './services/apiService';

export default function App() {
  const [language, setLanguage] = useState('en');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const [status, setStatus] = useState('language');
  const [questionCount] = useState(20); // 🔥 FIX AUF 20 FRAGEN
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [currentPage, setCurrentPage] = useState('quiz');
  
  // UpgradePrompt States
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [userType, setUserType] = useState('free'); // 'free' | 'registered'

  // Question History Management
  const [askedQuestions, setAskedQuestions] = useState(new Set());
  const [sessionRound, setSessionRound] = useState(1);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // 🎯 FREEMIUM AD-STRATEGIE: Ads nur bei Free Users
  const getAdPositions = (totalQuestions) => {
    console.log(`🎯 Ad positions for userType: ${userType}, questions: ${totalQuestions}`);
    // Für 20 Fragen: Ads nach 5, 10, 15
    return userType === 'free' ? [5, 10, 15] : [];
  };

  // Question filtering functions (keeping existing logic)
  const areQuestionsSimilar = (question1, question2) => {
    const normalize = (str) => str.toLowerCase()
      .replace(/[¿?¡!.,;:„"'']/g, '')
      .replace(/\s+/g, ' ')
      .replace(/(normalerweise|typically|usually|generally)/g, '')
      .trim();

    const q1 = normalize(question1);
    const q2 = normalize(question2);

    if (q1 === q2) return true;

    const getKeywords = (str) => str.split(' ').filter(word => word.length > 3);
    const keywords1 = getKeywords(q1);
    const keywords2 = getKeywords(q2);
    
    const commonKeywords = keywords1.filter(word => keywords2.includes(word));
    const similarity = commonKeywords.length / Math.max(keywords1.length, keywords2.length);
    
    return similarity >= 0.8;
  };

  const getQuestionFingerprint = (question) => {
    let normalized = question.toLowerCase()
      .replace(/[¿?¡!.,;:„"'']/g, '')
      .replace(/\s+/g, ' ')
      .replace(/(normalerweise|typically|usually|generally)/g, '')
      .trim();
    
    // Specific question patterns
    if ((normalized.includes('beine') || normalized.includes('legs')) && 
        (normalized.includes('spinne') || normalized.includes('spider'))) {
      return 'SPIDER_LEGS_QUESTION';
    }
    
    if ((normalized.includes('beine') || normalized.includes('legs')) && 
        (normalized.includes('insekt') || normalized.includes('insect'))) {
      return 'INSECT_LEGS_QUESTION';
    }
    
    if (normalized.includes('symbol') || normalized.includes('elemento')) {
      const elementMatch = normalized.match(/symbol\s+([a-z]+)/);
      if (elementMatch) {
        return `CHEMISTRY_SYMBOL_${elementMatch[1].toUpperCase()}`;
      }
    }
    
    if (normalized.includes('hauptstadt') || normalized.includes('capital')) {
      const countryMatch = normalized.match(/(deutschland|frankreich|spanien|italien|germany|france|spain|italy|usa|china|japan)/);
      if (countryMatch) {
        return `CAPITAL_${countryMatch[1].toUpperCase()}`;
      }
    }
    
    const keywords = normalized.split(' ')
      .filter(word => word.length > 3)
      .slice(0, 4)
      .sort()
      .join('|');
    
    return keywords || normalized.substring(0, 25);
  };

  const handleIntelligentSessionManagement = () => {
    const currentHistory = Array.from(askedQuestions);
    console.log(`🧠 Current session history: ${currentHistory.length} questions, Round: ${sessionRound}`);
    
    if (sessionRound % 3 === 0 && currentHistory.length > 30) {
      const recentQuestions = new Set(currentHistory.slice(-30));
      setAskedQuestions(recentQuestions);
      console.log(`🔄 Rotated history: ${currentHistory.length} → ${recentQuestions.size} questions kept`);
    }
    
    if (sessionRound % 5 === 0) {
      setAskedQuestions(new Set());
      console.log(`🔥 Complete history reset after round ${sessionRound}`);
    }
  };

  const filterDuplicateQuestions = (newQuestions) => {
    const filtered = [];
    const currentFingerprints = new Set(askedQuestions);
    
    for (const question of newQuestions) {
      const fingerprint = getQuestionFingerprint(question.question);
      
      if (!currentFingerprints.has(fingerprint)) {
        const isDuplicateInBatch = filtered.some(existing => 
          areQuestionsSimilar(question.question, existing.question)
        );
        
        if (!isDuplicateInBatch) {
          filtered.push(question);
          currentFingerprints.add(fingerprint);
        }
      }
    }
    
    console.log(`🧹 Duplicate filter: ${newQuestions.length} → ${filtered.length} questions (${newQuestions.length - filtered.length} duplicates removed)`);
    return filtered;
  };

  // Score calculation for UpgradePrompt
  const calculateCorrectAnswers = () => {
    if (!scores || scores.length === 0) return 0;
    
    return scores.reduce((count, score) => {
      let isCorrect = false;
      
      if (typeof score === 'object' && score !== null) {
        const numericScore = score.score;
        if (typeof numericScore === 'number') {
          isCorrect = numericScore >= 70;
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

  // Navigation handlers
  const handleNavigateToLegalPage = (page) => {
    setCurrentPage(page);
  };

  const handleBackToQuiz = () => {
    setCurrentPage('quiz');
  };

  // UpgradePrompt handlers
  const handleRegister = (email) => {
    console.log('User registered with email:', email);
    setUserType('registered');
    setShowUpgradePrompt(false);
    alert(`Welcome ${email}! You're now registered! 🎉`);
  };

  const handleCloseUpgradePrompt = () => {
    setShowUpgradePrompt(false);
  };

  // Logout function
const handleLogout = () => {
  localStorage.removeItem('evalia_user');
  setUserType('free');
  console.log('✅ User logged out');
  alert('You have been logged out! 👋');
};

console.log('🔍 Current userType state:', userType);

// Debug logging (erweitert)
useEffect(() => {
  // Check localStorage for saved user on app start
  const savedUser = localStorage.getItem('evalia_user');
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      if (userData.userType === 'registered' && userData.email) {
        setUserType('registered');
        console.log(`✅ User restored from localStorage: ${userData.email}`);
      }
    } catch (error) {
      console.error('Error parsing saved user data:', error);
      localStorage.removeItem('evalia_user'); // Clean invalid data
    }
  }

  // Check for auth parameters from magic link
  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get('auth');
  const userEmail = urlParams.get('email');
  const error = urlParams.get('error');

  if (authToken && userEmail) {
    // Successful magic link login
    const userData = {
      email: userEmail,
      userType: 'registered',
      registeredAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('evalia_user', JSON.stringify(userData));
    setUserType('registered');
    console.log(`✅ User logged in via magic link: ${userEmail}`);
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Show success message
    alert(`Welcome back! You're now logged in as ${userEmail} 🎉`);
  }
  
  if (error) {
    console.error('Auth error:', error);
    let message = 'Login failed';
    if (error === 'expired') message = 'Magic link expired';
    if (error === 'invalid') message = 'Invalid magic link';
    if (error === 'mismatch') message = 'Email mismatch';
    alert(message);
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Original debug logging
  console.log('App State Update:', {
    status,
    language,
    questionCount: 20,
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
}, [status, language, currentIndex, questions.length, scores.length, error, isSubmitting, showAd, currentPage, userType, showUpgradePrompt, askedQuestions, sessionRound]);
  
// 🚀 VEREINFACHTE QUESTION LOADING
  const loadQuestions = async () => {
    setStatus('loading');
    setError(null);
    setIsSubmitting(false);
    
    try {
      console.log(`🚀 Loading 20 questions for ${language} from backend (Round ${sessionRound})`);
      
      handleIntelligentSessionManagement();
      
      // Backend generates questions - always 20 + buffer
      const generated = await generateQuestions(language, 28); // 20 + 8 buffer
      
      if (!generated?.length) {
        throw new Error('No questions received from backend');
      }
      
      console.log(`📝 Generated ${generated.length} questions from ${generated[0]?.source || 'backend'} source`);
      
      const filtered = filterDuplicateQuestions(generated);
      const finalQuestions = filtered.slice(0, 20); // Always 20
      
      const newFingerprints = new Set(askedQuestions);
      finalQuestions.forEach(q => {
        newFingerprints.add(getQuestionFingerprint(q.question));
      });
      setAskedQuestions(newFingerprints);
      
      console.log(`✅ Questions loaded: ${finalQuestions.length}/20, Total History: ${newFingerprints.size}, Round: ${sessionRound}`);
      
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
      
      const evaluation = await evaluateAnswer(
        currentQuestion.question,
        answer,
        backendLanguage
      );
      
      setScores(prev => [...prev, evaluation]);

      const nextIndex = currentIndex + 1;

      setCurrentIndex(nextIndex);
      
      // 🎯 ADS NUR FÜR FREE USER
      if (userType === 'free') {
        const adPositions = getAdPositions(20); // Always 20
        
        if (adPositions.includes(nextIndex) && nextIndex < questions.length) {
          console.log(`Showing ad after question ${nextIndex} (position ${nextIndex})`);
          setShowAd(true);
          setStatus('quiz'); // Status bleibt quiz, aber mit Ad overlay
          return;
      }
    }

      if (nextIndex >= questions.length) {
        console.log('Quiz completed, showing results');
        setStatus('results');
        
        // 🎯 UPGRADE-PROMPT NUR FÜR FREE USER
        if (userType === 'free') {
          setTimeout(() => {
            setShowUpgradePrompt(true);
          }, 2000);
        }
      } else {
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
    
    // 🔥 FIX: currentIndex ist bereits korrekt gesetzt in handleAnswerSubmit
    // Keine weitere Index-Manipulation nötig
    
    if (currentIndex >= questions.length) {
      setStatus('results');
      
      // 🎯 UPGRADE-PROMPT NUR FÜR FREE USER nach Quiz Ende
      if (userType === 'free') {
        setTimeout(() => {
          setShowUpgradePrompt(true);
        }, 2000);
      }
    } else {
      setStatus('quiz');
    }
  };

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
    
    setSessionRound(prev => prev + 1);
    
    console.log(`🔄 Restarting quiz - Round ${sessionRound + 1}, History size: ${askedQuestions.size}`);
  };

  const handleFullReset = () => {
    setAskedQuestions(new Set());
    setSessionRound(1);
    handleRestart();
    console.log('🔥 Full reset - clearing all history and resetting to round 1');
  };

  // 🚀 VEREINFACHTER START: Direkt ins Quiz
  const handleStart = () => {
    console.log('🚀 Starting quiz directly with 20 questions');
    loadQuestions(); // Direkt laden, kein difficulty screen
  };

  const currentQuestion = questions[currentIndex];

  // Legal Pages (unchanged)
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

  // Ad Screen (unchanged)
  if (showAd && userType === 'free') {
    return (
      <AdComponent
        onAdComplete={handleAdComplete}
        onShowUpgrade={() => {
          console.log('🔔 Setting showUpgradePrompt to true');
          setShowAd(false); // Neu: Schließe Werbung
          setShowUpgradePrompt(true);
        }}
        translations={t}
        questionNumber={currentIndex}
        totalQuestions={20}
        language={language}
        userType={userType}
      />
    );
  }

if (showUpgradePrompt) {
  return (
    <UpgradePrompt
      isVisible={showUpgradePrompt}
      onRegister={handleRegister}
      onClose={handleCloseUpgradePrompt}
      translations={t}
      userScore={calculateCorrectAnswers()}
      totalQuestions={20}
      userType={userType}
    />
  );
}

const renderQuizWithLegal = (content) => (
  <div className="app-container">
    {content}
    <CookieBanner />
  </div>
);

  switch (status) {
    case 'language':
      return (
        <div className="app-container">
          <LanguageSelector
            selectedLanguage={language}
            onLanguageSelect={(lang) => setLanguage(lang)}
            onStart={handleStart} // 🚀 Direkt ins Quiz
            translations={t}
            showLegalLink={true}
            onNavigateToLegal={handleNavigateToLegalPage}
            onTestUpgrade={() => setShowUpgradePrompt(true)}
            userType={userType}        // ← NEU
            onLogout={handleLogout}  
          />
          <CookieBanner />
          
          {showUpgradePrompt && (
            <UpgradePrompt
              isVisible={showUpgradePrompt}
              onRegister={handleRegister}
              onClose={handleCloseUpgradePrompt}
              translations={t}
              userScore={calculateCorrectAnswers()}
              totalQuestions={20}
              userType={userType}
            />
          )}
        </div>
      );

    // 🔥 DIFFICULTY STATUS ENTFERNT - Direkt ins Quiz

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
            questionCount={20} // Always 20
            translations={t}
            language={language}
          />
          <QuizQuestion
            question={currentQuestion.question}
            topic={currentQuestion.topic}
            currentIndex={currentIndex}
            questionCount={20} // Always 20
            onSubmit={handleAnswerSubmit}
            translations={t}
            isSubmitting={isSubmitting}
            showLegalLink={true}
            onNavigateToLegal={handleNavigateToLegalPage}
            userType={userType}        // ← NEU
            onLogout={handleLogout}   
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
          onLogout={handleLogout}   
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
            Round {sessionRound} - 20 Questions
          </div>
        </>
      );
  }
}