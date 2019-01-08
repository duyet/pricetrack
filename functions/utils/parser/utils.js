const fs = require('fs')
const url = require('url')
const path = require('path')
const fetch = require('node-fetch')

/**
 * Get domain name
 * 
 * @param u {string} url
 * @return {string} domain name of url
 */
const getProvider = u => url.parse(u).hostname

/**
 * Parse URL by regex
 * @param u {string}
 * @param regex {regex}
 * @return {string}
 */
const regexProcess = (u, regex) => {
  console.log(`Parse ${u} with regex ${regex}`)
  const provider = getProvider(u)
  const pathname = url.parse(u).pathname
  const parsePathname = pathname.match(regex)

  return parsePathname
}

/**
 * Parse URL by config
 * 
 * @param u {string}
 * @param config {object}
 * @param cb {Function}
 * @param cb_error {Function}
 */
const parseUrlWithConfig = (u, config, cb, cb_error) => {
  const product_id = config.productId(u)
  const shop_id = config.shopId(u)
  const product_api = config.product_api
    .replace('{product_id}', product_id)
    .replace('{shop_id}', shop_id)

  console.log('Product ID:', product_id)
  console.log('Product API:', product_api)

  if (!product_id) {
    return cb_error('Cannot parse product id')
  }

  const options = {
    'credentials': 'include',
    'headers': {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8,ja;q=0.7,de;q=0.6',
      'Cache-Control': 'max-age=0',
      'upgrade-insecure-requests': '1',
      'Referer': 'https://www.google.com/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    }
  }

  const cb_wrapper = (json) => {
    console.log('Product JSON:', json)
    if (config.format_func) return cb(config.format_func(json))
    return cb(json)
  }

  // TODO: sync function
  fetch(product_api, options)
    .then(res => res.json())
    .then(json => cb_wrapper(json))
    .catch(err => cb_error(err))
}

/**
 * Get list rules
 * @param dir {string} dir contains rules
 * @return {objects}
 */
const getRuleProviders = dir => {
    if (!fs.lstatSync(dir).isDirectory()) return dir;

    let providers = fs.readdirSync(dir)
                      .map(f => getRuleProviders(path.join(dir, f)))

    return providers
}

const loadRules = dir => {
  let rules = getRuleProviders(dir)
  let config = {}
  rules.map(filename => {
    let provider = path.parse(filename).name
    config[provider] = require(filename)
  })

  return config
}

/**
 * Get supported domain 
 * 
 * @param dir {string}
 * @return {array} List of domain name
 */
const getSupportedDomain = dir => {
  let rules = getRuleProviders(dir)
  return rules.map(filename => path.parse(filename).name)
}

/**
 * Get product info from URL
 * 
 * @param u {string} url
 * @return {object}
 */
const getProductInfoFromUrl = async (u) => {
  const domain = getProvider(u)
  const ruleDir = __dirname + '/rules'
  const config = loadRules(ruleDir)[domain]

  const product_id = config.productId(u)
  const shop_id = config.shopId(u)
  const product_info_api = config.product_info_api
    .replace('{product_id}', product_id)
    .replace('{shop_id}', shop_id)

  if (!product_id) {
    return false
  }

  const getData = async url => {
    try {
      const options = {
        'credentials': 'include',
        'headers': {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8,ja;q=0.7,de;q=0.6',
          'Cache-Control': 'max-age=0',
          'upgrade-insecure-requests': '1',
          'Referer': 'https://www.google.com/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
        }
      }
      const response = await fetch(url, options)
      const json = await response.json()
      return json
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const data = await getData(product_info_api)
  return data
}

module.exports = {
  loadRules,
  getProvider,
  regexProcess,
  parseUrlWithConfig,
  getSupportedDomain,
  getProductInfoFromUrl
}