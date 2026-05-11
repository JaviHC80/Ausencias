const https = require("https");

exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const OS_APP_ID  = "3f434b86-889d-4a65-a1be-25d5df4ad281";
  const OS_API_KEY = "os_v2_app_h5buxbuitvfglin6exk56swsqemzvzl5vfeujbewql422gyhvogywclbepm4mz4svol2fqjwekzwi24etclcu76x3zhmtmhfjaytaai";

  try {
    const { msg, recipients } = JSON.parse(event.body);

    const payload = JSON.stringify({
      app_id: OS_APP_ID,
      include_aliases: { external_id: recipients },
      target_channel: "push",
      headings: { es: "📅 Control de Ausencias", en: "📅 Control de Ausencias" },
      contents: { es: msg, en: msg },
      android_accent_color: "FF1A237E",
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: "onesignal.com",
        path: "/api/v1/notifications",
        method: "POST",
        headers: {
          "Authorization": `Key ${OS_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve(data));
      });

      req.on("error", reject);
      req.write(payload);
      req.end();
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: result,
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
