const crypto = require('crypto')
const {
  URL,
  resolve,
  URLSearchParams
} = require('url')
const normalUrl = require('normalize-url')

const pullProductDataFromUrl = require('./parser/index')
const {
  functionsUrl,
  functionsUrlAsia,
  hostingUrl
} = require('./config')

const {
  URL_PARAMS_WHITELIST
} = require('./constants')


/**
 * Normalize url with default config 
 * 
 * @param u {string} URL to normalize
 * @return {string}
 */
const normalizeUrl = (u, paramsWhitelist = []) => {
  let whitelist = [
    ...URL_PARAMS_WHITELIST,
    ...paramsWhitelist
  ]

  const normalizeUrlConfig = {
    forceHttps: true,
    stripHash: true,
    stripWWW: true,
    removeTrailingSlash: true,
    removeQueryParameters: [/.*/] // Remove all query parameters
  }

  try {
    u = decodeURIComponent(u)
  } catch (e) {
    console.log(`Fail decodeURIComponent ${u} ${e}`)
  }

  try {
    // Keep whitelist params
    let urlObj = new URL(u)
    let params = new URLSearchParams()
    whitelist.filter(key => !!urlObj.searchParams.get(key))
             .map(key => params.set(key, urlObj.searchParams.get(key)))
    params.sort()

    let paramString = params.toString() ? `?${params.toString()}` : ''
    return resolve(normalUrl(u, normalizeUrlConfig), paramString)
  } catch (e) {
    console.error(`Error parse url=${u}, ${e}`)
    throw new Error(e)
  }
}

// Normalize and Hash URL
const hash = u => crypto.createHash('sha1').update(normalizeUrl(u)).digest('hex')

/**
 * Format price
 * @param  {[type]}  price     [description]
 * @param  {Boolean} plus_sign [description]
 * @param  {String}  currency  [description]
 * @return {[type]}            [description]
 */
const formatPrice = (price, plus_sign = false, currency = 'VND') => {
  if (!price) return ''
  let sign = plus_sign && price > 0 ? '+' : ''
  return sign + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + currency
}


/**
 * Clean email address
 * TODO
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
const cleanEmail = e => String(e).trim()


/**
 * Make url link:
 *
 * e.g. 
 *   - urlFor('/abc', {key: value})
 *   - https://domain.com/abc?key=value 
 */
const urlFor = (path, qs = {}) => {
  let query = Object
    .entries(qs)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  if (qs.hasOwnProperty('region') && qs.region.indexOf('asia') > -1) {
    return functionsUrlAsia + '/' + path + '?' + query
  }
  if (qs.hasOwnProperty('frontend') || qs.hasOwnProperty('hosting_url')) {
    return hostingUrl + '/' + path + '?' + query
  }

  return functionsUrl + '/' + path + '?' + query
}


// redash format JSON
// e.g. {columns: [], rows: []}
const redashFormat = json_list => {
  if (!json_list.length) return {
    columns: [],
    rows: []
  }
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
    columns: keys.map(key => {
      return {
        name: key,
        type: type_of(json_list[0][key])
      }
    }),
    rows: json_list
  }
}


module.exports = {
  redashFormat,
  normalizeUrl,
  formatPrice,
  cleanEmail,
  pullProductDataFromUrl,
  urlFor,
  hash
}