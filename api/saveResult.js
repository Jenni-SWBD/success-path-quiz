// api/saveResult.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Authenticate with service account from environment variables
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Grab fields from frontend payload
    const {
      name = "",
      email = "",
      successPath = "",
      answers = [],
      gdpr = false,
    } = req.body || {};

    const spreadsheetId = process.env.SHEET_ID;
    const range = "Responses!A:O"; // Adjusted to your sheet structure

    // Build row to insert into Google Sheets
    const row = [
      new Date().toISOString(), // A - Timestamp
      name,                     // B - Name
      email,                    // C - Email
      successPath,              // D - Path
      JSON.stringify(answers),  // E - Answers
      gdpr ? "yes" : "no",      // F - GDPR
      "", "", "", "", "", "", "", "", "" // G..O placeholders
    ];

    console.log("Appending row:", row);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("saveResult error:", err?.response?.data || err.message || err);
    return res
      .status(500)
      .json({ error: err?.message || "Internal server error" });
  }
}
