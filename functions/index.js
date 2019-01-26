/**
 * Pricetrack firebase functions
 */

// List urls
exports.listUrls = require('./modules/listUrl')

// Add new URL
exports.addUrl = require('./modules/addUrl')

// Update info
exports.updateInfo = require('./modules/updateInfo')

// Get URL Info
exports.getUrl = require('./modules/getUrl')

// Subscribe to URL
exports.subscribeUrl = require('./modules/subscribeUrl')
exports.getSubscriber = require('./modules/getSubscriber')
exports.alert = require('./modules/alert')

// Delete an URL
exports.removeUrl = require('./modules/removeUrl')

// Ping
exports.ping = require('firebase-functions')
                    .runWith({ memory: '128MB' })
                    .https
                    .onRequest((req, res) => res.json({ msg: 'pong' }))

// Cronjob
exports.cronjob = require('./modules/cronjob')

// Pull price
exports.pullData = require('./modules/pullData')

// Raw Data
exports.rawData = require('./modules/rawData')

// Price series
exports.query = require('./modules/query')

// Statistics
exports.statistics = require('./modules/statistics')

// About page API
exports.about = require('./modules/about')
