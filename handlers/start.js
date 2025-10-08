const { updateWithRetry, findOne } = require('../utils/mongo');
const { sendMessage } = require('../utils/mns');
const { sendPush } = require('../utils/fcm');

async function handleStartInsemination(message) {
  const { processId, animalId, userId, androidDeviceId, iphoneDeviceId, inseminationEnd } = message;

  // update DB: mark started
  await updateWithRetry('inseminations', { _id: processId }, { status: 'started', inseminationEnd });

  // notify user
  await sendPush({
    androidId: androidDeviceId,
    iphoneId: iphoneDeviceId,
    title: 'Insemination Started',
    body: `Insemination started for animal ${animalId}`
  });

  // schedule next action
  const nextAction = 'check-insemination-result';
  const delaySeconds = Math.max(0, Math.floor((new Date(inseminationEnd) - new Date()) / 1000));

  const payload = {
    action: nextAction,
    processId,
    animalId,
    userId,
    androidDeviceId,
    iphoneDeviceId
  };

  await sendMessage(process.env.MNS_QUEUE_NAME, payload, delaySeconds);
  console.log('Scheduled next action:', nextAction, 'in', delaySeconds, 'seconds');
}

module.exports = { handleStartInsemination };
