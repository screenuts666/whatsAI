import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

// Configura il percorso del file JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyFile = path.join(__dirname, 'credentials/google-sheet.json');

// Configurazione dell'autenticazione
const auth = new google.auth.GoogleAuth({
  keyFile, // Percorso del file JSON
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

export async function readGoogleSheet() {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // ID del foglio Google Sheets
    const spreadsheetId = '1uDjvd8wtYDaAkI1Yzo7Zb7_J1Gdl2f6ZyBX2IAnCOZU';
    const range = 'Foglio1!A:C'; // Nome del foglio e intervallo di celle da leggere

    // Richiesta per ottenere i dati
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (rows.length) {
      // Trasforma i dati in un oggetto chiave-valore
      const keyValueData = {};
      rows.forEach((row) => {
        if (row[0] && row[2]) {
          // Assicura che ci siano sia chiave che valore
          keyValueData[row[0]] = row[2];
        }
      });

      console.log('Dati trasformati in chiave-valore:', keyValueData);
      return keyValueData; // Ritorna solo chiave-valore
    } else {
      console.log('Nessun dato trovato.');
      return {};
    }
  } catch (error) {
    console.error('Errore durante la lettura del foglio Google Sheet:', error);
    throw error; // Lancia un errore se qualcosa va storto
  }
}
