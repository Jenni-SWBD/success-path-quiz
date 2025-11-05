// testGoogleSheets.js
// Quick test script to verify Google Sheets API connection via Service Account

require("dotenv").config();
const { google } = require("googleapis");

async function appendData() {
  try {
    // Authenticate with Google Sheets API using .env variables
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Spreadsheet info
    const spreadsheetId = process.env.SHEET_ID;
    const range = "Responses!A1";

    // Test row to append
    const values = [
      ["Test successful!", new Date().toISOString()],
    ];

    // Append the test data
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    console.log("✅ Data appended successfully!");
    console.log("Response status:", response.statusText || response.status);
  } catch (err) {
    console.error("❌ Error appending data:");
    console.error(err.message);
  }
}

appendData();
