import express from 'express';
import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const magicTokens = new Map();

// Email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

router.post('/magic-link', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const token = Math.random().toString(36).substring(7);
  
  magicTokens.set(token, {
    email: email.toLowerCase(),
    expiresAt: Date.now() + 15 * 60 * 1000
  });

  // Send email
  const magicLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}&email=${email}`;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🧠 Complete your EVALIA Quiz registration',
      html: `
        <h2>🎉 Welcome to EVALIA Quiz!</h2>
        <p>Click the link below to complete your registration:</p>
        <a href="${magicLink}" style="background: #FF6B35; color: white; padding: 10px 20px; text-decoration: none;">
          Complete Registration
        </a>
        <p>Link expires in 15 minutes.</p>
      `
    });

    console.log(`✅ Magic link sent to ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;