export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email, result } = req.body;
  if (!email || !result)
    return res.status(400).json({ error: "Missing email or result" });

  // Pathway result tags
  const TAG_MAP = {
    Identity: "8184863",
    Expansion: "8184865",
    Stability: "8157430",
    Evolution: "8184866"
  };

  // System tags
  const QUIZ_COMPLETED_TAG_ID = "15993813";
  const AUDIENCE_ACTIVE_TAG_ID = "16076303";

  const currentResultTagId = TAG_MAP[result];
  if (!currentResultTagId)
    return res.status(400).json({ error: `Invalid result value: ${result}` });

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

    const subData = await subResp.json();
    const subscriber = subData?.subscriber;
    if (!subscriber?.id)
      throw new Error("Subscriber creation/update failed: no ID returned");

    const subscriberId = subscriber.id;

    // 2. Remove ALL pathway result tags first
    const allPathwayTagIds = Object.values(TAG_MAP);

    for (const tagId of allPathwayTagIds) {
      await fetch(
        `https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriberId}`,
        {
          method: "DELETE",
          headers: {
            "X-Kit-Api-Key": process.env.KIT_API_KEY
          }
        }
      );
    }

    // 3. Apply system tags + current result tag
    const tagsToApply = [
      QUIZ_COMPLETED_TAG_ID,
      AUDIENCE_ACTIVE_TAG_ID,
      currentResultTagId
    ];

    for (const tagId of tagsToApply) {
      const tagResp = await fetch(
        `https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriberId}`,
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
    }

    return res.status(200).json({
      success: true,
      message: `Tagged ${email} with ${result} and cleaned old pathway tags`,
      subscriber
    });

  } catch (err) {
    console.error("Tagging error:", err);
    return res.status(500).json({
      error: "Failed to tag subscriber",
      details: err.message
    });
  }
}
