// pages/api/subscribe.js
// Handles ConvertKit double opt-in subscription for the Success Path Quiz
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const { email, first_name = "", last_name = "", quizData = {} } = req.body || {};

  if (!email) {
    return res.status(400).json({ ok: false, message: "Email is required" });
  }

  const kitApiKey = process.env.KIT_QUIZ_V3_KEY || process.env.KIT_API_KEY;
  const kitFormId = process.env.KIT_FORM_ID;

  if (!kitApiKey || !kitFormId) {
    console.error("Missing KIT env vars");
    return res.status(500).json({ ok: false, message: "Server not configured" });
  }

  try {
    const body = {
      api_key: kitApiKey,
      email,
      first_name,
    };

    const kitResp = await fetch(
      `https://api.convertkit.com/v3/forms/${kitFormId}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const kitJson = await kitResp.json();

    if (!kitResp.ok) {
      console.error("KIT API error", kitJson);
      return res
        .status(500)
        .json({ ok: false, message: "Could not start confirmation. Try again later." });
    }

    return res
      .status(200)
      .json({ ok: true, message: "Confirmation sent. Please check your inbox." });
  } catch (err) {
    console.error("Subscribe error", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}
