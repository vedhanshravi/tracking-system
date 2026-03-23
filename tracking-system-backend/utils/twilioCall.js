const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSmsMessage(toPhone, body) {
  const message = await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER || "+13502206189",
    to: toPhone,
    body,
  });
  return message.sid;
}

module.exports = { client, sendSmsMessage };