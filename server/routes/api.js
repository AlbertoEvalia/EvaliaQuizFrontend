// server/routes/api.js
// Komplette Version mit Auth & E-Mail Speicherung

import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { generateQuestions, evaluateAnswer } from '../services/geminiService.js';

const router = express.Router();

// In-Memory Storage für Demo (später durch echte DB ersetzen)
const emailDatabase = new Map(); // E-Mail → Newsletter-Daten
const magicTokens = new Map();   // Token → {email, expires, used}

// E-Mail-Konfiguration (Gmail SMTP) - verwendet bestehende SMTP_* Variablen
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true für 465, false für andere Ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ==================== AUTH ROUTES ====================

// POST /api/auth/magic-link - Magic-Link anfordern + E-Mail speichern
router.post('/auth/magic-link', async (req, res) => {
  try {
    const { email, language = 'de' } = req.body;
    
    // Validierung
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: "Valid email required"
      });
    }

    console.log(`[MAGIC-LINK] Generating for: ${email}, Language: ${language}`);
    
    // 1. NEWSLETTER E-MAIL SPEICHERN
    const newsletterData = {
      email: email.toLowerCase(),
      registeredAt: new Date().toISOString(),
      language: language,
      userAgent: req.headers['user-agent'] || 'unknown',
      source: 'quiz_registration',
      ip: req.ip || req.connection.remoteAddress
    };
    
    emailDatabase.set(email.toLowerCase(), newsletterData);
    console.log(`[NEWSLETTER] Saved email: ${email.toLowerCase()}`);
    
    // 2. MAGIC-TOKEN GENERIEREN
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + (15 * 60 * 1000); // 15 Minuten
    
    magicTokens.set(token, {
      email: email.toLowerCase(),
      expiresAt: expiresAt,
      used: false,
      createdAt: Date.now()
    });
    
    // 3. MAGIC-LINK ERSTELLEN (direkt zum Backend)
    const magicLink = `https://evaliaquizbackend.onrender.com/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
    
    // 4. E-MAIL SENDEN
    const emailTemplate = {
      de: {
        subject: 'Dein EVALIA Quiz Login-Link',
        html: `
          <h2>Willkommen bei EVALIA! 🎉</h2>
          <p>Klicke auf den Link um dich einzuloggen:</p>
          <a href="${magicLink}" style="background: #0075BE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Jetzt einloggen
          </a>
          <p><small>Link läuft in 15 Minuten ab.</small></p>
        `
      },
      en: {
        subject: 'Your EVALIA Quiz Login Link',
        html: `
          <h2>Welcome to EVALIA! 🎉</h2>
          <p>Click the link to log in:</p>
          <a href="${magicLink}" style="background: #0075BE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Login Now
          </a>
          <p><small>Link expires in 15 minutes.</small></p>
        `
      },
      fr: {
        subject: 'Votre lien de connexion EVALIA',
        html: `
          <h2>Bienvenue chez EVALIA! 🎉</h2>
          <p>Cliquez sur le lien pour vous connecter:</p>
          <a href="${magicLink}" style="background: #0075BE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Se connecter
          </a>
          <p><small>Le lien expire dans 15 minutes.</small></p>
        `
      },
      es: {
        subject: 'Tu enlace de inicio de sesión EVALIA',
        html: `
          <h2>¡Bienvenido a EVALIA! 🎉</h2>
          <p>Haz clic en el enlace para iniciar sesión:</p>
          <a href="${magicLink}" style="background: #0075BE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Iniciar sesión
          </a>
          <p><small>El enlace expira en 15 minutos.</small></p>
        `
      },
      it: {
        subject: 'Il tuo link di accesso EVALIA',
        html: `
          <h2>Benvenuto in EVALIA! 🎉</h2>
          <p>Clicca sul link per accedere:</p>
          <a href="${magicLink}" style="background: #0075BE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Accedi ora
          </a>
          <p><small>Il link scade tra 15 minuti.</small></p>
        `
      }
    };
    
    const template = emailTemplate[language] || emailTemplate.en;
    
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: template.subject,
      html: template.html
    });
    
    console.log(`[MAGIC-LINK] Email sent to: ${email}`);
    
    res.json({
      success: true,
      message: "Magic link sent to your email",
      expiresIn: 15 * 60 // 15 Minuten in Sekunden
    });
    
  } catch (error) {
    console.error(`[MAGIC-LINK] Error: ${error.message}`);
    
    res.status(500).json({
      success: false,
      error: "Could not send magic link",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/auth/verify - Magic-Link verifizieren
router.get('/auth/verify', (req, res) => {
  try {
    const { token, email } = req.query;
    
    if (!token || !email) {
      return res.redirect('https://evaliaquiz.com/?error=invalid');
    }
    
    const tokenData = magicTokens.get(token);
    
    // Token prüfen
    if (!tokenData) {
      console.log(`[VERIFY] Invalid token: ${token}`);
      return res.redirect('https://evaliaquiz.com/?error=invalid');
    }
    
    if (tokenData.used) {
      console.log(`[VERIFY] Token already used: ${token}`);
      return res.redirect('https://evaliaquiz.com/?error=invalid');
    }
    
    if (tokenData.expiresAt < Date.now()) {
      console.log(`[VERIFY] Token expired: ${token}`);
      return res.redirect('https://evaliaquiz.com/?error=expired');
    }
    
    if (tokenData.email !== email.toLowerCase()) {
      console.log(`[VERIFY] Email mismatch: ${tokenData.email} vs ${email.toLowerCase()}`);
      return res.redirect('https://evaliaquiz.com/?error=mismatch');
    }
    
    // Token als verwendet markieren
    tokenData.used = true;
    magicTokens.set(token, tokenData);
    
    console.log(`[VERIFY] Success for: ${email}`);
    
    // Redirect zur Startseite mit Auth-Parametern (keine separate /auth/verify Route)
    res.redirect(`https://evaliaquiz.com/?auth=${token}&email=${encodeURIComponent(email)}`);
    
  } catch (error) {
    console.error(`[VERIFY] Error: ${error.message}`);
    res.redirect('https://evaliaquiz.com/?error=invalid');
  }
});

// ==================== NEWSLETTER ROUTES ====================

// GET /api/newsletter - Newsletter-Liste anzeigen (für Admin)
router.get('/newsletter', (req, res) => {
  try {
    const emails = Array.from(emailDatabase.values());
    
    res.json({
      success: true,
      count: emails.length,
      emails: emails.map(entry => ({
        email: entry.email,
        registeredAt: entry.registeredAt,
        language: entry.language,
        source: entry.source,
        userAgent: entry.userAgent
      }))
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Could not fetch newsletter list"
    });
  }
});

// GET /api/newsletter/stats - Newsletter-Statistiken
router.get('/newsletter/stats', (req, res) => {
  try {
    const emails = Array.from(emailDatabase.values());
    
    const stats = {
      total: emails.length,
      byLanguage: {},
      bySource: {},
      recent: emails.filter(e => 
        new Date(e.registeredAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
      thisWeek: emails.filter(e => 
        new Date(e.registeredAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };
    
    emails.forEach(entry => {
      stats.byLanguage[entry.language] = (stats.byLanguage[entry.language] || 0) + 1;
      stats.bySource[entry.source] = (stats.bySource[entry.source] || 0) + 1;
    });
    
    res.json({
      success: true,
      stats,
      lastRegistration: emails.length > 0 ? emails[emails.length - 1].registeredAt : null
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Could not fetch newsletter stats"
    });
  }
});

// ==================== QUIZ ROUTES ====================

// POST /api/questions - Fragen generieren
router.post('/questions', async (req, res) => {
  try {
    const { language = 'de', count = 20 } = req.body;
    
    // Validierung
    if (typeof count !== 'number' || count < 1 || count > 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid count (1-100 allowed)"
      });
    }

    console.log(`[QUESTIONS] Generating ${count} questions in ${language}`);
    
    // Fragen über geminiService generieren
    const questions = await generateQuestions(language, count);
    
    console.log(`[QUESTIONS] Generated ${questions.length} questions`);
    
    res.json({
      success: true,
      count: questions.length,
      questions
    });
    
  } catch (error) {
    console.error(`[QUESTIONS] Error: ${error.message}`);
    
    res.status(500).json({
      success: false,
      error: "Could not generate questions",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/questions - Alternative für GET-Requests
router.get('/questions', async (req, res) => {
  try {
    const { language = 'de', count = 20 } = req.query;
    const questionCount = parseInt(count);
    
    // Validierung
    if (isNaN(questionCount) || questionCount < 1 || questionCount > 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid count (1-100 allowed)"
      });
    }

    console.log(`[QUESTIONS-GET] Generating ${questionCount} questions in ${language}`);
    
    // Fragen über geminiService generieren
    const questions = await generateQuestions(language, questionCount);
    
    console.log(`[QUESTIONS-GET] Generated ${questions.length} questions`);
    
    res.json({
      success: true,
      count: questions.length,
      questions
    });
    
  } catch (error) {
    console.error(`[QUESTIONS-GET] Error: ${error.message}`);
    
    res.status(500).json({
      success: false,
      error: "Could not generate questions",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/evaluate - Antwort bewerten
router.post('/evaluate', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { question, answer, language = 'de', expectedAnswer } = req.body;
    
    // Validierung
    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Question and answer required"
      });
    }

    console.log(`[EVALUATE] Question: "${question.substring(0, 50)}...", Answer: "${answer}", Language: ${language}, Expected: ${expectedAnswer || 'none'}`);
    
    // Timeout für die Evaluierung
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Evaluation timeout')), 12000);
    });

    // Evaluation über geminiService
    const evaluationPromise = evaluateAnswer(question, answer, language);
    const result = await Promise.race([evaluationPromise, timeoutPromise]);
    
    console.log(`[EVALUATE] Result: ${result.isCorrect ? 'CORRECT' : 'INCORRECT'}, Score: ${result.score}`);
    
    res.json({
      success: true,
      evaluation: result,
      ...result  // Für Backward-Compatibility
    });
    
  } catch (error) {
    console.error(`[EVALUATE] Error: ${error.message}`);
    
    // Spezifische Behandlung für verschiedene Fehlertypen
    if (error.message === 'Evaluation timeout') {
      return res.status(408).json({
        success: false,
        error: "Evaluation timed out",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      error: "Evaluation failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== SYSTEM ROUTES ====================

// GET /api/health - Gesundheitscheck
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Quiz API',
    version: '2.1.0',
    uptime: process.uptime(),
    features: {
      questions: true,
      evaluation: true,
      authentication: true,
      newsletter: true
    }
  });
});

// GET /api/pool/status - Pool-Informationen
router.get('/pool/status', async (req, res) => {
  try {
    const { getPoolStats } = await import('../data/questionPool/index.js');
    const poolStats = getPoolStats();
    
    res.json({
      success: true,
      poolStats,
      totalQuestions: Object.values(poolStats).reduce((sum, count) => sum + count, 0),
      availableLanguages: Object.keys(poolStats).filter(lang => poolStats[lang] > 0),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Could not load pool status',
      details: error.message
    });
  }
});

// GET /api/info - System-Informationen
router.get('/info', (req, res) => {
  res.json({
    success: true,
    system: {
      name: 'EVALIA Quiz API',
      version: '2.1.0',
      mode: 'full_featured',
      features: {
        questionPool: true,
        aiGeneration: true,
        aiEvaluation: !!process.env.GEMINI_API_KEY,
        multiLanguage: true,
        authentication: true,
        newsletter: true,
        magicLinks: true
      },
      supportedLanguages: ['de', 'en', 'fr', 'es', 'it'],
      maxQuestionsPerRequest: 100,
      defaultQuestionCount: 20
    },
    endpoints: {
      // Quiz
      'POST /questions': 'Generate questions (body: {language, count})',
      'GET /questions': 'Generate questions (query: ?language=de&count=20)',
      'POST /evaluate': 'Evaluate answer (body: {question, answer, language})',
      
      // Auth
      'POST /auth/magic-link': 'Request magic link (body: {email, language})',
      'GET /auth/verify': 'Verify magic link (query: ?token=...&email=...)',
      
      // Newsletter
      'GET /newsletter': 'Get newsletter list (admin)',
      'GET /newsletter/stats': 'Get newsletter statistics',
      
      // System
      'GET /health': 'Health check',
      'GET /pool/status': 'Pool statistics',
      'GET /info': 'System information'
    },
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'EVALIA Quiz API v2.1',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: '/api/info',
    newsletterCount: emailDatabase.size,
    features: ['Questions', 'Evaluation', 'Auth', 'Newsletter']
  });
});

// Export als named export für Kompatibilität
export { router as apiRouter };

// Zusätzlich default export
export default router;