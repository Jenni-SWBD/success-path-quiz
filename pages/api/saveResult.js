// pages/api/saveResult.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, answers, successPath, gdpr, dateISO } = req.body;

    if (!name || !email || !answers || !successPath) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Spreadsheet ID + Tab name
    const spreadsheetId = process.env.SHEET_ID;
    const range = "Responses!A:Q"; // Covers Date → KIT Tag Date

    // Build row data (17 values total)
    const row = [
      dateISO || new Date().toISOString(), // A Date
      name,                                // B Name
      email,                               // C Email
      ...(answers || []),                  // D–N (Q1–Q11)
      successPath,                         // O Success Path
      "",                                  // P Daily Log Date
      ""                                   // Q KIT Tag Date
    ];

    // Append row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

    return res.status(200).json({ message: "Saved successfully" });
  } catch (err) {
    console.error("saveResult error:", err);
    return res.status(500).json({ error: err.message });
  }
}
