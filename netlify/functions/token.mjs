import twilio from "twilio";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders };
  }

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;    // AC...
    const apiKeySid  = process.env.TWILIO_API_KEY_SID;    // SK...
    const apiSecret  = process.env.TWILIO_API_KEY_SECRET; // secret
    const appSid     = process.env.TWILIO_TWIML_APP_SID;  // AP...

    const qs = new URLSearchParams(event.queryStringParameters || {});
    const baseIdentity = qs.get("identity") || "agent";
    const identity = `${baseIdentity}-${Math.random().toString(36).slice(2,8)}`;

    const { jwt } = twilio;
    const { AccessToken } = jwt;
    const { VoiceGrant } = AccessToken;

    const token = new AccessToken(accountSid, apiKeySid, apiSecret, {
      identity,
      ttl: 3600
    });

    token.addGrant(new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: false
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({ token: token.toJwt(), identity })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: e.message })
    };
  }
}
