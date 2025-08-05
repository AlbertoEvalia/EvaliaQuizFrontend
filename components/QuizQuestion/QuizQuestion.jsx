import React, { useEffect } from 'react';
import LegalLink from '../LegalLink/LegalLink';
import './QuizQuestion.css';

const QuizQuestion = ({
  question,
  topic,
  currentIndex,
  questionCount,
  onSubmit,
  translations,
  isSubmitting = false,
  showLegalLink = false,
  onNavigateToLegal
}) => {
  const [answer, setAnswer] = React.useState('');

  // Input zurücksetzen wenn neue Frage geladen wird
  useEffect(() => {
    console.log(`QuizQuestion: Resetting answer for question ${currentIndex + 1}`);
    setAnswer('');
  }, [currentIndex, question]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      alert(translations?.errorEmptyAnswer || "Please enter an answer!");
      return;
    }
    if (isSubmitting) {
      console.log('QuizQuestion: Already submitting, ignoring');
      return;
    }
    console.log(`QuizQuestion: Submitting answer "${answer.trim()}" for question ${currentIndex + 1}`);
    onSubmit(answer.trim());
  };



  return (
    <div className="quiz-container">
      {/* Große Hintergrundschrift */}
      <div className="large-progress-bg">
        {currentIndex + 1}/{questionCount}
      </div>
      
      <div className="question-card">
        <h3 className="topic-tag">{topic}</h3>
        <p className="question-text">{question}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="answer-form">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={translations?.answerPlaceholder || "Your answer..."}
          className="answer-input"
          autoFocus
          disabled={isSubmitting}
        />
        
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || !answer.trim()}
        >
          {isSubmitting
            ? (translations?.submitting || "Submitting...")
            : (translations?.submitButton || "Submit")
          }
        </button>
      </form>

      {/* Legal Link AUßERHALB der Form! */}
      {showLegalLink && onNavigateToLegal && (
        <div style={{ marginTop: 'calc(2 * var(--grid-unit))' }}>
          <LegalLink onNavigate={onNavigateToLegal} translations={translations} />
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;