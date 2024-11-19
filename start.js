import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import OpenAI from "openai";
import dotenv from "dotenv";
import getPersonalitySystemMessage from "./personalityService.js";

dotenv.config();

// Configurazione OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Funzione per normalizzare il messaggio
function normalizeMessage(message) {
  return message
    .trim() // Rimuove spazi all'inizio e alla fine
    .replace(/[^a-zA-Z0-9\s]/g, "") // Rimuove caratteri speciali
    .replace(/\s+/g, " ") // Sostituisce spazi multipli con uno singolo
    .toLowerCase(); // Converte tutto in minuscolo
}

// Funzione per ottenere la risposta da ChatGPT
async function getChatGPTResponse(userMessage) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        getPersonalitySystemMessage(), // Otteniamo la personality
        { role: "user", content: userMessage },
      ],
      max_tokens: 250,
    });
    console.log("Token utilizzati:", response.usage.total_tokens);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Errore nell'invio della richiesta a OpenAI:", error);
    return "Si è verificato un errore. Riprova più tardi.";
  }
}

// Inizializzazione del client di WhatsApp
const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message_create", async (message) => {
  if (message.fromMe) return; // Ignora i messaggi da se stessi
  if (message.isGroupMsg) return; // Ignora i messaggi dai gruppi
  if (message.type !== "chat") return; // Ignora messaggi multimediali, immagini, video, ecc.

  console.log("Messaggio ricevuto:", message.body);

  // Normalizza il messaggio in entrata
  const normalizedMessage = normalizeMessage(message.body);

  // Gestione delle parole d’ordine
  if (normalizedMessage === "pagato") {
    // Risposta automatica per la parola d'ordine "PAGATO"
    const thankYouMessage = "Grazie! A breve verrai iscritt*.";
    console.log("Risposta automatica inviata per 'PAGATO':", thankYouMessage);
    await client.sendMessage(message.from, thankYouMessage);
    return; // Interrompi la gestione del messaggio qui
  }

  try {
    // Chiamata a ChatGPT per altri messaggi
    const reply = await getChatGPTResponse(normalizedMessage);
    console.log("Risposta inviata:", reply);
    await client.sendMessage(message.from, reply);
  } catch (error) {
    console.error("Errore durante la gestione del messaggio:", error);
    await client.sendMessage(
      message.from,
      "Si è verificato un errore nel rispondere alla tua richiesta."
    );
  }
});

client.initialize();
