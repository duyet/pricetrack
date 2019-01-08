const url = require('url')
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

const ruleDir = __dirname + '/parser/rules'
const supportedDomain = getSupportedDomain(ruleDir)
const parseRules = loadRules(ruleDir)
const domain_colors = Object.keys(parseRules)
                            .reduce((result, key) => {
                              result[key] = parseRules[key].color
                              return result
                            }, {})

const functions_url = process.env.FUNCTION_REGION == undefined
  ? `http://localhost:5000/duyet-price-tracker/us-central1`
  : `https://${process.env.FUNCTION_REGION}-${process.env.GCP_PROJECT}.cloudfunctions.net`

const normalizeUrlConfig = {
  forceHttps: true,
  stripHash: true,
  stripWWW: true,
  removeTrailingSlash: true,
  removeQueryParameters: [/.*/] // Remove all query parameters
}
const normalizeUrl = u => normalUrl(u, normalizeUrlConfig)

module.exports = {
  db,
  supportedDomain,
  parseRules,

  // List of collections
  collection,
  functions_url,
  domain_colors,
  normalizeUrl: normalizeUrl,
  querystring,

  // Normalize and Hash URL
  hash: u => require('crypto').createHash('sha1').update(normalizeUrl(u)).digest('hex'),

  // TODO: clean email
  cleanEmail: e => e,

  // Check is in supported domain
  isSupportedUrl: u => supportedDomain.indexOf(url.parse(normalizeUrl(u)).hostname) > -1,

  // Url parser
  url_parser: require('./parser/index'),

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
    return functions_url + '/' + path + '?' + query
  },

  // Get Firebase Functions env config
  get_config: (key, default_val=false) => {
  	const config_set = functions.config().pricetrack || {}
  	return config_set[key] || default_val
  },

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
  }
}
