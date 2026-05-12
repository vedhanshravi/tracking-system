const https = require("https");

const EXOTEL_API_KEY = process.env.EXOTEL_API_KEY;
const EXOTEL_API_TOKEN = process.env.EXOTEL_API_TOKEN;
const EXOTEL_FROM_NUMBER = process.env.EXOTEL_FROM_NUMBER;

// Account SID is typically derived from the API key (first part before the hash)
// For Exotel, we'll use a standard account identifier
const EXOTEL_ACCOUNT_SID = "vehicletracker";

/**
 * Send SMS via Exotel API
 * @param {string} toPhone - Recipient phone number (with +91 prefix)
 * @param {string} body - Message body
 * @returns {Promise}
 */
async function sendSmsMessage(toPhone, body) {
  return new Promise((resolve, reject) => {
    // Phone number is already sent from frontend with +91 prefix
    const formattedPhone = toPhone.startsWith("+") ? toPhone : `+91${toPhone}`;

    const postData = new URLSearchParams({
      From: EXOTEL_FROM_NUMBER,
      To: formattedPhone,
      Body: body,
    }).toString();

    const options = {
      hostname: "api.exotel.com",
      port: 443,
      path: `/v1/accounts/${EXOTEL_ACCOUNT_SID}/sms/send.json`,
      method: "POST",
      auth: `${EXOTEL_API_KEY}:${EXOTEL_API_TOKEN}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log("SMS sent successfully via Exotel:", response);
            resolve(response);
          } else {
            console.error("Exotel SMS error:", response);
            reject(new Error(`Exotel SMS failed: ${response.message || res.statusCode}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (error) => {
      console.error("Exotel SMS request error:", error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Initiate a call via Exotel API
 * @param {string} from - Caller phone number (with +91 prefix)
 * @param {string} to - Recipient phone number (with +91 prefix)
 * @returns {Promise}
 */
async function initiateCall(from, to) {
  return new Promise((resolve, reject) => {
    // Phone numbers are already sent from frontend with +91 prefix
    const fromPhone = from.startsWith("+") ? from : `+91${from}`;
    const toPhone = to.startsWith("+") ? to : `+91${to}`;
    const callerId = EXOTEL_FROM_NUMBER.startsWith("+") ? EXOTEL_FROM_NUMBER : `+91${EXOTEL_FROM_NUMBER}`;

    const postData = new URLSearchParams({
      From: fromPhone,
      To: toPhone,
      CallerId: callerId,
      CallType: "trans",
      StatusCallback: `${process.env.SERVER_URL || "http://localhost:5000"}/api/vehicles/call-callback`,
    }).toString();

    const options = {
      hostname: "api.exotel.com",
      port: 443,
      path: `/v1/accounts/${EXOTEL_ACCOUNT_SID}/calls/connect.json`,
      method: "POST",
      auth: `${EXOTEL_API_KEY}:${EXOTEL_API_TOKEN}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log("Call initiated successfully via Exotel:", response);
            resolve(response);
          } else {
            console.error("Exotel call error:", response);
            reject(new Error(`Exotel call failed: ${response.message || res.statusCode}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (error) => {
      console.error("Exotel call request error:", error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

module.exports = { sendSmsMessage, initiateCall };
