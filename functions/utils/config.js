const functions = require('firebase-functions')

/**
 * Get config from firebase config
 * config().pricetrack.<KEY>
 * 
 * @param key {string} Key to get
 * @param default_val {object}
 * @return {object}
 */
const getConfig = (key, default_val=false) => {
  const configSet = functions.config().pricetrack || {}
  return configSet[key] || default_val
}

/**
 * Get sort key from req.params
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
const getSortKey = key => {
  const defaultKey = 'created_at'
  const validKeys = ['created_at', 'last_pull_at', 'created_at', 
                     'last_update_at', 'price_change', 'price_change_at']
  if (!key || validKeys.indexOf(key) == -1) return defaultKey
  return key
}


const IS_PROD = process.env.FUNCTION_TARGET ? true : false
console.log(`IS_PROD: ${IS_PROD} `
            + `FUNCTION_TARGET="${process.env.FUNCTION_TARGET}" `
            + `K_SERVICE="${process.env.K_SERVICE}"`)

/**
 * Firebase functions url
 * @type {[type]}
 */
const functionsUrl = !IS_PROD
  ? `http://localhost:5001/duyet-price-tracker/us-central1`
  : `https://us-central1-${process.env.FUNCTION_TARGET}.cloudfunctions.net`
const functionsUrlAsia = !IS_PROD
  ? `http://localhost:5001/duyet-price-tracker/us-central1`
  : `https://asia-northeast1-${process.env.FUNCTION_TARGET}.cloudfunctions.net`


/**
 * Hosting root url
 * @type {[type]}
 */
const hostingUrl = !IS_PROD
  ? `http://localhost:8000`
  : getConfig('hosting_url', 'https://tracker.duyet.net')


module.exports = {
    getConfig,
    getSortKey,
    functionsUrl,
    functionsUrlAsia,
    hostingUrl,
    IS_PROD
}