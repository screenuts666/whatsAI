const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const OpenAI = require("openai");
require("dotenv").config();

// Configurazione OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Say this is a test" }],
    model: "gpt-3.5-turbo",
  });

  console.log(chatCompletion.choices);
}

const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message_create", async (message) => {
  // Ignora i messaggi del bot per evitare loop
  if (message.fromMe) return;

  // Invia la domanda a ChatGPT
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message.body }],
    });

    const chatGPTReply = response.data.choices[0].message.content;
    // Rispondi con la risposta di ChatGPT
    client.sendMessage(message.from, chatGPTReply);
  } catch (error) {
    console.error("Errore nell'invio della richiesta a OpenAI:", error);
    client.sendMessage(
      message.from,
      "C'è stato un errore nel rispondere alla tua domanda."
    );
  }
});

main();
client.initialize();
