import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY, // ✅ now safe: real multi-line key
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const {
      name = "",
      email = "",
      successPath = "",
      answers = [],
      gdpr = false,
    } = req.body || {};

    const spreadsheetId = process.env.SHEET_ID;
    const range = "Responses!A:O";

    const row = [
      new Date().toISOString(),
      name,
      email,
      successPath,
      JSON.stringify(answers),
      gdpr ? "yes" : "no",
      "", "", "", "", "", "", "", "", ""
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("saveResult error:", err.message || err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
