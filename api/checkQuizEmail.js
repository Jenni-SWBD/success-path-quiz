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
    console.log(
    "GOOGLE_SERVICE_ACCOUNT exists:",
  !!process.env.GOOGLE_SERVICE_ACCOUNT
);

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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
