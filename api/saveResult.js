// /api/saveResult.js
import { google } from "googleapis";

export default async function handler(req, res) {
  // --- CORS fix for Squarespace embed ---
  res.setHeader("Access-Control-Allow-Origin", "https://jennijohnson.co.uk");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // --------------------------------------

  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("saveResult invoked:", req.body);

    const { name, email, answers, successPath, gdpr, dateISO } = req.body;

    // Quick sanity check for required data
    if (!name || !email || !answers || !successPath) {
      console.error("❌ Missing required fields:", { name, email, answers, successPath });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate Google credentials exist
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.SHEET_ID) {
      console.error("❌ Missing Google env vars");
      return res.status(500).json({ error: "Server not configured" });
    }

    // --- ENV CHECK ---
    console.log("ENV CHECK:", {
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL ? "✔️ present" : "❌ missing",
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY
        ? `✔️ length ${process.env.GOOGLE_PRIVATE_KEY.length}`
        : "❌ missing",
      SHEET_ID: process.env.SHEET_ID ? "✔️ present" : "❌ missing",
    });
    // -----------------

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SHEET_ID;
    const range = "Responses!A:Q"; // Columns A–Q (17 total fields)

    // Build new row
    const row = [
      dateISO || new Date().toISOString(), // A: Date
      name,                                // B: Name
      email,                               // C: Email
      ...(answers || []),                  // D–N: Quiz answers
      successPath,                         // O: Success Path
      "",                                  // P: Daily Log Date (blank)
      "",                                  // Q: KIT Tag Date (blank)
    ];

    console.log("📄 Appending row to Google Sheet:", row);

    // Timeout wrapper to prevent hanging
    const timeout = (ms) =>
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

    // Append with 8-second safety timeout
    await Promise.race([
      sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [row] },
      }),
      timeout(8000),
    ]);

    console.log("✅ Row successfully appended");
    return res.status(200).json({ message: "Saved successfully" });
  } catch (err) {
    console.error("🔥 saveResult error:", err);
    return res.status(500).json({ error: err.message });
  }
}
