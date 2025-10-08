const { handleStartInsemination } = require('./handlers/start');
const { handleCheckInseminationResult } = require('./handlers/checkInsemination');
const { handleCheckPregnancyResult } = require('./handlers/checkPregnancy');
const { handleBirthingCamelLactationEnd } = require('./handlers/lactationEnd');

exports.handler = async (event, context) => {
  // MNS may send an array of records; ensure we parse correctly
  let records;
  try {
    records = JSON.parse(event.toString());
  } catch (e) {
    console.error("Failed to parse event:", e);
    return;
  }

  for (const record of records) {
    let messageBody = record;
    // If MNS wrapped as { MessageBody: '...'}
    if (record && record.MessageBody) {
      try {
        messageBody = JSON.parse(record.MessageBody);
      } catch (e) {
        messageBody = record.MessageBody;
      }
    }

    const message = messageBody;
    console.log("Received message:", JSON.stringify(message));

    try {
      switch (message.action) {
        case 'start-insemination':
          await handleStartInsemination(message);
          break;

        case 'check-insemination-result':
          await handleCheckInseminationResult(message);
          break;

        case 'check-pregnancy-result':
          await handleCheckPregnancyResult(message);
          break;

        case 'birthing-camel-lactation-end':
          await handleBirthingCamelLactationEnd(message);
          break;

        default:
          console.warn("Unknown action:", message.action);
      }
    } catch (err) {
      console.error("Error processing message:", err);
      // Let FC throw to allow MNS/FC retry and DLQ handling if configured
      throw err;
    }
  }
};
