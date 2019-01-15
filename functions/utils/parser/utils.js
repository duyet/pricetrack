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
 * Node fetch to get json or html
 * @param {string}    url  [description]
 * @param  {Boolean}  json [description]
 * @return {any}      [description]
 */
const fetchContent = async (url, json = false) => {
    try {
        const options = {
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
        if (json) return await response.json()

        return await response.text()
    } catch (error) {
        console.error(error)
        return false
    }
}


/**
 * Parse URL by regex
 * @param u {string}
 * @param regex {regex}
 * @param pos {number}
 * @return {string}
 */
const regexProcess = (u, regex, pos=null) => {
    try {
        console.log(`Parse ${u} with regex ${regex}`)
        const provider = getProvider(u)
        const pathname = url.parse(u).pathname
        const parsePathname = pathname.match(regex)

        if (pos !== null) return regexProcess[pos]
        return parsePathname
    } catch (e) {
        console.error(e)
        return null
    }
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

    if (config.required) {
        if (
            (!product_id && config.required.indexOf('productId') > -1) ||
            (!shop_id && config.required.indexOf('shopId') > -1)
        ) return cb_error('Cannot get productId or shopId, which required!')
    }

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
        return cb(config.format_func(json))
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

const getData = async (url, config) => {
    try {
        const json = await fetchContent(url, true)
        return config.product_info(json)
    } catch (error) {
        console.error(error)
        return false
    }
}

const validateUrlPath = u => {
    const domain = getProvider(u)
    const ruleDir = __dirname + '/../../config'
    const config = loadRules(ruleDir)[domain]

    const product_id = config.productId(u)
    const shop_id = config.shopId(u)

    if (config.required) {
        if (!product_id && config.required.indexOf('productId') > -1) return false
        if (!shop_id && config.required.indexOf('shopId') > -1) return false
    }

    return true
}

/**
 * Get product info from URL
 * 
 * @param u {string} url
 * @return {object}
 */
const getProductInfoFromUrl = async (u) => {
    const domain = getProvider(u)
    const ruleDir = __dirname + '/../../config'
    const config = loadRules(ruleDir)[domain]

    const product_id = config.productId(u)
    const shop_id = config.shopId(u)

    // Using API
    if (typeof config.product_info_api == 'string') {
        const product_info_api = config.product_info_api
            .replace('{product_id}', product_id)
            .replace('{shop_id}', shop_id)

        if (!product_id) {
            return false
        }

        const data = await getData(product_info_api, config)
        return data
    }

    // Using functions
    else if (typeof config.product_info_api == 'function') {
        const getFunc = config.product_info_api
        const params = { product_id, shop_id }
        return getFunc(params)
    }

    console.error('config.product_info_api is not supported')
    return {}
}

module.exports = {
    loadRules,
    getProvider,
    fetchContent,
    regexProcess,
    validateUrlPath,
    parseUrlWithConfig,
    getSupportedDomain,
    getProductInfoFromUrl
}