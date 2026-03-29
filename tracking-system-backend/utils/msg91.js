const https = require("https");
const { URLSearchParams } = require("url");

function normalizePhoneNumber(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length > 12 && digits.startsWith("+")) return digits.replace(/\D/g, "");
  return digits;
}

function sendRequest(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => reject(err));
  });
}

async function sendSmsMessage(toPhone, message) {
  const authKey = process.env.MSG91_AUTHKEY;
  const sender = process.env.MSG91_SENDER || "MSGIND";
  const route = process.env.MSG91_ROUTE || "4";
  const country = process.env.MSG91_COUNTRY || "91";

  if (!authKey) {
    throw new Error("MSG91_AUTHKEY is required to send SMS");
  }

  const normalized = normalizePhoneNumber(toPhone);
  if (!normalized) {
    throw new Error("Invalid phone number");
  }

  const params = new URLSearchParams({
    authkey: authKey,
    mobiles: normalized,
    message,
    sender,
    route,
    country,
    unicode: "0",
  });
  const url = `https://api.msg91.com/api/sendhttp.php?${params.toString()}`;
  const response = await sendRequest(url);
  return response;
}

module.exports = { sendSmsMessage };
