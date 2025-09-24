export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, result } = req.body;

  // Validate incoming data
  if (!email || !result) {
    return res.status(400).json({ error: "Missing email or result" });
  }

  // Map quiz results to Kit tag IDs
  const TAG_MAP = {
    Impact: "8184863",
    Growth: "8184865",
    Balance: "8157430",
    Transformation: "8184866"
  };

  const tagId = TAG_MAP[result];
  if (!tagId) {
    return res.status(400).json({ error: `Invalid result value: ${result}` });
  }

  try {
    // 1. Create or update subscriber
    const subResp = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": process.env.KIT_API_KEY
      },
      body: JSON.stringify({ email_address: email })
    });

    if (!subResp.ok) {
      const errText = await subResp.text();
      throw new Error(`Subscriber request failed: ${subResp.status} ${errText}`);
    }

    const subscriber = await subResp.json();

    if (!subscriber || !subscriber.id) {
      throw new Error("Subscriber creation/update failed: no ID returned");
    }

    // 2. Apply tag to subscriber
    const tagResp = await fetch(
      `https://api.kit.com/v4/subscribers/${subscriber.id}/tags`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": process.env.KIT_API_KEY
        },
        body: JSON.stringify({ tag_id: tagId })
      }
    );

    if (!tagResp.ok) {
      const errText = await tagResp.text();
      throw new Error(`Tag request failed: ${tagResp.status} ${errText}`);
    }

    const tagResult = await tagResp.json();

    // Success response
    return res.status(200).json({
      success: true,
      message: `Tagged ${email} with ${result}`,
      subscriber,
      tagResult
    });
  } catch (err) {
    console.error("Tagging error:", err);
    return res.status(500).json({
      error: "Failed to tag subscriber",
      details: err.message
    });
  }
}
