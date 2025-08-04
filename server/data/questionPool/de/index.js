// src/data/questionPool/de/index.js
// Deutscher Question Pool - Alle Topics zusammengefasst - ERWEITERT

import { MATHEMATIK_DE } from './mathematik.js';
import { ASTRONOMIE_DE } from './astronomie.js';
import { PHYSIK_DE } from './physik.js';
import { CHEMIE_DE } from './chemie.js';
import { BIOLOGIE_DE } from './biologie.js';
import { GESCHICHTE_DE } from './geschichte.js';
import { GEOGRAPHIE_DE } from './geographie.js';
import { KUNST_DE } from './kunst.js';
import { LITERATUR_DE } from './literatur.js';
import { MUSIK_DE } from './musik.js';
import { ERFINDUNGEN_DE } from './erfindungen.js';
import { PHILOSOPHIE_DE } from './philosophie.js';
import { MEDIZIN_DE } from './medizin.js';

// Alle deutschen Fragen zusammengefasst
export const QUESTIONS_DE = [
  ...MATHEMATIK_DE,
  ...ASTRONOMIE_DE,
  ...PHYSIK_DE,
  ...CHEMIE_DE,
  ...BIOLOGIE_DE,
  ...GESCHICHTE_DE,
  ...GEOGRAPHIE_DE,
  ...KUNST_DE,
  ...LITERATUR_DE,
  ...MUSIK_DE,
  ...ERFINDUNGEN_DE,
  ...PHILOSOPHIE_DE,
  ...MEDIZIN_DE
];

// Statistiken
export const getQuestionStats = () => {
  const stats = {
    mathematik: MATHEMATIK_DE.length,
    astronomie: ASTRONOMIE_DE.length,
    physik: PHYSIK_DE.length,
    chemie: CHEMIE_DE.length,
    biologie: BIOLOGIE_DE.length,
    geschichte: GESCHICHTE_DE.length,
    geographie: GEOGRAPHIE_DE.length,
    kunst: KUNST_DE.length,
    literatur: LITERATUR_DE.length,
    musik: MUSIK_DE.length,
    erfindungen: ERFINDUNGEN_DE.length,
    philosophie: PHILOSOPHIE_DE.length,
    medizin: MEDIZIN_DE.length
  };
  
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  return {
    total,
    byTopic: stats
  };
};

// Export für Kompatibilität mit bestehendem System
export default QUESTIONS_DE;

console.log('📊 Deutsche Fragen geladen:', getQuestionStats());