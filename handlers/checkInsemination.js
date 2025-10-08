const { updateWithRetry, findOne } = require('../utils/mongo');
const { sendMessage } = require('../utils/mns');
const { sendPush } = require('../utils/fcm');

async function handleCheckInseminationResult(message) {
  const { processId, animalId, userId, androidDeviceId, iphoneDeviceId } = message;

  // read process
  const proc = await findOne('inseminations', { _id: processId });

  // business logic: determine result (example)
  const result = (proc && proc.simulatedInseminationResult) ? proc.simulatedInseminationResult : 'success';

  await updateWithRetry('inseminations', { _id: processId }, { result, checkedAt: new Date().toISOString() });

  // notify user
  await sendPush({
    androidId: androidDeviceId,
    iphoneId: iphoneDeviceId,
    title: 'Insemination Result',
    body: `Insemination result for animal ${animalId}: ${result}`
  });

  if (result === 'success') {
    // schedule pregnancy check
    const nextAction = 'check-pregnancy-result';
    const pregnancyEnd = proc && proc.pregnancyEnd ? proc.pregnancyEnd : new Date(Date.now() + 30*24*60*60*1000).toISOString();
    const delaySeconds = Math.max(0, Math.floor((new Date(pregnancyEnd) - new Date()) / 1000));

    const payload = {
      action: nextAction,
      processId,
      animalId,
      userId,
      androidDeviceId,
      iphoneDeviceId
    };

    await sendMessage(process.env.MNS_QUEUE_NAME, payload, delaySeconds);
    console.log('Scheduled pregnancy check in', delaySeconds, 'seconds');
  } else {
    console.log('Insemination failed. No further scheduling.');
  }
}

module.exports = { handleCheckInseminationResult };
