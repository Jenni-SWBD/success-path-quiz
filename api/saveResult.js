// /api/saveResult.js
import { google } from "googleapis";

export default async function handler(req, res) {
  // --- CORS fix for Squarespace embed ---
  res.setHeader("Access-Control-Allow-Origin", "https://jennijohnson.co.uk");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  // --------------------------------------

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("saveResult invoked:", req.body);

    const { name, email, answers, successPath, gdpr, dateISO } = req.body;

    // Required fields check — only runs when quiz is completed
    if (!name || !email || !Array.isArray(answers) || answers.length === 0 || !successPath) {
      console.error("❌ Missing required fields:", { name, email, answers, successPath });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate environment variables
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.SHEET_ID) {
      console.error("❌ Missing Google environment variables");
      return res.status(500).json({ error: "Server not configured correctly" });
    }

    // --- Authenticate with Google Sheets API ---
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SHEET_ID;
    const range = "Responses!A:O"; // stops at O (Success Path)

    // Build new row
    const row = [
      dateISO || new Date().toISOString(), // A: Timestamp
      name,                                // B: Name
      email,                               // C: Email
      ...(answers || []),                  // D–N: Quiz answers
      successPath,                         // O: Success Path
    ];

    console.log("📄 Appending completed quiz row:", row);

    // Timeout wrapper (8s)
    const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

    // Append with 8-second timeout
    await Promise.race([
      sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [row] },
      }),
      timeout(8000),
    ]);

    console.log("✅ Row successfully appended to Google Sheet");
    return res.status(200).json({ message: "Saved successfully" });
  } catch (err) {
    console.error("🔥 saveResult error:", err);
    return res.status(500).json({ error: err.message });
  }
}
