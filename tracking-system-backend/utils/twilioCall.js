const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function callOwner(phoneNumber) {
  try {
    const call = await client.calls.create({
      //url: "http://demo.twilio.com/docs/voice.xml",
      url: "https://tracking-system-ij2v.onrender.com/twilio/connect-call?phone=" + phoneNumber,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return call.sid;
  } catch (error) {
    console.error("Twilio call error:", error);
    throw error;
  }
}

module.exports = callOwner;