// api/saveResult.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 🔍 Debug logs to confirm env vars are loading
    console.log("ENV.SHEET_ID:", process.env.SHEET_ID);
    console.log("ENV keys:", Object.keys(process.env));

    const spreadsheetId = process.env.SHEET_ID;
    if (!spreadsheetId) {
      throw new Error("SHEET_ID is undefined");
    }

    // Grab fields from frontend payload
    const {
      name = "",
      email = "",
      successPath = "",
      answers = [],
      gdpr = false,
    } = req.body || {};

    // Build the row
    const row = [
      new Date().toISOString(), // A Timestamp
      name,                     // B Name
      email,                    // C Email
      successPath,              // D Path
      JSON.stringify(answers),  // E Answers
      gdpr ? "yes" : "no",      // F GDPR
      "", "", "", "", "", "", "", "", "" // G..O placeholders
    ];

    // Auth with Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // 🔑 Fix line breaks
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Append to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Responses!A:O",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("saveResult error:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Internal server error" });
  }
}
