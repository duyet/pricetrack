const fs = require('fs')
const url = require('url')
const path = require('path')
const fetch = require('node-fetch')

const getProvider = u => url.parse(u).hostname

const regexProcess = (u, regex) => {
  console.log(`Parse ${u} with regex ${regex}`)
  const provider = getProvider(u)
  const pathname = url.parse(u).pathname
  const parsePathname = pathname.match(regex)

  return parsePathname
}

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

  fetch(product_api, options)
    .then(res => res.json())
    .then(json => cb_wrapper(json))
    .catch(err => cb_error(err))
}

const getRules = dir => {
    if (!fs.lstatSync(dir).isDirectory()) return dir;

    let providers = fs.readdirSync(dir)
                      .map(f => getRules(path.join(dir, f)))

    return providers
}

const loadRules = dir => {
  let rules = getRules(dir)
  let config = {}
  rules.map(filename => {
    let provider = path.parse(filename).name
    config[provider] = require(filename)
  })

  return config
}

const getSupportedDomain = dir => {
  let rules = getRules(dir)
  return rules.map(filename => path.parse(filename).name)
}

module.exports = {
  loadRules,
  getProvider,
  regexProcess,
  parseUrlWithConfig,
  getSupportedDomain
}