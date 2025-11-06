// api/saveResult.js
import { google } from "googleapis";

export default async function handler(req, res) {
  // --- CORS fix for Squarespace embed ---
  res.setHeader("Access-Control-Allow-Origin", "https://jennijohnson.co.uk");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  // --------------------------------------

  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("📩 Incoming quiz submission:", req.body);

    const { name, email, answers, successPath, gdpr, dateISO } = req.body;

    // --- Validate incoming data ---
    if (!name || !email || !Array.isArray(answers) || !successPath) {
      console.error("❌ Missing required fields:", { name, email, answers, successPath });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // --- Validate Google credentials ---
    const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, SHEET_ID } = process.env;
    if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !SHEET_ID) {
      console.error("❌ Missing Google environment variables");
      return res.status(500).json({ error: "Server not configured" });
    }

    // --- Authenticate with Google Sheets API ---
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = SHEET_ID;
    const range = "Responses!A:O"; // Columns A–O only

    // --- Build the new row ---
    const row = [
      dateISO || new Date().toISOString(), // A: Date
      name,                                // B: Name
      email,                               // C: Email
      ...(answers || []),                  // D–N: Quiz answers
      successPath,                         // O: Success Path
    ];

    console.log("📝 Appending row to Google Sheet:", row);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    console.log("✅ Row successfully appended");
    return res.status(200).json({ message: "Saved successfully" });
  } catch (err) {
    console.error("🔥 saveResult error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
