import twilio from "twilio";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200 };

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;   // ACxxxxxxxx
    const apiKeySid  = process.env.TWILIO_API_KEY_SID;   // SKxxxxxxxx
    const apiSecret  = process.env.TWILIO_API_KEY_SECRET;// API Key secret
    const appSid     = process.env.TWILIO_TWIML_APP_SID; // APxxxxxxxx

    // optional identity query param: ?identity=sales
    const qs = new URLSearchParams(event.queryStringParameters || {});
    const baseIdentity = qs.get("identity") || "agent";
    const identity = `${baseIdentity}-${Math.random().toString(36).slice(2,8)}`;

    const { jwt } = twilio;
    const { AccessToken } = jwt;
    const { VoiceGrant } = AccessToken;

    const token = new AccessToken(accountSid, apiKeySid, apiSecret, {
      identity,
      ttl: 3600 // 1 hour
    });

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: false
    });

    token.addGrant(voiceGrant);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.toJwt(), identity })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
