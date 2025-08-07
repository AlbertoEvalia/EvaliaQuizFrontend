// src/data/questionPool/fr/index.js
// Question Pool en Français - Tous les sujets résumés - ÉLARGI

import { MATHEMATIQUES_FR } from './mathematiques.js';
import { ASTRONOMIE_FR } from './astronomie.js';
import { PHYSIQUE_FR } from './physique.js';
import { CHIMIE_FR } from './chimie.js';
import { BIOLOGIE_FR } from './biologie.js';
import { HISTOIRE_FR } from './histoire.js';
import { GEOGRAPHIE_FR } from './geographie.js';
import { ART_FR } from './art.js';
import { LITTERATURE_FR } from './litterature.js';
import { MUSIQUE_FR } from './musique.js';
import { INVENTIONS_FR } from './inventions.js';
import { PHILOSOPHIE_FR } from './philosophie.js';
import { MEDECINE_FR } from './medecine.js';

// Toutes les questions en français résumées
export const QUESTIONS_FR = [
  ...MATHEMATIQUES_FR,
  ...ASTRONOMIE_FR,
  ...PHYSIQUE_FR,
  ...CHIMIE_FR,
  ...BIOLOGIE_FR,
  ...HISTOIRE_FR,
  ...GEOGRAPHIE_FR,
  ...ART_FR,
  ...LITTERATURE_FR,
  ...MUSIQUE_FR,
  ...INVENTIONS_FR,
  ...PHILOSOPHIE_FR,
  ...MEDECINE_FR
];

// Statistiques
export const getQuestionStats = () => {
  const stats = {
    mathematiques: MATHEMATIQUES_FR.length,
    astronomie: ASTRONOMIE_FR.length,
    physique: PHYSIQUE_FR.length,
    chimie: CHIMIE_FR.length,
    biologie: BIOLOGIE_FR.length,
    histoire: HISTOIRE_FR.length,
    geographie: GEOGRAPHIE_FR.length,
    art: ART_FR.length,
    litterature: LITTERATURE_FR.length,
    musique: MUSIQUE_FR.length,
    inventions: INVENTIONS_FR.length,
    philosophie: PHILOSOPHIE_FR.length,
    medecine: MEDECINE_FR.length
  };
  
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  return {
    total,
    byTopic: stats
  };
};

// Export pour la compatibilité avec le système existant
export default QUESTIONS_FR;

console.log('📊 Questions en français chargées:', getQuestionStats());