const admin = require('firebase-admin');

if (!admin.apps.length) {
  const creds = process.env.FCM_CREDENTIALS_JSON;
  if (!creds) {
    console.warn("No FCM_CREDENTIALS_JSON found in env; FCM disabled.");
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(creds))
      });
    } catch (e) {
      console.error("Failed to init firebase admin:", e);
    }
  }
}

async function sendPush({ androidId, iphoneId, title, body }) {
  if (!admin.apps.length) {
    console.warn("Firebase not initialized; skipping push.");
    return;
  }

  const tokens = [];
  if (androidId) tokens.push(androidId);
  if (iphoneId) tokens.push(iphoneId);

  if (tokens.length === 0) {
    console.log("No device tokens provided; nothing to send.");
    return;
  }

  const message = {
    notification: { title, body },
    tokens
  };

  const resp = await admin.messaging().sendEachForMulticast(message);
  console.log("FCM send result:", resp);
}

module.exports = { sendPush };
