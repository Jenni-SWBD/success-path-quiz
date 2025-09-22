// api/saveResult.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ---- Guard & normalize env vars ----
    const sheetId = process.env.SHEET_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!sheetId) throw new Error("SHEET_ID is undefined");
    if (!clientEmail) throw new Error("GOOGLE_CLIENT_EMAIL is undefined");
    if (!rawKey) throw new Error("GOOGLE_PRIVATE_KEY is undefined");

    // Accept both formats: with literal \n or real linebreaks
    const privateKey = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;

    // ---- Google auth ----
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    // ---- Payload from frontend ----
    const {
      name = "",
      email = "",
      successPath = "",
      answers = [], // expect 11 entries
      gdpr = false,
    } = req.body || {};

    // Make sure answers are exactly 11 cells (Q1..Q11)
    const eleven = Array.from({ length: 11 }, (_, i) => answers[i] ?? "");

    // Build row to match your headers:
    // Date, Name, Email, Q1..Q11, Success Path  => 15 columns (A:O)
    const row = [
      new Date().toISOString(), // Date
      name,
      email,
      ...eleven,                // Q1..Q11 (11 cells)
      successPath,              // Success Path
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Responses!A:O",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("saveResult error:", err?.response?.data || err?.message || err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
}
