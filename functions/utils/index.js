const url = require('url')
const crypto = require('crypto')
const normalUrl = require('normalize-url')
const querystring = require('querystring')

// The Firebase Admin SDK to access the FireStore DB.
const functions = require('firebase-functions')
const admin = require('firebase-admin')

const { getSupportedDomain, loadRules } = require('./parser/utils')
const { collection } = require('./constants')

admin.initializeApp(functions.config().firebase)
var db = admin.firestore()
db.settings({timestampsInSnapshots: true})

const ruleDir = __dirname + '/../config'
const supportedDomain = getSupportedDomain(ruleDir)
const parseRules = loadRules(ruleDir)
const domain_colors = Object.keys(parseRules)
                            .reduce((result, key) => {
                              result[key] = parseRules[key].color
                              return result
                            }, {})

const functionsUrl = process.env.FUNCTION_REGION == undefined
  ? `http://localhost:5001/duyet-price-tracker/us-central1`
  : `https://${process.env.FUNCTION_REGION}-${process.env.GCP_PROJECT}.cloudfunctions.net`

/**
 * Normalize url with default config 
 * 
 * @param u {string} URL to normalize
 * @return {string}
 */
const normalizeUrl = u => {
  const normalizeUrlConfig = {
    forceHttps: true,
    stripHash: true,
    stripWWW: true,
    removeTrailingSlash: true,
    removeQueryParameters: [/.*/] // Remove all query parameters
  }

  try {
    return normalUrl(u, normalizeUrlConfig)
  } catch(e) {
    throw new Error(e)
  }
}

/**
 * Get config from firebase config
 * config().pricetrack.<KEY>
 * 
 * @param key {string} Key to get
 * @param default_val {object}
 * @return {object}
 */
const getConfig = (key, default_val=false) => {
  const config_set = functions.config().pricetrack || {}
  return config_set[key] || default_val
}

const getSortKey = key => {
  const default_key = 'created_at'
  const validKeys = ['created_at', ]
  if (!key || validKeys.indexOf(key) == -1) return default_key
  return key
}

module.exports = {
  db,
  supportedDomain,
  parseRules,

  // List of collections
  collection,
  functionsUrl,
  domain_colors,
  normalizeUrl,
  querystring,

  // Normalize and Hash URL
  hash: u => crypto.createHash('sha1').update(normalizeUrl(u)).digest('hex'),

  // TODO: clean email
  cleanEmail: e => e,

  // Check is in supported domain
  isSupportedUrl: u => supportedDomain.indexOf(url.parse(normalizeUrl(u)).hostname) > -1,

  // Url parser
  urlParser: require('./parser/index'),

  // Get domain name
  getHostname: u => url.parse(u).hostname,

  /**
   * Make url link:
   *
   * e.g. 
   *   - url_for('/abc', {key: value})
   *   - https://domain.com/abc?key=value 
   */
  url_for: (path, qs) => {
    let query = Object
      .entries(qs)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return functionsUrl + '/' + path + '?' + query
  },

  // Get Firebase Functions env config
  getConfig,

  // redash format JSON
  // e.g. {columns: [], rows: []}
  redash_format: json_list => {
    if (!json_list.length) return { columns: [], rows: [] }
    const type_of = val => {
      let t = typeof val
      const map = {
        'object': 'string',
        'number': 'interger'
      }
      if (t in map) return map[t]
      return t
    }

    let keys = Object.keys(json_list[0])
    return {
      columns: keys.map(key => { return { name: key, type: type_of(json_list[0][key]) } }),
      rows: json_list
    }
  },

  /**
   * Return hash from url, if it already hashed, skip it
   * 
   * @param s {string} url hash or url
   * @return {string}
   */
  documentIdFromHashOrUrl: s => {
    str = String(s)
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
    console.log('adminToken', adminToken)
    return token && adminToken === token
  },

  getSortKey,
}
