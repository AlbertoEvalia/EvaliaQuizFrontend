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
import UpgradePrompt from './components/UpgradePrompt/UpgradePrompt'; // NEU

// Legal Pages
import Impressum from './components/LegalPages/Impressum';
import Datenschutz from './components/LegalPages/Datenschutz';
import AGB from './components/LegalPages/AGB';
import Kontakt from './components/LegalPages/Kontakt';
import CookieBanner from './components/LegalPages/CookieBanner';

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
  
  // NEU: UpgradePrompt States
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [userType, setUserType] = useState('free'); // 'free' oder 'premium'

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Standard Ad-Strategie: 3 Ads bei 20 Fragen
  const getAdPositions = (totalQuestions) => {
    if (totalQuestions === 20) {
      return [5, 10, 15];
    }
    return [];
  };

  // NEU: Score berechnen für UpgradePrompt
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

  // NEU: UpgradePrompt Handlers
  const handleRegister = (email) => {
    console.log('User registered with email:', email);
    setUserType('premium');
    setShowUpgradePrompt(false);
    
    // TODO: Hier später Magic-Link System integrieren
    alert(`Welcome ${email}! You're now premium! 🎉`);
  };

  const handleCloseUpgradePrompt = () => {
    setShowUpgradePrompt(false);
  };

  // Debug-Logging
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
      showUpgradePrompt
    });
  }, [status, language, questionCount, currentIndex, questions.length, scores.length, error, isSubmitting, showAd, currentPage, userType, showUpgradePrompt]);

  const loadQuestions = async () => {
    setStatus('loading');
    setError(null);
    setIsSubmitting(false);
    
    try {
      const generated = await generateQuestions(language, questionCount);
      if (!generated?.length) throw new Error('No questions received');
      
      setQuestions(generated);
      setCurrentIndex(0);
      setScores([]);
      setStatus('quiz');
    } catch (err) {
      console.error('Load error:', err);
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
      
      console.log('Evaluation result:', evaluation);
      
      setScores(prev => [...prev, evaluation]);

      const nextIndex = currentIndex + 1;
      
      // NEU: Keine Ads für Premium User
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
        
        // NEU: UpgradePrompt nur für Free User zeigen
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
      
      // NEU: UpgradePrompt nach Ad + Results
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

  const handleRestart = () => {
    setQuestions([]);
    setScores([]);
    setCurrentIndex(0);
    setStatus('language');
    setError(null);
    setIsSubmitting(false);
    setShowAd(false);
    setCurrentPage('quiz');
    setShowUpgradePrompt(false); // NEU: Reset UpgradePrompt
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
        translations={t}
        questionNumber={currentIndex + 1}
        totalQuestions={questionCount}
        language={language}
      />
    );
  }

  // Quiz-Screens mit Legal Link
  const renderQuizWithLegal = (content) => (
    <div className="app-container">
      {content}
      <CookieBanner />
      
      {/* NEU: UpgradePrompt Overlay */}
      <UpgradePrompt
        isVisible={showUpgradePrompt}
        onRegister={handleRegister}
        onClose={handleCloseUpgradePrompt}
        translations={t}
        userScore={calculateCorrectAnswers()}
        totalQuestions={questionCount}
      />
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
        <LoadingScreen isLoading={true} translations={t} />
      );
  }
}