const functions = require('firebase-functions')
const {
    getConfig,
    urlFor,
} = require('../utils');
const axios = require('axios')

const CRONJOB_KEY = getConfig('cronjob_key')

const triggerCronjobTask = (task) => async () => {
    console.log('Run every 15 minutes!');

    let triggerUrl = urlFor(`cronjob`, {
        key: CRONJOB_KEY,
        task: task,
        region: 'asia'
    })

    console.log('Trigger URL', triggerUrl)
    const res = await axios.get(triggerUrl)
    console.log('Cronjob:', res)
}


module.exports.pullData = functions.pubsub.schedule('every 15 minutes').onRun(triggerCronjobTask('pullData'));
module.exports.updateInfo = functions.pubsub.schedule('every 15 minutes').onRun(triggerCronjobTask('updateInfo'));
