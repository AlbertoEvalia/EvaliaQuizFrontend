import express from 'express';

const router = express.Router();

// Temporary storage (in production use database)
const magicTokens = new Map();

router.post('/magic-link', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  // Generate token
  const token = Math.random().toString(36).substring(7);
  
  // Store token (expires in 15 minutes)
  magicTokens.set(token, {
    email: email.toLowerCase(),
    expiresAt: Date.now() + 15 * 60 * 1000
  });

  console.log(`Magic link token for ${email}: ${token}`);
  
  res.json({ success: true });
});

export default router;