import { readGoogleSheet } from './readGoogleSheet.js';
import { buildChatGPTRequest } from './requestStructure.js';

/**
 * Legge i dati dal foglio Google Sheets e genera il payload per OpenAI
 * @param {string} userMessage - Messaggio ricevuto dall'utente
 * @returns {Promise<Object>} Il payload da inviare a OpenAI
 */
export async function getChatGPTRequest(userMessage) {
  try {
    const personalityData = await readGoogleSheet();
    if (!personalityData) {
      throw new Error('Errore nella lettura del foglio.');
    }
    return buildChatGPTRequest(personalityData, userMessage);
  } catch (error) {
    console.error('Errore nel servizio di personalità:', error);
    return buildChatGPTRequest(
      {
        corePersonality: 'Errore: utilizzo di messaggi predefiniti.',
        date: 'Data non disponibile',
        location: 'Luogo non disponibile',
        startTime: '00:00',
        endTime: '12:00',
        costs: 'Informazioni sui costi non disponibili.',
        lineup: 'Line-up non disponibile.',
        infoline: 'Nessuna informazione aggiuntiva.',
        note: 'Nessuna nota.',
        limit: 'Nessun limite indicato.',
      },
      userMessage
    );
  }
}
