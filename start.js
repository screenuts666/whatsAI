import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getChatGPTRequest } from './personalityService.js';
import { readGoogleSheet } from './readGoogleSheet.js';

dotenv.config();

// Configurazione OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Variabile globale per i dati di Google Sheets
let personalityData = null;

// Funzione per aggiornare i dati da Google Sheets
async function updatePersonalityFromSheet() {
  try {
    console.log('Aggiornamento dei dati da Google Sheets...');
    personalityData = await readGoogleSheet();
    console.log('Dati aggiornati:', personalityData);
  } catch (error) {
    console.error(
      "Errore durante l'aggiornamento dei dati da Google Sheets:",
      error
    );
  }
}

// Funzione per normalizzare il messaggio
function normalizeMessage(message) {
  return message
    .trim() // Rimuove spazi all'inizio e alla fine
    .replace(/[^a-zA-Z0-9\s]/g, '') // Rimuove caratteri speciali
    .replace(/\s+/g, ' ') // Sostituisce spazi multipli con uno singolo
    .toLowerCase(); // Converte tutto in minuscolo
}

// Funzione per ottenere la risposta da ChatGPT
async function getChatGPTResponse(userMessage) {
  try {
    const requestPayload = await getChatGPTRequest(
      userMessage,
      personalityData
    );
    const response = await openai.chat.completions.create(requestPayload);
    console.log('Token utilizzati:', response.usage.total_tokens);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Errore nell'invio della richiesta a OpenAI:", error);
    return 'Si è verificato un errore. Riprova più tardi.';
  }
}

// Inizializzazione del client di WhatsApp
const client = new Client();

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client is ready!');

  // Chiamata iniziale per leggere i dati da Google Sheets
  updatePersonalityFromSheet();

  // Imposta un intervallo per aggiornare i dati ogni 60 minuti
  setInterval(updatePersonalityFromSheet, 60 * 60 * 1000); // 60 minuti
});

client.on('message_create', async (message) => {
  if (message.fromMe || message.isGroupMsg || message.type !== 'chat') return;

  console.log('Messaggio ricevuto:', message.body);

  const normalizedMessage = normalizeMessage(message.body);

  // Gestione delle parole d’ordine
  if (normalizedMessage === 'aggiorna persona') {
    // Parola d'ordine per aggiornare i dati da Google Sheets
    console.log(
      "Parola d'ordine 'aggiorna persona' ricevuta. Aggiorno i dati da Google Sheets..."
    );
    await updatePersonalityFromSheet();
    await client.sendMessage(message.from, 'Persona AGGIORNATA con successo!');
    return;
  }

  if (normalizedMessage === 'pagato') {
    // Risposta automatica per la parola d'ordine "PAGATO"
    const thankYouMessage = 'Grazie! A breve verrai iscritt*.';
    console.log("Risposta automatica inviata per 'PAGATO':", thankYouMessage);
    await client.sendMessage(message.from, thankYouMessage);
    return;
  }

  // Risposta generata tramite ChatGPT
  try {
    console.log("Generazione della risposta per 'a che ora inizia'...");
    const reply = await getChatGPTResponse(normalizedMessage);
    console.log('Risposta inviata:', reply);
    await client.sendMessage(message.from, reply);
  } catch (error) {
    console.error('Errore durante la gestione del messaggio:', error);
    await client.sendMessage(
      message.from,
      'Si è verificato un errore nel rispondere alla tua richiesta.'
    );
  }
});

client.initialize();
