// api/saveResult.js
import { google } from "googleapis";
import { promises as fs } from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const filePath = path.join(process.cwd(), "config", "service-account.json");
    const keyFile = await fs.readFile(filePath, "utf-8");
    const credentials = JSON.parse(keyFile);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const { name = "", email = "", result = "" } = req.body || {};

    const spreadsheetId = process.env.SHEET_ID;
    const range = "Responses!A:D";

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[new Date().toISOString(), name, email, result]],
      },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("saveResult error:", err?.response?.data || err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
