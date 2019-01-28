const functions = require('firebase-functions')

const IS_PROD = process.env.GCP_PROJECT && process.env.FUNCTION_REGION ? true : false
console.log(`IS_PROD: ${IS_PROD} `
            + `GCP_PROJECT="${process.env.GCP_PROJECT}" `
            + `FUNCTION_REGION="${process.env.FUNCTION_REGION}"`)

/**
 * Firebase functions url
 * @type {[type]}
 */
const functionsUrl = !IS_PROD
  ? `http://localhost:5001/duyet-price-tracker/us-central1`
  : `https://${process.env.FUNCTION_REGION}-${process.env.GCP_PROJECT}.cloudfunctions.net`
const functionsUrlAsia = !IS_PROD
  ? `http://localhost:5001/duyet-price-tracker/us-central1`
  : `https://asia-northeast1-${process.env.GCP_PROJECT}.cloudfunctions.net`


/**
 * Hosting root url
 * @type {[type]}
 */
const hostingUrl = !IS_PROD
  ? `http://localhost:8000`
  : getConfig('hosting_url', 'https://tracker.duyet.net')


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

/**
 * Get sort key from req.params
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
const getSortKey = key => {
  const default_key = 'created_at'
  const validKeys = ['created_at', 'last_pull_at', 'created_at', 
                     'last_update_at', 'price_change', 'price_change_at']
  if (!key || validKeys.indexOf(key) == -1) return default_key
  return key
}



module.exports = {
    getConfig,
    getSortKey,
    functionsUrl,
    functionsUrlAsia,
    hostingUrl,
    IS_PROD
}