import React, { useEffect, useCallback } from 'react';
import Chart from 'chart.js/auto';
import EvaliaLogo from '../../assets/evalia_logo.svg';
import LegalLink from '../LegalLink/LegalLink';
import './ResultsScreen.css';

const ResultsScreen = ({ 
  questions, 
  scores, 
  language, 
  translations, 
  onRestart,
  showLegalLink = false,
  onNavigateToLegal,
  userType = 'free' // NEU: 'free' | 'registered'
}) => {

  // 💾 LOKALE STATS für Registered Users
  const saveSessionStats = useCallback(() => {
    if (userType !== 'registered') return;

    try {
      const sessionData = {
        date: new Date().toISOString(),
        language,
        totalQuestions: questions.length,
        overallScore: calculateOverallScore(),
        groupScores: getGroupScores(),
        timestamp: Date.now()
      };

      // Bestehende Sessions laden
      const existingSessions = JSON.parse(localStorage.getItem('evalia_sessions') || '[]');
      
      // Neue Session hinzufügen
      existingSessions.push(sessionData);
      
      // Nur die letzten 10 Sessions behalten
      const recentSessions = existingSessions.slice(-10);
      
      localStorage.setItem('evalia_sessions', JSON.stringify(recentSessions));
      
      console.log('📊 Session stats saved for registered user:', sessionData);
    } catch (error) {
      console.error('Error saving session stats:', error);
    }
  }, [userType, language, questions, scores]);

  // Gruppe-Scores berechnen (für lokale Speicherung)
  const getGroupScores = useCallback(() => {
    const topicGroups = {
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

    const groupScores = {};
    
    Object.keys(topicGroups).forEach(groupKey => {
      const allowedTopics = topicGroups[groupKey][language] || topicGroups[groupKey].en || [];
      
      const groupQuestions = questions.filter(q => 
        allowedTopics.some(topic => topic.toLowerCase() === q.topic?.toLowerCase())
      );
      
      if (groupQuestions.length > 0) {
        const groupScoreValues = groupQuestions.map((q) => {
          const scoreIndex = questions.indexOf(q);
          const score = scores[scoreIndex];
          return processScore(score);
        });
        
        const avgScore = groupScoreValues.reduce((a, b) => a + b, 0) / groupScoreValues.length;
        groupScores[groupKey] = Math.round(avgScore);
      }
    });

    return groupScores;
  }, [questions, scores, language]);

  // Score processing logic (ausgelagert für Wiederverwendung)
  const processScore = (score) => {
    let finalScore = 0;
    
    if (typeof score === 'object' && score !== null) {
      const numericScore = score.score;
      if (typeof numericScore === 'number') {
        if (numericScore >= 0 && numericScore <= 100) {
          finalScore = numericScore;
        } else if (numericScore >= 0 && numericScore <= 1) {
          finalScore = numericScore * 100;
        }
      } else if (numericScore === 1 || numericScore === '1') {
        finalScore = 100;
      }
    } else {
      if (typeof score === 'number') {
        if (score >= 0 && score <= 100) {
          finalScore = score;
        } else if (score >= 0 && score <= 1) {
          finalScore = score * 100;
        }
      } else if (score === 1 || score === '1') {
        finalScore = 100;
      }
    }
    
    return finalScore;
  };

  const renderChart = useCallback(() => {
    const ctx = document.getElementById("resultsChart");
    if (!ctx) return;
    
    if (ctx.chart) {
      ctx.chart.destroy();
    }

    // Verificar que hay datos
    if (!questions || !scores || questions.length === 0 || scores.length === 0) {
      return;
    }

    if (questions.length !== scores.length) {
      return;
    }

    // NEUE 5-GRUPPEN LOGIK - genau wie im questionPool definiert
    const topicGroups = {
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

    // Übersetzungen für Gruppennamen
    const getTranslatedGroupName = (groupKey) => {
      const groupTranslations = {
        "Mathematik & Astronomie": {
          en: "Math & Astronomy",
          de: "Mathematik & Astronomie",
          fr: "Mathématiques & Astronomie", 
          es: "Matemáticas & Astronomía",
          it: "Matematica & Astronomia"
        },
        "Geschichte": {
          en: "History",
          de: "Geschichte",
          fr: "Histoire",
          es: "Historia", 
          it: "Storia"
        },
        "Geographie": {
          en: "Geography",
          de: "Geographie", 
          fr: "Géographie",
          es: "Geografía",
          it: "Geografia"
        },
        "Kunst & Kultur": {
          en: "Arts & Culture",
          de: "Kunst & Kultur",
          fr: "Arts & Culture",
          es: "Arte y Cultura",
          it: "Arte e Cultura"
        },
        "Naturwissenschaften": {
          en: "Natural Sciences", 
          de: "Naturwissenschaften",
          fr: "Sciences naturelles",
          es: "Ciencias Naturales",
          it: "Scienze Naturali"
        }
      };
      
      return groupTranslations[groupKey]?.[language] || groupKey;
    };

    const groupAverages = {};
    
    // Für jede Gruppe die durchschnittliche Punktzahl berechnen
    Object.keys(topicGroups).forEach(groupKey => {
      const allowedTopics = topicGroups[groupKey][language] || topicGroups[groupKey].en || [];
      
      const groupQuestions = questions.filter(q => 
        allowedTopics.some(topic => topic.toLowerCase() === q.topic?.toLowerCase())
      );
      
      if (groupQuestions.length > 0) {
        const groupScores = groupQuestions.map((q) => {
          const scoreIndex = questions.indexOf(q);
          const score = scores[scoreIndex];
          return processScore(score);
        });
        
        const avgScore = groupScores.reduce((a, b) => a + b, 0) / groupScores.length;
        const translatedName = getTranslatedGroupName(groupKey);
        groupAverages[translatedName] = avgScore;
        
        console.log(`📊 ${translatedName}: ${groupQuestions.length} Fragen, Durchschnitt: ${avgScore.toFixed(1)}%`);
      }
    });

    const labels = Object.keys(groupAverages);
    const data = Object.values(groupAverages);

    if (labels.length === 0) {
      console.log("⚠️ Keine Gruppendaten für Chart verfügbar");
      return;
    }

    console.log(`📈 Chart wird erstellt mit ${labels.length} Gruppen:`, labels);

    ctx.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: translations.chartLabel || "Average Score (%)",
          data: data,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        categoryPercentage: 0.8,
        barPercentage: 0.2,
        scales: {
          x: { 
            beginAtZero: true, 
            max: 100,
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.2)'
            }
          },
          y: { 
            grid: { display: false },
            ticks: {
              color: '#ffffff',
              font: {
                size: 14,
                family: 'Helvetica, Arial, sans-serif'
              },
              padding: 10,
              maxRotation: 0,
              minRotation: 0
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.x.toFixed(1)}%`,
            },
            titleFont: {
              size: 14,
            },
            bodyFont: {
              size: 13
            }
          },
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }
        }
      },
    });

  }, [questions, scores, translations, language]);

  const calculateOverallScore = useCallback(() => {
    if (!scores || scores.length === 0) return 0;
    
    const totalScore = scores.reduce((sum, score) => {
      return sum + processScore(score);
    }, 0);
    
    return Math.round(totalScore / scores.length);
  }, [scores]);

  // 💾 Session Stats speichern wenn Registered User
  useEffect(() => {
    if (userType === 'registered') {
      saveSessionStats();
    }
  }, [saveSessionStats, userType]);

  useEffect(() => {
    renderChart();
    return () => {
      const ctx = document.getElementById("resultsChart");
      if (ctx && ctx.chart) {
        ctx.chart.destroy();
      }
    };
  }, [renderChart]);

  // 📈 Lokale Stats für Registered Users anzeigen
  const getSessionStats = () => {
    if (userType !== 'registered') return null;

    try {
      const sessions = JSON.parse(localStorage.getItem('evalia_sessions') || '[]');
      if (sessions.length < 2) return null;

      const currentScore = calculateOverallScore();
      const previousScore = sessions[sessions.length - 2]?.overallScore || 0;
      const improvement = currentScore - previousScore;

      return {
        totalSessions: sessions.length,
        improvement: improvement,
        averageScore: Math.round(sessions.reduce((sum, s) => sum + s.overallScore, 0) / sessions.length)
      };
    } catch (error) {
      console.error('Error loading session stats:', error);
      return null;
    }
  };

  const sessionStats = getSessionStats();

  return (
    <div className="results-screen">
      <div className="results-container">
        <img 
          src={EvaliaLogo} 
          alt="EVALIA" 
          style={{
            height: '48px',
            width: 'auto',
            marginBottom: '16px',
            display: 'block',
            margin: '0 auto 16px auto'
          }}
        />
        
        <h1 style={{ 
          textAlign: 'center', 
          color: '#ffffff', 
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          {translations.resultsTitle || "Your Results"}
        </h1>
        
        <div className="evalia-result">
          <div className="evalia-average">
            {translations.overallScore || "Overall Score"}: {calculateOverallScore()}%
          </div>
        </div>

        {/* 📊 Lokale Stats für Registered Users */}
        {userType === 'registered' && sessionStats && (
          <div className="session-stats" 
          >
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              📈 Session #{sessionStats.totalSessions} • Average: {sessionStats.averageScore}%
            </div>
            {sessionStats.improvement !== 0 && (
              <div style={{ fontSize: '12px' }}>
                {sessionStats.improvement > 0 ? '🔥' : '📉'} 
                {sessionStats.improvement > 0 ? '+' : ''}{sessionStats.improvement}% vs last session
              </div>
            )}
          </div>
        )}
        
        <div className="chart-container">
          <canvas id="resultsChart"></canvas>
        </div>
        
        <button onClick={onRestart} className="restart-button">
          {translations.playAgain || "Play Again"}
        </button>

        {showLegalLink && onNavigateToLegal && (
          <div style={{ marginTop: 'calc(2 * var(--grid-unit))', width: '100%' }}>
            <LegalLink onNavigate={onNavigateToLegal} translations={translations} 
              userType={userType}        // ← NEU
              onLogout={handleLogout}   />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsScreen;