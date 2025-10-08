const { updateWithRetry } = require('../utils/mongo');
const { sendPush } = require('../utils/fcm');

async function handleBirthingCamelLactationEnd(message) {
  const { processId, animalId, androidDeviceId, iphoneDeviceId } = message;

  await updateWithRetry('inseminations', { _id: processId }, { lactationEnded: true, lactationEndedAt: new Date().toISOString() });

  await sendPush({
    androidId: androidDeviceId,
    iphoneId: iphoneDeviceId,
    title: 'Lactation Period Ended',
    body: `Lactation period ended for animal ${animalId}`
  });

  console.log('Completed lactation end flow for', processId);
}

module.exports = { handleBirthingCamelLactationEnd };
