// api/saveResult.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Load service account credentials from Vercel env vars
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
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
    const range = "Responses!A:O"; // Match your sheet structure (15 columns)

    // Build a row with 15 columns (A → O)
    const row = [
      new Date().toISOString(), // A Timestamp
      name,                     // B Name
      email,                    // C Email
      successPath,              // D Path
      JSON.stringify(answers),  // E Answers
      gdpr ? "yes" : "no",      // F GDPR
      "", "", "", "", "", "", "", "", "" // G..O placeholders
    ];

    console.log("saveResult API called with:", req.body);
    console.log("Appending row:", row);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    console.log("Google Sheets API response:", response.data);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("saveResult error:", err?.response?.data || err.message || err);
    return res
      .status(500)
      .json({ error: err?.message || "Internal server error" });
  }
}
