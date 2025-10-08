const { updateWithRetry, findOne } = require('../utils/mongo');
const { sendMessage } = require('../utils/mns');
const { sendPush } = require('../utils/fcm');

async function handleCheckPregnancyResult(message) {
  const { processId, animalId, userId, androidDeviceId, iphoneDeviceId } = message;

  const proc = await findOne('inseminations', { _id: processId });

  const pregnancyResult = (proc && proc.simulatedPregnancyResult) ? proc.simulatedPregnancyResult : 'success';

  await updateWithRetry('inseminations', { _id: processId }, { pregnancyResult, pregnancyCheckedAt: new Date().toISOString() });

  await sendPush({
    androidId: androidDeviceId,
    iphoneId: iphoneDeviceId,
    title: 'Pregnancy Checked',
    body: `Pregnancy result for animal ${animalId}: ${pregnancyResult}`
  });

  if (pregnancyResult === 'success') {
    const nextAction = 'birthing-camel-lactation-end';
    const lactationEnd = proc && proc.lactationEnd ? proc.lactationEnd : new Date(Date.now() + 60*24*60*60*1000).toISOString();
    const delaySeconds = Math.max(0, Math.floor((new Date(lactationEnd) - new Date()) / 1000));

    const payload = {
      action: nextAction,
      processId,
      animalId,
      userId,
      androidDeviceId,
      iphoneDeviceId
    };

    await sendMessage(process.env.MNS_QUEUE_NAME, payload, delaySeconds);
    console.log('Scheduled lactation end in', delaySeconds, 'seconds');
  } else {
    console.log('Pregnancy failed. No further scheduling.');
  }
}

module.exports = { handleCheckPregnancyResult };
