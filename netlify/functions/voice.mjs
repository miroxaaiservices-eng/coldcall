import twilio from "twilio";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200 };

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  // Support form-encoded & JSON & querystring
  const isJson = (event.headers["content-type"] || "").includes("application/json");
  const bodyParams = event.httpMethod === "POST"
    ? (isJson ? JSON.parse(event.body || "{}")
              : Object.fromEntries(new URLSearchParams(event.body || "")))
    : {};

  const queryParams = event.queryStringParameters || {};
  const to = bodyParams.To || queryParams.To || "";
  const from = process.env.TWILIO_CALLER_ID; // e.g. +15065551234

  if (!to) {
    twiml.say("Missing destination number.");
  } else {
    const dial = twiml.dial({ callerId: from });
    dial.number(to);
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/xml" },
    body: twiml.toString()
  };
}
