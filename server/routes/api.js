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
    
   // Ersetze den emailTemplate-Teil (ca. Zeile 60-120) mit diesem:

const emailTemplate = {
  de: {
    subject: 'Willkommen bei EVALIA! 🎉 - Dein Login-Link',
    html: `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Willkommen bei EVALIA</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; color: #ffffff; margin-bottom: 10px; letter-spacing: 1px; }
        .welcome-text { font-size: 18px; color: #ffffff; margin: 0; }
        .content { padding: 40px 30px; text-align: center; }
        .main-text { font-size: 18px; color: #333333; margin-bottom: 30px; line-height: 1.5; }
        .cta-container { margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #0075BE 0%, #005B97 100%); color: #ffffff !important; text-decoration: none; padding: 16px 40px; font-size: 18px; font-weight: bold; border-radius: 0; text-transform: uppercase; letter-spacing: 1px; }
        .info-box { background: #f8f9fa; border-left: 4px solid #FF6B35; padding: 20px; margin: 30px 0; text-align: left; }
        .info-text { font-size: 14px; color: #666666; margin: 0; }
        .footer { background: #333333; color: #ffffff; padding: 30px 20px; text-align: center; }
        .footer-text { font-size: 14px; margin-bottom: 10px; }
        .website-link { color: #FF6B35; text-decoration: none; }
        @media (max-width: 600px) {
            .header { padding: 30px 15px; }
            .logo { font-size: 28px; }
            .welcome-text { font-size: 16px; }
            .content { padding: 30px 20px; }
            .main-text { font-size: 16px; }
            .cta-button { padding: 14px 30px; font-size: 16px; }
            .info-box { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
    <svg width="120" height="25" viewBox="0 0 186.49 39.25" style="fill: white;">
        <defs>
            <style>.cls-1{fill:#5fff81;}.cls-1,.cls-2{stroke-width:0px;}.cls-2{fill:#fff;}</style>
        </defs>
        <g>
            <path class="cls-2" d="m0,21.1c0-6.83,5.1-10.98,10.72-10.98,6.05,0,9.6,3.93,9.6,9.86,0,.82-.09,1.6-.17,2.16H2.38v-2.77h15.65l-.91.99c0-4.97-2.46-7.44-6.31-7.44s-7.26,2.94-7.26,8.17,3.54,8.21,8.21,8.21c2.51,0,4.5-.78,6.4-1.99l1.3,2.33c-2.07,1.38-4.75,2.51-8.13,2.51-6.31,0-11.33-4.06-11.33-11.07Z"/>
            <path class="cls-2" d="m23.86,10.63h3.67l4.84,11.89c.82,2.12,1.6,4.19,2.33,6.22h.17c.74-2.03,1.43-4.11,2.29-6.22l4.84-11.89h3.46l-8.73,21.01h-4.02l-8.86-21.01Z"/>
            <path class="cls-2" d="m49.8,26.2c0-4.71,4.41-7,15.26-7.87-.13-2.85-1.51-5.27-5.58-5.27-2.72,0-5.4,1.3-7.35,2.51l-1.43-2.42c2.16-1.38,5.71-3.03,9.38-3.03,5.75,0,8.56,3.42,8.56,8.65v12.88h-2.98l-.30-2.85h-.13c-2.29,1.82-5.32,3.37-8.26,3.37-3.93,0-7.18-2.2-7.18-5.97Zm15.26-.04v-5.45c-8.99.69-11.71,2.46-11.71,5.23,0,2.38,2.16,3.33,4.58,3.33s4.71-1.12,7.13-3.11Z"/>
            <path class="cls-2" d="m81.62,24.6V3.76h-7.44V.86h11.02v23.99c0,3.03,1.64,4.32,4.15,4.32,1.21,0,2.51-.30,3.93-.95l.91,2.68c-1.95.82-3.33,1.25-5.62,1.25-4.5,0-6.96-2.59-6.96-7.56Z"/>
            <path class="cls-1" d="m104.61,19.63c0-8.34,3.67-14.96,9.68-19.63l1.99,1.82c-5.79,4.88-8.47,10.55-8.47,17.81s2.68,12.93,8.47,17.81l-1.99,1.82c-6.01-4.67-9.68-11.28-9.68-19.63Z"/>
            <path class="cls-1" d="m133.88,13.53h-9.73v-2.90h13.31v21.01h-3.59V13.53Zm-1.43-10.07c0-1.64,1.21-2.77,2.85-2.77s2.85,1.12,2.85,2.77-1.21,2.77-2.85,2.77-2.85-1.08-2.85-2.77Z"/>
            <path class="cls-1" d="m148.36,26.2c0-4.71,4.41-7,15.26-7.87-.13-2.85-1.51-5.27-5.58-5.27-2.72,0-5.4,1.3-7.35,2.51l-1.43-2.42c2.16-1.38,5.71-3.03,9.38-3.03,5.75,0,8.56,3.42,8.56,8.65v12.88h-2.98l-.30-2.85h-.13c-2.29,1.82-5.32,3.37-8.26,3.37-3.93,0-7.18-2.2-7.18-5.97Zm15.26-.04v-5.45c-8.99.69-11.71,2.46-11.71,5.23,0,2.38,2.16,3.33,4.58,3.33s4.71-1.12,7.13-3.11Z"/>
            <path class="cls-1" d="m174.82,37.44c5.79-4.88,8.47-10.55,8.47-17.81s-2.68-12.93-8.47-17.81l1.99-1.82c6.01,4.67,9.68,11.28,9.68,19.63s-3.67,14.96-9.68,19.63l-1.99-1.82Z"/>
        </g>
    </svg>
</div>
            <p class="welcome-text">Willkommen bei der Community! 🎉</p>
        </div>
        <div class="content">
            <p class="main-text">
                Hallo!<br><br>
                Schön, dass du Teil der EVALIA-Community werden möchtest. 
                Klicke einfach auf den Button unten, um dich einzuloggen und loszulegen.
            </p>
            <div class="cta-container">
                <a href="${magicLink}" class="cta-button">Jetzt einloggen</a>
            </div>
            <div class="info-box">
                <p class="info-text">
                    <strong>⏰ Wichtiger Hinweis:</strong><br>
                    Dieser Link ist aus Sicherheitsgründen nur 15 Minuten gültig. 
                    Falls der Link abgelaufen ist, kannst du einfach einen neuen anfordern.
                </p>
            </div>
            <p style="font-size: 14px; color: #666666; margin-top: 30px;">
                Du hast diese Email erhalten, weil du dich bei EVALIA registriert hast. 
                Falls das nicht der Fall war, kannst du diese Email einfach ignorieren.
            </p>
        </div>
        <div class="footer">
            <p class="footer-text">
                Viel Spaß beim Quizzen!<br>
                Dein EVALIA-Team
            </p>
            <p style="font-size: 12px; margin-top: 15px;">
                <a href="https://evaliaquiz.com" class="website-link">evaliaquiz.com</a>
            </p>
        </div>
    </div>
</body>
</html>
    `
  },
  en: {
    subject: 'Welcome to EVALIA! 🎉 - Your Login Link',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to EVALIA</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; color: #ffffff; margin-bottom: 10px; letter-spacing: 1px; }
        .welcome-text { font-size: 18px; color: #ffffff; margin: 0; }
        .content { padding: 40px 30px; text-align: center; }
        .main-text { font-size: 18px; color: #333333; margin-bottom: 30px; line-height: 1.5; }
        .cta-container { margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #0075BE 0%, #005B97 100%); color: #ffffff !important; text-decoration: none; padding: 16px 40px; font-size: 18px; font-weight: bold; border-radius: 0; text-transform: uppercase; letter-spacing: 1px; }
        .info-box { background: #f8f9fa; border-left: 4px solid #FF6B35; padding: 20px; margin: 30px 0; text-align: left; }
        .info-text { font-size: 14px; color: #666666; margin: 0; }
        .footer { background: #333333; color: #ffffff; padding: 30px 20px; text-align: center; }
        .footer-text { font-size: 14px; margin-bottom: 10px; }
        .website-link { color: #FF6B35; text-decoration: none; }
        @media (max-width: 600px) {
            .header { padding: 30px 15px; }
            .logo { font-size: 28px; }
            .welcome-text { font-size: 16px; }
            .content { padding: 30px 20px; }
            .main-text { font-size: 16px; }
            .cta-button { padding: 14px 30px; font-size: 16px; }
            .info-box { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
    <svg width="120" height="25" viewBox="0 0 186.49 39.25" style="fill: white;">
        <defs>
            <style>.cls-1{fill:#5fff81;}.cls-1,.cls-2{stroke-width:0px;}.cls-2{fill:#fff;}</style>
        </defs>
        <g>
            <path class="cls-2" d="m0,21.1c0-6.83,5.1-10.98,10.72-10.98,6.05,0,9.6,3.93,9.6,9.86,0,.82-.09,1.6-.17,2.16H2.38v-2.77h15.65l-.91.99c0-4.97-2.46-7.44-6.31-7.44s-7.26,2.94-7.26,8.17,3.54,8.21,8.21,8.21c2.51,0,4.5-.78,6.4-1.99l1.3,2.33c-2.07,1.38-4.75,2.51-8.13,2.51-6.31,0-11.33-4.06-11.33-11.07Z"/>
            <path class="cls-2" d="m23.86,10.63h3.67l4.84,11.89c.82,2.12,1.6,4.19,2.33,6.22h.17c.74-2.03,1.43-4.11,2.29-6.22l4.84-11.89h3.46l-8.73,21.01h-4.02l-8.86-21.01Z"/>
            <path class="cls-2" d="m49.8,26.2c0-4.71,4.41-7,15.26-7.87-.13-2.85-1.51-5.27-5.58-5.27-2.72,0-5.4,1.3-7.35,2.51l-1.43-2.42c2.16-1.38,5.71-3.03,9.38-3.03,5.75,0,8.56,3.42,8.56,8.65v12.88h-2.98l-.30-2.85h-.13c-2.29,1.82-5.32,3.37-8.26,3.37-3.93,0-7.18-2.2-7.18-5.97Zm15.26-.04v-5.45c-8.99.69-11.71,2.46-11.71,5.23,0,2.38,2.16,3.33,4.58,3.33s4.71-1.12,7.13-3.11Z"/>
            <path class="cls-2" d="m81.62,24.6V3.76h-7.44V.86h11.02v23.99c0,3.03,1.64,4.32,4.15,4.32,1.21,0,2.51-.30,3.93-.95l.91,2.68c-1.95.82-3.33,1.25-5.62,1.25-4.5,0-6.96-2.59-6.96-7.56Z"/>
            <path class="cls-1" d="m104.61,19.63c0-8.34,3.67-14.96,9.68-19.63l1.99,1.82c-5.79,4.88-8.47,10.55-8.47,17.81s2.68,12.93,8.47,17.81l-1.99,1.82c-6.01-4.67-9.68-11.28-9.68-19.63Z"/>
            <path class="cls-1" d="m133.88,13.53h-9.73v-2.90h13.31v21.01h-3.59V13.53Zm-1.43-10.07c0-1.64,1.21-2.77,2.85-2.77s2.85,1.12,2.85,2.77-1.21,2.77-2.85,2.77-2.85-1.08-2.85-2.77Z"/>
            <path class="cls-1" d="m148.36,26.2c0-4.71,4.41-7,15.26-7.87-.13-2.85-1.51-5.27-5.58-5.27-2.72,0-5.4,1.3-7.35,2.51l-1.43-2.42c2.16-1.38,5.71-3.03,9.38-3.03,5.75,0,8.56,3.42,8.56,8.65v12.88h-2.98l-.30-2.85h-.13c-2.29,1.82-5.32,3.37-8.26,3.37-3.93,0-7.18-2.2-7.18-5.97Zm15.26-.04v-5.45c-8.99.69-11.71,2.46-11.71,5.23,0,2.38,2.16,3.33,4.58,3.33s4.71-1.12,7.13-3.11Z"/>
            <path class="cls-1" d="m174.82,37.44c5.79-4.88,8.47-10.55,8.47-17.81s-2.68-12.93-8.47-17.81l1.99-1.82c6.01,4.67,9.68,11.28,9.68,19.63s-3.67,14.96-9.68,19.63l-1.99-1.82Z"/>
        </g>
    </svg>
</div>
            <p class="welcome-text">Welcome to the Community! 🎉</p>
        </div>
        <div class="content">
            <p class="main-text">
                Hello!<br><br>
                Great that you want to become part of the EVALIA community. 
                Simply click the button below to log in and get started.
            </p>
            <div class="cta-container">
                <a href="${magicLink}" class="cta-button">Login Now</a>
            </div>
            <div class="info-box">
                <p class="info-text">
                    <strong>⏰ Important Note:</strong><br>
                    This link is valid for only 15 minutes for security reasons. 
                    If the link has expired, you can simply request a new one.
                </p>
            </div>
            <p style="font-size: 14px; color: #666666; margin-top: 30px;">
                You received this email because you registered with EVALIA. 
                If that's not the case, you can simply ignore this email.
            </p>
        </div>
        <div class="footer">
            <p class="footer-text">
                Have fun quizzing!<br>
                Your EVALIA Team
            </p>
            <p style="font-size: 12px; margin-top: 15px;">
                <a href="https://evaliaquiz.com" class="website-link">evaliaquiz.com</a>
            </p>
        </div>
    </div>
</body>
</html>
    `
  },
  
  
  fr: {
    subject: 'Bienvenue chez EVALIA! 🎉 - Votre lien de connexion',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue chez EVALIA</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; color: #ffffff; margin-bottom: 10px; letter-spacing: 1px; }
        .welcome-text { font-size: 18px; color: #ffffff; margin: 0; }
        .content { padding: 40px 30px; text-align: center; }
        .main-text { font-size: 18px; color: #333333; margin-bottom: 30px; line-height: 1.5; }
        .cta-container { margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #0075BE 0%, #005B97 100%); color: #ffffff !important; text-decoration: none; padding: 16px 40px; font-size: 18px; font-weight: bold; border-radius: 0; text-transform: uppercase; letter-spacing: 1px; }
        .info-box { background: #f8f9fa; border-left: 4px solid #FF6B35; padding: 20px; margin: 30px 0; text-align: left; }
        .info-text { font-size: 14px; color: #666666; margin: 0; }
        .footer { background: #333333; color: #ffffff; padding: 30px 20px; text-align: center; }
        .footer-text { font-size: 14px; margin-bottom: 10px; }
        .website-link { color: #FF6B35; text-decoration: none; }
        @media (max-width: 600px) {
            .header { padding: 30px 15px; }
            .logo { font-size: 28px; }
            .welcome-text { font-size: 16px; }
            .content { padding: 30px 20px; }
            .main-text { font-size: 16px; }
            .cta-button { padding: 14px 30px; font-size: 16px; }
            .info-box { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
    <svg width="120" height="25" viewBox="0 0 186.49 39.25" style="fill: white;">
        <defs>
            <style>.cls-1{fill:#5fff81;}.cls-1,.cls-2{stroke-width:0px;}.cls-2{fill:#fff;}</style>
        </defs>
        <g>
            <path class="cls-2" d="m0,21.1c0-6.83,5.1-10.98,10.72-10.98,6.05,0,9.6,3.93,9.6,9.86,0,.82-.09,1.6-.17,2.16H2.38v-2.77h15.65l-.91.99c0-4.97-2.46-7.44-6.31-7.44s-7.26,2.94-7.26,8.17,3.54,8.21,8.21,8.21c2.51,0,4.5-.78,6.4-1.99l1.3,2.33c-2.07,1.38-4.75,2.51-8.13,2.51-6.31,0-11.33-4.06-11.33-11.07Z"/>
            <path class="cls-2" d="m23.86,10.63h3.67l4.84,11.89c.82,2.12,1.6,4.19,2.33,6.22h.17c.74-2.03,1.43-4.11,2.29-6.22l4.84-11.89h3.46l-8.73,21.01h-4.02l-8.86-21.01Z"/>
            <path class="cls-2" d="m49.8,26.2c0-4.71,4.41-7,15.26-7.87-.13-2.85-1.51-5.27-5.58-5.27-2.72,0-5.4,1.3-7.35,2.51l-1.43-2.42c2.16-1.38,5.71-3.03,9.38-3.03,5.75,0,8.56,3.42,8.56,8.65v12.88h-2.98l-.30-2.85h-.13c-2.29,1.82-5.32,3.37-8.26,3.37-3.93,0-7.18-2.2-7.18-5.97Zm15.26-.04v-5.45c-8.99.69-11.71,2.46-11.71,5.23,0,2.38,2.16,3.33,4.58,3.33s4.71-1.12,7.13-3.11Z"/>
            <path class="cls-2" d="m81.62,24.6V3.76h-7.44V.86h11.02v23.99c0,3.03,1.64,4.32,4.15,4.32,1.21,0,2.51-.30,3.93-.95l.91,2.68c-1.95.82-3.33,1.25-5.62,1.25-4.5,0-6.96-2.59-6.96-7.56Z"/>
            <path class="cls-1" d="m104.61,19.63c0-8.34,3.67-14.96,9.68-19.63l1.99,1.82c-5.79,4.88-8.47,10.55-8.47,17.81s2.68,12.93,8.47,17.81l-1.99,1.82c-6.01-4.67-9.68-11.28-9.68-19.63Z"/>
            <path class="cls-1" d="m133.88,13.53h-9.73v-2.90h13.31v21.01h-3.59V13.53Zm-1.43-10.07c0-1.64,1.21-2.77,2.85-2.77s2.85,1.12,2.85,2.77-1.21,2.77-2.85,2.77-2.85-1.08-2.85-2.77Z"/>
            <path class="cls-1" d="m148.36,26.2c0-4.71,4.41-7,15.26-7.87-.13-2.85-1.51-5.27-5.58-5.27-2.72,0-5.4,1.3-7.35,2.51l-1.43-2.42c2.16-1.38,5.71-3.03,9.38-3.03,5.75,0,8.56,3.42,8.56,8.65v12.88h-2.98l-.30-2.85h-.13c-2.29,1.82-5.32,3.37-8.26,3.37-3.93,0-7.18-2.2-7.18-5.97Zm15.26-.04v-5.45c-8.99.69-11.71,2.46-11.71,5.23,0,2.38,2.16,3.33,4.58,3.33s4.71-1.12,7.13-3.11Z"/>
            <path class="cls-1" d="m174.82,37.44c5.79-4.88,8.47-10.55,8.47-17.81s-2.68-12.93-8.47-17.81l1.99-1.82c6.01,4.67,9.68,11.28,9.68,19.63s-3.67,14.96-9.68,19.63l-1.99-1.82Z"/>
        </g>
    </svg>
</div>
            <p class="welcome-text">Bienvenue dans la communauté! 🎉</p>
        </div>
        <div class="content">
            <p class="main-text">
                Salut!<br><br>
                Super que tu veuilles faire partie de la communauté EVALIA. 
                Clique simplement sur le bouton ci-dessous pour te connecter et commencer.
            </p>
            <div class="cta-container">
                <a href="${magicLink}" class="cta-button">Se connecter</a>
            </div>
            <div class="info-box">
                <p class="info-text">
                    <strong>⏰ Note importante:</strong><br>
                    Ce lien n'est valide que 15 minutes pour des raisons de sécurité. 
                    Si le lien a expiré, tu peux simplement en demander un nouveau.
                </p>
            </div>
            <p style="font-size: 14px; color: #666666; margin-top: 30px;">
                Tu as reçu cet email parce que tu t'es inscrit chez EVALIA. 
                Si ce n'est pas le cas, tu peux simplement ignorer cet email.
            </p>
        </div>
        <div class="footer">
            <p class="footer-text">
                Amuse-toi bien avec les quiz!<br>
                Ton équipe EVALIA
            </p>
            <p style="font-size: 12px; margin-top: 15px;">
                <a href="https://evaliaquiz.com" class="website-link">evaliaquiz.com</a>
            </p>
        </div>
    </div>
</body>
</html>
    `
  },
  
  es: {
    subject: '¡Bienvenido a EVALIA! 🎉 - Tu enlace de inicio de sesión',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a EVALIA</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; color: #ffffff; margin-bottom: 10px; letter-spacing: 1px; }
        .welcome-text { font-size: 18px; color: #ffffff; margin: 0; }
        .content { padding: 40px 30px; text-align: center; }
        .main-text { font-size: 18px; color: #333333; margin-bottom: 30px; line-height: 1.5; }
        .cta-container { margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #0075BE 0%, #005B97 100%); color: #ffffff !important; text-decoration: none; padding: 16px 40px; font-size: 18px; font-weight: bold; border-radius: 0; text-transform: uppercase; letter-spacing: 1px; }
        .info-box { background: #f8f9fa; border-left: 4px solid #FF6B35; padding: 20px; margin: 30px 0; text-align: left; }
        .info-text { font-size: 14px; color: #666666; margin: 0; }
        .footer { background: #333333; color: #ffffff; padding: 30px 20px; text-align: center; }
        .footer-text { font-size: 14px; margin-bottom: 10px; }
        .website-link { color: #FF6B35; text-decoration: none; }
        @media (max-width: 600px) {
            .header { padding: 30px 15px; }
            .logo { font-size: 28px; }
            .welcome-text { font-size: 16px; }
            .content { padding: 30px 20px; }
            .main-text { font-size: 16px; }
            .cta-button { padding: 14px 30px; font-size: 16px; }
            .info-box { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
    <svg width="120" height="25" viewBox="0 0 186.49 39.25" style="fill: white;">
        <defs>
            <style>.cls-1{fill:#5fff81;}.cls-1,.cls-2{stroke-width:0px;}.cls-2{fill:#fff;}</style>
        </defs>
        <g>
            <path class="cls-2" d="m0,21.1c0-6.83,5.1-10.98,10.72-10.98,6.05,0,9.6,3.93,9.6,9.86,0,.82-.09,1.6-.17,2.16H2.38v-2.77h15.65l-.91.99c0-4.97-2.46-7.44-6.31-7.44s-7.26,2.94-7.26,8.17,3.54,8.21,8.21,8.21c2.51,0,4.5-.78,6.4-1.99l1.3,2.33c-2.07,1.38-4.75,2.51-8.13,2.51-6.31,0-11.33-4.06-11.33-11.07Z"/>
            <path class="cls-2" d="m23.86,10.63h3.67l4.84,11.89c.82,2.12,1.6,4.19,2.33,6.22h.17c.74-2.03,1.43-4.11,2.29-6.22l4.84-11.89h3.46l-8.73,21.01h-4.02l-8.86-21.01Z"/>
            <path class="cls-2" d="m49.8,26.2c0-4.71,4.41-7,15.26-7.87-.13-2.85-1.51-5.27-5.58-5.27-2.72,0-5.4,1.3-7.35,2.51l-1.43-2.42c2.16-1.38,5.71-3.03,9.38-3.03,5.75,0,8.56,3.42,8.56,8.65v12.88h-2.98l-.30-2.85h-.13c-2.29,1.82-5.32,3.37-8.26,3.37-3.93,0-7.18-2.2-7.18-5.97Zm15.26-.04v-5.45c-8.99.69-11.71,2.46-11.71,5.23,0,2.38,2.16,3.33,4.58,3.33s4.71-1.12,7.13-3.11Z"/>
            <path class="cls-2" d="m81.62,24.6V3.76h-7.44V.86h11.02v23.99c0,3.03,1.64,4.32,4.15,4.32,1.21,0,2.51-.30,3.93-.95l.91,2.68c-1.95.82-3.33,1.25-5.62,1.25-4.5,0-6.96-2.59-6.96-7.56Z"/>
            <path class="cls-1" d="m104.61,19.63c0-8.34,3.67-14.96,9.68-19.63l1.99,1.82c-5.79,4.88-8.47,10.55-8.47,17.81s2.68,12.93,8.47,17.81l-1.99,1.82c-6.01-4.67-9.68-11.28-9.68-19.63Z"/>
            <path class="cls-1" d="m133.88,13.53h-9.73v-2.90h13.31v21.01h-3.59V13.53Zm-1.43-10.07c0-1.64,1.21-2.77,2.85-2.77s2.85,1.12,2.85,2.77-1.21,2.77-2.85,2.77-2.85-1.08-2.85-2.77Z"/>
            <path class="cls-1" d="m148.36,26.2c0-4.71,4.41-7,15.26-7.87-.13-2.85-1.51-5.27-5.58-5.27-2.72,0-5.4,1.3-7.35,2.51l-1.43-2.42c2.16-1.38,5.71-3.03,9.38-3.03,5.75,0,8.56,3.42,8.56,8.65v12.88h-2.98l-.30-2.85h-.13c-2.29,1.82-5.32,3.37-8.26,3.37-3.93,0-7.18-2.2-7.18-5.97Zm15.26-.04v-5.45c-8.99.69-11.71,2.46-11.71,5.23,0,2.38,2.16,3.33,4.58,3.33s4.71-1.12,7.13-3.11Z"/>
            <path class="cls-1" d="m174.82,37.44c5.79-4.88,8.47-10.55,8.47-17.81s-2.68-12.93-8.47-17.81l1.99-1.82c6.01,4.67,9.68,11.28,9.68,19.63s-3.67,14.96-9.68,19.63l-1.99-1.82Z"/>
        </g>
    </svg>
</div>
            <p class="welcome-text">¡Bienvenido a la comunidad! 🎉</p>
        </div>
        <div class="content">
            <p class="main-text">
                ¡Hola!<br><br>
                Genial que quieras formar parte de la comunidad EVALIA. 
                Simplemente haz clic en el botón de abajo para iniciar sesión y comenzar.
            </p>
            <div class="cta-container">
                <a href="${magicLink}" class="cta-button">Iniciar sesión</a>
            </div>
            <div class="info-box">
                <p class="info-text">
                    <strong>⏰ Nota importante:</strong><br>
                    Este enlace solo es válido durante 15 minutos por razones de seguridad. 
                    Si el enlace ha expirado, puedes solicitar uno nuevo fácilmente.
                </p>
            </div>
            <p style="font-size: 14px; color: #666666; margin-top: 30px;">
                Recibiste este email porque te registraste en EVALIA. 
                Si ese no es el caso, puedes simplemente ignorar este email.
            </p>
        </div>
        <div class="footer">
            <p class="footer-text">
                ¡Diviértete con los quiz!<br>
                Tu equipo EVALIA
            </p>
            <p style="font-size: 12px; margin-top: 15px;">
                <a href="https://evaliaquiz.com" class="website-link">evaliaquiz.com</a>
            </p>
        </div>
    </div>
</body>
</html>
    `
  },
  
  it: {
    subject: 'Benvenuto in EVALIA! 🎉 - Il tuo link di accesso',
    html: `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Benvenuto in EVALIA</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; color: #ffffff; margin-bottom: 10px; letter-spacing: 1px; }
        .welcome-text { font-size: 18px; color: #ffffff; margin: 0; }
        .content { padding: 40px 30px; text-align: center; }
        .main-text { font-size: 18px; color: #333333; margin-bottom: 30px; line-height: 1.5; }
        .cta-container { margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #0075BE 0%, #005B97 100%); color: #ffffff !important; text-decoration: none; padding: 16px 40px; font-size: 18px; font-weight: bold; border-radius: 0; text-transform: uppercase; letter-spacing: 1px; }
        .info-box { background: #f8f9fa; border-left: 4px solid #FF6B35; padding: 20px; margin: 30px 0; text-align: left; }
        .info-text { font-size: 14px; color: #666666; margin: 0; }
        .footer { background: #333333; color: #ffffff; padding: 30px 20px; text-align: center; }
        .footer-text { font-size: 14px; margin-bottom: 10px; }
        .website-link { color: #FF6B35; text-decoration: none; }
        @media (max-width: 600px) {
            .header { padding: 30px 15px; }
            .logo { font-size: 28px; }
            .welcome-text { font-size: 16px; }
            .content { padding: 30px 20px; }
            .main-text { font-size: 16px; }
            .cta-button { padding: 14px 30px; font-size: 16px; }
            .info-box { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
    <svg width="120" height="25" viewBox="0 0 186.49 39.25" style="fill: white;">
        <defs>
            <style>.cls-1{fill:#5fff81;}.cls-1,.cls-2{stroke-width:0px;}.cls-2{fill:#fff;}</style>
        </defs>
        <g>
            <path class="cls-2" d="m0,21.1c0-6.83,5.1-10.98,10.72-10.98,6.05,0,9.6,3.93,9.6,9.86,0,.82-.09,1.6-.17,2.16H2.38v-2.77h15.65l-.91.99c0-4.97-2.46-7.44-6.31-7.44s-7.26,2.94-7.26,8.17,3.54,8.21,8.21,8.21c2.51,0,4.5-.78,6.4-1.99l1.3,2.33c-2.07,1.38-4.75,2.51-8.13,2.51-6.31,0-11.33-4.06-11.33-11.07Z"/>
            <path class="cls-2" d="m23.86,10.63h3.67l4.84,11.89c.82,2.12,1.6,4.19,2.33,6.22h.17c.74-2.03,1.43-4.11,2.29-6.22l4.84-11.89h3.46l-8.73,21.01h-4.02l-8.86-21.01Z"/>
            <path class="cls-2" d="m49.8,26.2c0-4.71,4.41-7,15.26-7.87-.13-2.85-1.51-5.27-5.58-5.27-2.72,0-5.4,1.3-7.35,2.51l-1.43-2.42c2.16-1.38,5.71-3.03,9.38-3.03,5.75,0,8.56,3.42,8.56,8.65v12.88h-2.98l-.30-2.85h-.13c-2.29,1.82-5.32,3.37-8.26,3.37-3.93,0-7.18-2.2-7.18-5.97Zm15.26-.04v-5.45c-8.99.69-11.71,2.46-11.71,5.23,0,2.38,2.16,3.33,4.58,3.33s4.71-1.12,7.13-3.11Z"/>
            <path class="cls-2" d="m81.62,24.6V3.76h-7.44V.86h11.02v23.99c0,3.03,1.64,4.32,4.15,4.32,1.21,0,2.51-.30,3.93-.95l.91,2.68c-1.95.82-3.33,1.25-5.62,1.25-4.5,0-6.96-2.59-6.96-7.56Z"/>
            <path class="cls-1" d="m104.61,19.63c0-8.34,3.67-14.96,9.68-19.63l1.99,1.82c-5.79,4.88-8.47,10.55-8.47,17.81s2.68,12.93,8.47,17.81l-1.99,1.82c-6.01-4.67-9.68-11.28-9.68-19.63Z"/>
            <path class="cls-1" d="m133.88,13.53h-9.73v-2.90h13.31v21.01h-3.59V13.53Zm-1.43-10.07c0-1.64,1.21-2.77,2.85-2.77s2.85,1.12,2.85,2.77-1.21,2.77-2.85,2.77-2.85-1.08-2.85-2.77Z"/>
            <path class="cls-1" d="m148.36,26.2c0-4.71,4.41-7,15.26-7.87-.13-2.85-1.51-5.27-5.58-5.27-2.72,0-5.4,1.3-7.35,2.51l-1.43-2.42c2.16-1.38,5.71-3.03,9.38-3.03,5.75,0,8.56,3.42,8.56,8.65v12.88h-2.98l-.30-2.85h-.13c-2.29,1.82-5.32,3.37-8.26,3.37-3.93,0-7.18-2.2-7.18-5.97Zm15.26-.04v-5.45c-8.99.69-11.71,2.46-11.71,5.23,0,2.38,2.16,3.33,4.58,3.33s4.71-1.12,7.13-3.11Z"/>
            <path class="cls-1" d="m174.82,37.44c5.79-4.88,8.47-10.55,8.47-17.81s-2.68-12.93-8.47-17.81l1.99-1.82c6.01,4.67,9.68,11.28,9.68,19.63s-3.67,14.96-9.68,19.63l-1.99-1.82Z"/>
        </g>
    </svg>
</div>
            <p class="welcome-text">Benvenuto nella comunità! 🎉</p>
        </div>
        <div class="content">
            <p class="main-text">
                Ciao!<br><br>
                Fantastico che tu voglia far parte della comunità EVALIA. 
                Clicca semplicemente sul pulsante qui sotto per accedere e iniziare.
            </p>
            <div class="cta-container">
                <a href="${magicLink}" class="cta-button">Accedi ora</a>
            </div>
            <div class="info-box">
                <p class="info-text">
                    <strong>⏰ Nota importante:</strong><br>
                    Questo link è valido solo per 15 minuti per motivi di sicurezza. 
                    Se il link è scaduto, puoi semplicemente richiederne uno nuovo.
                </p>
            </div>
            <p style="font-size: 14px; color: #666666; margin-top: 30px;">
                Hai ricevuto questa email perché ti sei registrato su EVALIA. 
                Se non è così, puoi semplicemente ignorare questa email.
            </p>
        </div>
        <div class="footer">
            <p class="footer-text">
                Divertiti con i quiz!<br>
                Il tuo team EVALIA
            </p>
            <p style="font-size: 12px; margin-top: 15px;">
                <a href="https://evaliaquiz.com" class="website-link">evaliaquiz.com</a>
            </p>
        </div>
    </div>
</body>
</html>
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