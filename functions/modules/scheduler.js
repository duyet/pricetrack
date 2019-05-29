const assert = require('assert')
const functions = require('firebase-functions')
const {
    getConfig,
    urlFor,
} = require('../utils');
const axios = require('axios')

const CRONJOB_KEY = getConfig('cronjob_key')

module.exports = functions.pubsub.schedule('every 15 minutes').onRun(async (ctx) => {
    console.log('Run every 15 minutes!');

    let triggerUrl = urlFor(`cronjob`, {
        key: CRONJOB_KEY,
        region: 'asia'
    })

    const res = await axios.get(triggerUrl)
    console.log('Cronjob:', res)
});