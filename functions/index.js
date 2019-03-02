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
exports.subscribe = require('./modules/subscribe')
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

// Test notification
exports.notification = require('./modules/notification')

// Update user messaging token
exports.updateMessagingToken = require('./modules/updateMessagingToken')

// Redirect
exports.redirect = require('./modules/redirect')

// Admin api
exports.onlyAdminData = require('./modules/onlyAdminData')
