const url = require('url')
const normalizeUrl = require('normalize-url')
const querystring = require('querystring')

// The Firebase Admin SDK to access the FireStore DB.
const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase)
var db = admin.firestore()

const functions_url = process.env.FUNCTION_LOCAL
  ? `http://localhost:5000/duyet-price-tracker/us-central1`
  : `https://${process.env.FUNCTION_REGION}-${process.env.GCP_PROJECT}.cloudfunctions.net`

const supported_domain = ['tiki.vn', 'shopee.vn']

const domain_colors = {
  'tiki.vn': '#189eff',
  'shopee.vn': '#ff531d'
}

const collection = {
  URLS: 'urls',
  RAW_DATA: 'raw_data'
}

module.exports = {
  db,
  supported_domain,
  collection,
  functions_url,
  domain_colors,
  normalizeUrl,
  querystring,
  hash: u => require('crypto').createHash('sha1').update(normalizeUrl(u)).digest('hex'),

  isSupportedUrl: u => supported_domain.indexOf(url.parse(normalizeUrl(u)).hostname) > -1,

  url_parser: require('./parser/index'),

  getHostname: u => url.parse(u).hostname,

  url_for: (path, qs) => {
    let query = Object
      .entries(qs)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return functions_url + '/' + path + '?' + query
  },

  get_config: (key, default_val=false) => {
  	const config_set = functions.config().pricetrack || {}
  	return config_set[key] || default_val
  },

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
