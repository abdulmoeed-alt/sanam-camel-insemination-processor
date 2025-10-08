// 1. Import Account from the new '@alicloud/mns' package
const { Account } = require("@alicloud/mns");

let account;

// Initialize the MNS Account object (singleton pattern)
function getAccount() {
  if (!account) {
    // 2. Check for the new required environment variables
    if (!process.env.ALIYUN_ACCESS_KEY_ID || !process.env.ALIYUN_ACCESS_KEY_SECRET || !process.env.MNS_ACCOUNT_ID || !process.env.MNS_REGION) {
      throw new Error("MNS environment variables (KEY, SECRET, MNS_ACCOUNT_ID, MNS_REGION) are not properly set!");
    }
    
    // The new SDK uses Account ID and Region instead of a full endpoint
    account = new Account(
      process.env.MNS_ACCOUNT_ID,
      process.env.ALIYUN_ACCESS_KEY_ID,
      process.env.ALIYUN_ACCESS_KEY_SECRET,
      process.env.MNS_ACCOUNT_ID
    );
  }
  return account;
}

async function sendMessage(queueName, messageBody, delaySeconds) {
  const mnsAccount = getAccount();

  try {
    // 3. Get a reference to the specific queue
    const queue = mnsAccount.getQueue(queueName);
    
    const message = JSON.stringify(messageBody);
    const priority = 8; // Default priority (1-16), 8 is the default
    
    // 4. Call sendMessage with the new method signature: (message, priority, delaySeconds)
    const resp = await queue.sendMessage(message, priority, delaySeconds || 0);

    console.log("MNS message sent successfully. MessageID:", resp.MessageId);
    return resp;
  } catch (error) {
    console.error("Failed to send MNS message:", error.message);
    // The new SDK often wraps errors, access original error info if needed
    if (error.data) {
        console.error("Error details:", error.data.Error);
    }
    throw error;
  }
}

module.exports = { sendMessage };