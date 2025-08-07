// src/data/questionPool/it/index.js
// Question Pool in Italiano - Tutti gli argomenti riassunti - ESTESO

import { MATEMATICA_IT } from './matematica.js';
import { ASTRONOMIA_IT } from './astronomia.js';
import { FISICA_IT } from './fisica.js';
import { CHIMICA_IT } from './chimica.js';
import { BIOLOGIA_IT } from './biologia.js';
import { STORIA_IT } from './storia.js';
import { GEOGRAFIA_IT } from './geografia.js';
import { ARTE_IT } from './arte.js';
import { LETTERATURA_IT } from './letteratura.js';
import { MUSICA_IT } from './musica.js';
import { INVENZIONI_IT } from './invenzioni.js';
import { FILOSOFIA_IT } from './filosofia.js';
import { MEDICINA_IT } from './medicina.js';

// Tutte le domande in italiano riassunte
export const QUESTIONS_IT = [
  ...MATEMATICA_IT,
  ...ASTRONOMIA_IT,
  ...FISICA_IT,
  ...CHIMICA_IT,
  ...BIOLOGIA_IT,
  ...STORIA_IT,
  ...GEOGRAFIA_IT,
  ...ARTE_IT,
  ...LETTERATURA_IT,
  ...MUSICA_IT,
  ...INVENZIONI_IT,
  ...FILOSOFIA_IT,
  ...MEDICINA_IT
];

// Statistiche
export const getQuestionStats = () => {
  const stats = {
    matematica: MATEMATICA_IT.length,
    astronomia: ASTRONOMIA_IT.length,
    fisica: FISICA_IT.length,
    chimica: CHIMICA_IT.length,
    biologia: BIOLOGIA_IT.length,
    storia: STORIA_IT.length,
    geografia: GEOGRAFIA_IT.length,
    arte: ARTE_IT.length,
    letteratura: LETTERATURA_IT.length,
    musica: MUSICA_IT.length,
    invenzioni: INVENZIONI_IT.length,
    filosofia: FILOSOFIA_IT.length,
    medicina: MEDICINA_IT.length
  };
  
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  return {
    total,
    byTopic: stats
  };
};

// Export per compatibilità con il sistema esistente
export default QUESTIONS_IT;

console.log('📊 Domande in italiano caricate:', getQuestionStats());