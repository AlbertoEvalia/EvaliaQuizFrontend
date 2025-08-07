// src/data/questionPool/es/index.js
// Pool de Preguntas en Español - Todos los Topics reunidos - COMPLETO

import { MATEMATICAS_ES } from './matematicas.js';
import { ASTRONOMIA_ES } from './astronomia.js';
import { FISICA_ES } from './fisica.js';
import { QUIMICA_ES } from './quimica.js';
import { BIOLOGIA_ES } from './biologia.js';
import { HISTORIA_ES } from './historia.js';
import { GEOGRAFIA_ES } from './geografia.js';
import { ARTE_ES } from './arte.js';
import { LITERATURA_ES } from './literatura.js';
import { MUSICA_ES } from './musica.js';
import { INVENTOS_ES } from './inventos.js';
import { FILOSOFIA_ES } from './filosofia.js';
import { MEDICINA_ES } from './medicina.js';

// Todas las preguntas en español reunidas
export const QUESTIONS_ES = [
  ...MATEMATICAS_ES,
  ...ASTRONOMIA_ES,
  ...FISICA_ES,
  ...QUIMICA_ES,
  ...BIOLOGIA_ES,
  ...HISTORIA_ES,
  ...GEOGRAFIA_ES,
  ...ARTE_ES,
  ...LITERATURA_ES,
  ...MUSICA_ES,
  ...INVENTOS_ES,
  ...FILOSOFIA_ES,
  ...MEDICINA_ES
];

// Estadísticas
export const getQuestionStats = () => {
  const stats = {
    matematicas: MATEMATICAS_ES.length,
    astronomia: ASTRONOMIA_ES.length,
    fisica: FISICA_ES.length,
    quimica: QUIMICA_ES.length,
    biologia: BIOLOGIA_ES.length,
    historia: HISTORIA_ES.length,
    geografia: GEOGRAFIA_ES.length,
    arte: ARTE_ES.length,
    literatura: LITERATURA_ES.length,
    musica: MUSICA_ES.length,
    inventos: INVENTOS_ES.length,
    filosofia: FILOSOFIA_ES.length,
    medicina: MEDICINA_ES.length
  };
  
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  return {
    total,
    byTopic: stats
  };
};

// Export para compatibilidad con el sistema existente
export default QUESTIONS_ES;

console.log('📊 Preguntas en español cargadas:', getQuestionStats());