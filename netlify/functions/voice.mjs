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

  const twiml = new twilio.twiml.VoiceResponse();

  const isJson = (event.headers["content-type"] || "").includes("application/json");
  const bodyParams = event.httpMethod === "POST"
    ? (isJson ? JSON.parse(event.body || "{}")
              : Object.fromEntries(new URLSearchParams(event.body || "")))
    : {};
  const queryParams = event.queryStringParameters || {};

  const to   = bodyParams.To || queryParams.To || "";
  const from = process.env.TWILIO_CALLER_ID; // e.g. +15065551234

  if (!to) {
    twiml.say("Missing destination number.");
  } else {
    const dial = twiml.dial({ callerId: from });
    dial.number(to);
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/xml", ...corsHeaders },
    body: twiml.toString()
  };
}
