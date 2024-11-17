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
  `
};

// Funzione per ottenere la risposta da ChatGPT
async function getChatGPTResponse(userMessage) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        personalitySystemMessage,
        { role: "user", content: userMessage }
      ]
    });
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
  if (message.fromMe) return;
  console.log("Messaggio ricevuto:", message.body);
  try {
    // Chiamata a ChatGPT
    const reply = await getChatGPTResponse(message.body);
    await client.sendMessage(message.from, reply);
  } catch (error) {
    console.error("Errore durante la gestione del messaggio:", error);
    await client.sendMessage(message.from, "Si è verificato un errore nel rispondere alla tua richiesta.");
  }
});

client.initialize();
