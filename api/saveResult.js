import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    console.log("=== DEBUG START ===");
    console.log("GOOGLE_CLIENT_EMAIL:", process.env.GOOGLE_CLIENT_EMAIL || "MISSING");
    console.log("GOOGLE_PRIVATE_KEY:", process.env.GOOGLE_PRIVATE_KEY ? "PRESENT" : "MISSING");
    console.log("SHEET_ID:", process.env.SHEET_ID || "MISSING");
    console.log("===================");

    const { name, email } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: "Missing form data" });

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.SHEET_ID)
      return res.status(500).json({ error: "Missing env vars" });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: "A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[new Date().toISOString(), name, email]] },
    });

    console.log("✅ Row appended successfully for", email);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ saveResult error:", err);
    res.status(500).json({ error: err.message });
  }
}
