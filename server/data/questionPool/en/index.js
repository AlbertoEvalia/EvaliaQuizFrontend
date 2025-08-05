// src/data/questionPool/en/index.js
// English Question Pool - All topics combined - EXTENDED

import { MATHEMATICS_EN } from './mathematics.js';
import { ASTRONOMY_EN } from './astronomy.js';
import { PHYSICS_EN } from './physics.js';
import { CHEMISTRY_EN } from './chemistry.js';
import { BIOLOGY_EN } from './biology.js';
import { HISTORY_EN } from './history.js';
import { GEOGRAPHY_EN } from './geography.js';
import { ART_EN } from './art.js';
import { LITERATURE_EN } from './literature.js';
import { MUSIC_EN } from './music.js';
import { INVENTIONS_EN } from './inventions.js';
import { PHILOSOPHY_EN } from './philosophy.js';
import { MEDICINE_EN } from './medicine.js';

// All English questions combined
export const QUESTIONS_EN = [
  ...MATHEMATICS_EN,
  ...ASTRONOMY_EN,
  ...PHYSICS_EN,
  ...CHEMISTRY_EN,
  ...BIOLOGY_EN,
  ...HISTORY_EN,
  ...GEOGRAPHY_EN,
  ...ART_EN,
  ...LITERATURE_EN,
  ...MUSIC_EN,
  ...INVENTIONS_EN,
  ...PHILOSOPHY_EN,
  ...MEDICINE_EN
];

// Statistics of questions count per topic
export const getQuestionStats = () => {
  const stats = {
    mathematics: MATHEMATICS_EN.length,
    astronomy: ASTRONOMY_EN.length,
    physics: PHYSICS_EN.length,
    chemistry: CHEMISTRY_EN.length,
    biology: BIOLOGY_EN.length,
    history: HISTORY_EN.length,
    geography: GEOGRAPHY_EN.length,
    art: ART_EN.length,
    literature: LITERATURE_EN.length,
    music: MUSIC_EN.length,
    inventions: INVENTIONS_EN.length,
    philosophy: PHILOSOPHY_EN.length,
    medicine: MEDICINE_EN.length
  };
  
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  return {
    total,
    byTopic: stats
  };
};

// Export for compatibility with existing system
export default QUESTIONS_EN;

// Log loaded questions and stats
const stats = getQuestionStats();
console.log(`📊 English questions loaded: Total ${stats.total}, Topics:`, stats.byTopic);
