const https = require("https");
const { URLSearchParams } = require("url");

function normalizeExotelPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith("091")) return `+${digits.slice(1)}`;
  if (digits.length > 12) return `+${digits}`;
  return `+${digits}`;
}

async function sendSmsMessage(toPhone, body) {
  const exotelSid = process.env.EXOTEL_SID;
  const exotelToken = process.env.EXOTEL_TOKEN;
  const exotelFrom = process.env.EXOTEL_PHONE_NUMBER;

  if (!exotelSid || !exotelToken || !exotelFrom) {
    throw new Error("Missing Exotel SMS configuration");
  }

  const normalizedTo = normalizeExotelPhone(toPhone);
  if (!normalizedTo) {
    throw new Error("Invalid phone number");
  }

  const payload = new URLSearchParams({
    From: exotelFrom,
    To: normalizedTo,
    Body: body,
  }).toString();

  const options = {
    hostname: "api.exotel.com",
    path: `/v1/Accounts/${encodeURIComponent(exotelSid)}/Sms/send`,
    method: "POST",
    auth: `${exotelSid}:${exotelToken}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (parseErr) {
            resolve(data);
          }
        } else {
          reject(new Error(`Exotel SMS request failed ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

module.exports = { sendSmsMessage };