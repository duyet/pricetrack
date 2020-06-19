/**
 * Pricetrack firebase functions
 */

// List urls
exports.listUrls = require('./modules/listUrl');

// Add new URL
exports.addUrl = require('./modules/addUrl')

// Update info
exports.updateInfo = require('./modules/updateInfo').function

// Get URL Info
exports.getUrl = require('./modules/getUrl')

// Subscribe to URL
exports.subscribeUrl = require('./modules/subscribeUrl')
exports.subscribe = require('./modules/subscribe')

// Alert
exports.alert = require('./modules/alert').functions
exports.alertFromQueue = require('./modules/alert').alertFromQueue

// Delete an URL
exports.removeUrl = require('./modules/removeUrl')

// Ping
exports.ping = require('firebase-functions')
    .runWith({ memory: '128MB' })
    .https
    .onRequest((req, res) => res.json({ msg: 'pong' }))

// Cronjob
exports.cronjob = require('./modules/cronjob').functions
exports.schedulerPullData = require('./modules/scheduler').pullData
exports.schedulerUpdateInfo = require('./modules/scheduler').updateInfo

// Pull price
exports.pullData = require('./modules/pullData').functions

// Raw Data
exports.rawData = require('./modules/rawData')

// Price series
exports.query = require('./modules/query')

// Statistics
exports.statistics = require('./modules/statistics')

// Cashback url
exports.cashback = require('./modules/cashback')
exports.cashbackInfo = require('./modules/cashbackInfo')

// About page API
exports.about = require('./modules/about')

// Test notification
exports.notification = require('./modules/notification')

// Update user messaging token
exports.updateMessagingToken = require('./modules/updateMessagingToken')

// Redirect
exports.redirect = require('./modules/redirect')

// Admin api
exports.adminData = require('./modules/adminData')
exports.onNewUser = require('./modules/onNewUser')
