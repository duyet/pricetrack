const url = require('url')
const crypto = require('crypto')
const querystring = require('querystring')
const fetch = require('@zeit/fetch-retry')(require('node-fetch'), {retries: 3})

// The Firebase Admin SDK to access the FireStore DB.
const functions = require('firebase-functions')
const admin = require('firebase-admin')

const { getSupportedDomain, loadRules } = require('./parser/utils')
const { collection } = require('./constants')

const { getConfig, getSortKey, functionsUrl, functionsUrlAsia,
        hostingUrl, IS_PROD } = require('./config')

const { getDeepLink } = require('./accesstrade')

const { normalizeUrl, hash, formatPrice, cleanEmail, 
        urlParser, url_for, redashFormat } = require('./formater')

// Setting DB
admin.initializeApp(functions.config().firebase)
var db = admin.firestore()
db.settings({timestampsInSnapshots: true})

// Setting functions region
const httpsFunctions = functions.https
const asiaRegion = 'asia-northeast1'

const ruleDir = __dirname + '/../config'
const supportedDomain = getSupportedDomain(ruleDir)
const parseRules = loadRules(ruleDir)
const domainColors = Object.keys(parseRules)
                            .reduce((result, key) => {
                              result[key] = parseRules[key].color
                              return result
                            }, {})
const domainLogos = Object.keys(parseRules)
                            .reduce((result, key) => {
                              result[key] = parseRules[key].logo
                              return result
                            }, {})

/**
 * Verify User Token (Google Token)
 * @param  {string} token.    Token to verify
 * @param  {function} success success callback function
 * @param  {function} error   error callback function
 */
const verifyUserTokenId = (token, success, error) => {
  admin.auth().verifyIdToken(idToken)
    .then(function(decodedToken) {
      var uid = decodedToken.uid;
      success(uid)
    }).catch(function(err) {
      error(err)
    })
}

/**
 * Node fetch with retry
 * @param  {string} url
 * @param  {object} options
 * @return {[type]} fetch object
 */
const fetchRetry = (url, options) => fetch(url, options)

module.exports = {
  db,
  httpsFunctions,
  asiaRegion,
  supportedDomain,
  parseRules,

  // List of collections
  collection,
  domainColors,
  domainLogos,
  querystring,

  // Accesstrade deeplink
  getDeepLink,

  // Get Firebase Functions env config
  getConfig,
  functionsUrl,
  functionsUrlAsia,
  hostingUrl,
  IS_PROD,

  // Formater
  normalizeUrl,
  hash,
  formatPrice,
  cleanEmail,
  urlParser,
  url_for,
  redashFormat,

  // Check is in supported domain
  isSupportedUrl: u => supportedDomain.indexOf(url.parse(normalizeUrl(u)).hostname) > -1,

  domainOf: u => {
    let parsed = url.parse(normalizeUrl(u))
    if (!parsed) return ''
    return parsed.hostname || ''
  },

  // Get domain name
  getHostname: u => url.parse(u).hostname,

  /**
   * Return hash from url, if it already hashed, skip it
   * 
   * @param s {string} url hash or url
   * @return {string}
   */
  documentIdFromHashOrUrl: s => {
    let str = String(s)
    return (/^[a-fA-F0-9]+$/).test(s) 
              ? s 
              : crypto.createHash('sha1').update(normalizeUrl(str)).digest('hex')
  },

  /**
   * Validate token, compare with pricetrack.admin_token
   * Set token by: $ firebase functions:config:set pricetrack.admin_token=<YOUR_TOKEN>
   * 
   * @param token {string} validate admin token
   * @return {bool}
   */
  validateToken: token => {
    const adminToken = getConfig('admin_token')
    return token && adminToken === token
  },

  getSortKey,
  verifyUserTokenId,
  fetchRetry
}
