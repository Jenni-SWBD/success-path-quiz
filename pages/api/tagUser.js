export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, result } = req.body;
  if (!email || !result) return res.status(400).json({ error: "Missing email or result" });

  const TAG_MAP = {
    Impact: "8184863",
    Growth: "8184865",
    Balance: "8157430",
    Transformation: "8184866"
  };
  const tagId = TAG_MAP[result];
  if (!tagId) return res.status(400).json({ error: `Invalid result value: ${result}` });

  try {
    // 1) Create or update subscriber
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
    const subData = await subResp.json();
    const subscriber = subData?.subscriber;
    if (!subscriber?.id) throw new Error("Subscriber creation/update failed: no ID returned");

    // 2) Tag the subscriber (v4: /tags/{tag_id}/subscribers/{id})
    const tagResp = await fetch(
      `https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriber.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": process.env.KIT_API_KEY
        },
        body: JSON.stringify({})
      }
    );
    if (!tagResp.ok) {
      const errText = await tagResp.text();
      throw new Error(`Tag request failed: ${tagResp.status} ${errText}`);
    }
    const tagResult = await tagResp.json();

    return res.status(200).json({
      success: true,
      message: `Tagged ${email} with ${result}`,
      subscriber,
      tagResult
    });
  } catch (err) {
    console.error("Tagging error:", err);
    return res.status(500).json({ error: "Failed to tag subscriber", details: err.message });
  }
}
