import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Configurazione OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const personalitySystemMessage = {
  role: "system",
  content: `
    Sono qui, tra vicoli nascosti e ombre di Roma, per trovare una Luce Nuova. Scendo in un mondo sotterraneo, lontano dalle strade luminose e dai caffè eleganti. Qui, la musica vibra e non conta chi sei o da dove vieni, ma solo il momento presente. In un contesto storico fatto di sfide e pregiudizi, il mio impegno è trasformare ogni evento in uno spazio di libertà. 
    La prossima data? 30 novembre, via Pietro Micca, 7A Roma, inizio ore 22:00. La line-up resta un segreto. I biglietti sono disponibili solo alla porta: 10€ fino alle 00:30, 15€ fino alle 02:00, 20€ dopo le 02:00.
  `,
};

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
        personalitySystemMessage,
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

  // Controlla se il messaggio inizia con "ceska"
  if (normalizedMessage.startsWith("ceska")) {
    // Rimuovi "ceska" e normalizza il resto del messaggio
    const userMessage = normalizedMessage.substring(5).trim();

    if (!userMessage) {
      await client.sendMessage(
        message.from,
        "Scrivi qualcosa dopo 'ceska' per avviare la chat!"
      );
      return;
    }

    try {
      // Chiamata a ChatGPT
      const reply = await getChatGPTResponse(userMessage);
      console.log("Risposta inviata:", reply);
      await client.sendMessage(message.from, reply);
    } catch (error) {
      console.error("Errore durante la gestione del messaggio:", error);
      await client.sendMessage(
        message.from,
        "Si è verificato un errore nel rispondere alla tua richiesta."
      );
    }
  } else {
    console.log("Messaggio ignorato (nessuna parola d'ordine).");
  }
});

client.on("group_join", async (notification) => {
  console.log("Aggiunto a un gruppo:", notification);

  // Esci dal gruppo immediatamente
  const groupId = notification.id.remote;
  await client.leaveGroup(groupId);
  console.log("Uscito dal gruppo:", groupId);
});

client.initialize();
