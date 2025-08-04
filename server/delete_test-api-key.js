// server/test-api-key.js - NEUE DATEI ERSTELLEN
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

console.log('=== GEMINI API KEY DIAGNOSE ===');
console.log('1. Roher API Key:', process.env.GEMINI_API_KEY);
console.log('2. API Key Länge:', process.env.GEMINI_API_KEY?.length);
console.log('3. Erste 10 Zeichen:', process.env.GEMINI_API_KEY?.substring(0, 10));
console.log('4. Letzte 5 Zeichen:', process.env.GEMINI_API_KEY?.slice(-5));

// Prüfe auf versteckte Zeichen
const key = process.env.GEMINI_API_KEY;
if (key) {
  console.log('5. Enthält Leerzeichen?', key.includes(' '));
  console.log('6. Enthält Zeilenumbruch?', key.includes('\n'));
  console.log('7. Beginnt mit AIza?', key.startsWith('AIza'));
  
  // Test ohne Trim
  console.log('\n=== TEST 1: Original Key ===');
  await testAPI(key);
  
  // Test mit Trim  
  console.log('\n=== TEST 2: Getrimmt ===');
  await testAPI(key.trim());
  
} else {
  console.log('❌ KEIN API KEY GEFUNDEN!');
}

async function testAPI(apiKey) {
  try {
    console.log(`Testing mit Key: "${apiKey.substring(0, 10)}...${apiKey.slice(-5)}"`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Say only: Hello World");
    const response = await result.response;
    
    console.log('✅ API FUNKTIONIERT!');
    console.log('Response:', response.text());
    
  } catch (error) {
    console.log('❌ API FEHLER:', error.message);
    if (error.status) {
      console.log('Status:', error.status);
    }
  }
}