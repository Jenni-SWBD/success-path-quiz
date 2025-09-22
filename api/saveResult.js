// api/saveResult.js
import { google } from "googleapis";
import { promises as fs } from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Load your service account JSON
    const filePath = path.join(process.cwd(), "config", "service-account.json");
    const keyFile = await fs.readFile(filePath, "utf-8");
    const credentials = JSON.parse(keyFile);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Extract quiz data from request
    const { name, email, gdpr, answers, successPath } = req.body;

    // Spreadsheet details
    const spreadsheetId = "1a7XWCU2q2iqHfr8QaR52gxJFNZUid0pbZ4_fjmUPdpM"; // ✅ your sheet ID
    const range = "Responses!A2:O"; // ✅ writes Date → Success Path only

    // Format today's date/time in UK style
    const now = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });

    // Row matches your header:
    // Date | Name | Email | GDPR | Q1...Q11 | Success Path
    const row = [
      now,
      name,
      email,
      gdpr ? "Yes" : "No",
      ...answers,
      successPath,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

    return res.status(200).json({ message: "Saved to Google Sheets" });
  } catch (error) {
    console.error("Error saving result:", error);
    return res.status(500).json({ error: "Failed to save result" });
  }
}
