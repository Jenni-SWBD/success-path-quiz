// /api/checkQuizEmail.js
// Checks whether an email already exists in the quiz Google Sheet

import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ ok: false });
  }

  try {
    
    const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.SHEET_ID;
    const range = "Responses!C:C"; // email column

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = (resp.data.values || []).slice(1); // skip header row

    const normalisedEmail = email.trim().toLowerCase();

    const hasTakenQuiz = rows.some((row) => {
      if (!row[0]) return false;
      return row[0].trim().toLowerCase() === normalisedEmail;
    });

    return res.status(200).json({ hasTakenQuiz });
  } catch (err) {
    console.error("checkQuizEmail error", err);
    return res.status(500).json({ ok: false });
  }
}
