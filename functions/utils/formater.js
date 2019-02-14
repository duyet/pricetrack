const crypto = require('crypto')
const normalUrl = require('normalize-url')

const pullProductDataFromUrl = require('./parser/index')
const { functionsUrl, functionsUrlAsia } = require('./config')

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
    u = decodeURIComponent(u)
    console.log('Decoded', u)
  } catch (e) {
    console.log(`decodeURIComponent ${u} ${e}`)
  }

  try {
    return normalUrl(u, normalizeUrlConfig)
  } catch(e) {
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
const cleanEmail = e => e


/**
 * Make url link:
 *
 * e.g. 
 *   - urlFor('/abc', {key: value})
 *   - https://domain.com/abc?key=value 
 */
const urlFor = (path, qs) => {
  let query = Object
    .entries(qs)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  if (qs.hasOwnProperty('region') && qs.region.indexOf('asia') > -1) {
    return functionsUrlAsia + '/' + path + '?' + query
  }

  return functionsUrl + '/' + path + '?' + query
}



// redash format JSON
// e.g. {columns: [], rows: []}
const redashFormat = json_list => {
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


module.exports = {
  redashFormat,
  normalizeUrl,
  formatPrice,
  cleanEmail,
  pullProductDataFromUrl,
  urlFor,
  hash
}