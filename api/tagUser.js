export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, result } = req.body;
  if (!email || !result) {
    return res.status(400).json({ error: "Missing email or result" });
  }

  const RESULT_TAGS = {
    Identity: "8184863",
    Expansion: "8184865",
    Stability: "8157430",
    Evolution: "8184866"
  };

  const QUIZ_COMPLETED_TAG_ID = "15993813";
  const AUDIENCE_ACTIVE_TAG_ID = "16076303";

  const newResultTagId = RESULT_TAGS[result];
  if (!newResultTagId) {
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

    const subData = await subResp.json();
    const subscriber = subData?.subscriber;

    if (!subscriber?.id) {
      throw new Error("Subscriber creation/update failed: no ID returned");
    }

    const subscriberId = subscriber.id;

    // 2. REMOVE all existing result tags (clear history)
    for (const tagId of Object.values(RESULT_TAGS)) {
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

    // 3. Apply Quiz: Completed
    await fetch(
      `https://api.kit.com/v4/tags/${QUIZ_COMPLETED_TAG_ID}/subscribers/${subscriberId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": process.env.KIT_API_KEY
        },
        body: JSON.stringify({})
      }
    );

    // 4. Apply NEW result tag
    await fetch(
      `https://api.kit.com/v4/tags/${newResultTagId}/subscribers/${subscriberId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": process.env.KIT_API_KEY
        },
        body: JSON.stringify({})
      }
    );

    // 5. Apply Audience: Active
    await fetch(
      `https://api.kit.com/v4/tags/${AUDIENCE_ACTIVE_TAG_ID}/subscribers/${subscriberId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": process.env.KIT_API_KEY
        },
        body: JSON.stringify({})
      }
    );

    return res.status(200).json({
      success: true,
      message: `Tagged ${email} with latest result only`,
      subscriberId
    });

  } catch (err) {
    console.error("Tagging error:", err);
    return res.status(500).json({
      error: "Failed to tag subscriber",
      details: err.message
    });
  }
}
