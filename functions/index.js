// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions')

// Lib
const utils = require('./utils')
const config = require('./config')
const { db, functions_url } = utils

// List urls
exports.listUrls = require('./modules/listUrl')

// Add new URL
exports.addUrl = require('./modules/addUrl')

// Subscribe to URL
exports.subscribeUrl = require('./modules/subscribeUrl')

// Delete an URL
exports.removeUrl = require('./modules/removeUrl')

// Ping
exports.ping = functions.runWith({ memory: '128MB' })
  .https.onRequest((req, res) => res.json({ msg: 'pong' }))

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
