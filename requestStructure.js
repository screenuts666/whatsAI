/**
 * Costruisce il payload per ChatGPT
 * @typedef {Object} ChatGPTRequest
 * @property {string} model - Modello OpenAI da utilizzare
 * @property {Array} messages - Array di messaggi strutturati (es: role e content)
 * @property {number} max_tokens - Numero massimo di token nella risposta
 */

/**
 * Funzione che ritorna un payload ben strutturato per OpenAI
 * @param {Object} personalityData - Dati dinamici caricati da Google Sheets
 * @param {string} userMessage - Messaggio dell'utente
 * @returns {ChatGPTRequest} Payload da inviare a OpenAI
 */
export function buildChatGPTRequest(personalityData, userMessage) {
    // Crea il messaggio di sistema basato sui dati
    const systemMessage = `
      ${personalityData.corePersonality || ""}
      Dettagli evento:
      La prossima data? ${personalityData.date || "Data non definita"}, ${
      personalityData.location || "Luogo non definito"
    }.
      Orari: dalle ${personalityData.startTime || "Orario non definito"} alle ${
      personalityData.endTime || "Orario non definito"
    }.
      Costi: ${personalityData.costs || "Costi non definiti"}.
      Line-up della serata:
      ${personalityData.lineup || "Line-up non definita"}.
      Info utili:
      ${personalityData.infoline || "Informazioni non disponibili"}.
      Note aggiuntive:
      ${personalityData.note || ""}.
      Importante:
      ${personalityData.limit || ""}.
    `;
  
    // Ritorna il payload da inviare a OpenAI
    return {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      max_tokens: 800,
    };
  }
  