// api/saveResult.js
import { google } from "googleapis";
import { promises as fs } from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Load service account credentials
    const filePath = path.join(process.cwd(), "config", "service-account.json");
    const keyFile = await fs.readFile(filePath, "utf-8");
    const credentials = JSON.parse(keyFile);

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
    const range = "Responses!A:O"; // Match your sheet structure

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

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("saveResult error:", err?.response?.data || err.message || err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
}
