const url = require('url')
const crypto = require('crypto')
const querystring = require('querystring')
const fetch = require('@zeit/fetch-retry')(require('node-fetch'), {
  retries: 3
})

// The Firebase Admin SDK to access the FireStore DB.
const functions = require('firebase-functions')
const admin = require('firebase-admin')

const {
  getSupportedDomain,
  loadRules
} = require('./parser/utils')
const {
  collection
} = require('./constants')

const configUtils = require('./config')

const accessTradeUtils = require('./accesstrade')
const formaterUtils = require('./formater')
const {
  normalizeUrl
} = require('./formater')
const fetchUtils = require('./fetch')
const nodemailer = require('./nodemailer')
const urlHash = require('./hash')

// Setting DB
admin.initializeApp(functions.config().firebase)
var db = admin.firestore()
db.settings({
  timestampsInSnapshots: true
})

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
    .then(function (decodedToken) {
      var uid = decodedToken.uid;
      success(uid)
    }).catch(function (err) {
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

/**
 * 
 * @param {any} res 
 * @param {number} code 
 * @param {string} msg 
 */
const resError = (res, msg = 'Something went wrong', code = 400) => {
  return res.status(code).json({
    err: 1,
    code,
    msg
  })
}

/**
 * Get user info from Token
 * @param {*} idToken 
 * 
 * @returns
 *  { iss: 'https://securetoken.google.com/duyet-price-tracker',
    name: 'Van-Duyet Le',
    picture: 'https://lh4.googleusercontent.com/abc/photo.jpg',
    aud: 'duyet-price-tracker',
    auth_time: 1550891050,
    user_id: 'c2d8H4ZcUEhEiJR0jFhupWHjfoy1',
    sub: 'c2d8H4ZcUEhEiJR0jFhupWHjfoy1',
    iat: 1551441028,
    exp: 1551444628,
    email: 'lvduit08@gmail.com',
    email_verified: true,
    firebase:
    { identities: { 'google.com': [Array], email: [Array] },
      sign_in_provider: 'google.com' },
    uid: 'c2d8H4ZcUEhEiJR0jFhupWHjfoy1' }
 * 
 */
const getUserFromToken = async idToken => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    return decodedToken
  } catch (err) {
    console.error(err)
    return null
  }
}

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
  ...accessTradeUtils,

  // Get Firebase Functions env config
  ...configUtils,

  // Formater
  ...formaterUtils,

  resError,
  getUserFromToken,

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
   * Validate token, compare with pricetrack.admin_token
   * Set token by: $ firebase functions:config:set pricetrack.admin_token=<YOUR_TOKEN>
   * 
   * @param token {string} validate admin token
   * @return {bool}
   */
  validateToken: token => {
    const adminToken = configUtils.getConfig('admin_token')
    return token && adminToken === token
  },

  verifyUserTokenId,
  fetchRetry,

  ...urlHash,
  ...fetchUtils,
  ...nodemailer
}