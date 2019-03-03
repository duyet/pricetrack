const fs = require('fs')
const url = require('url')
const path = require('path')
const fetch = require('@zeit/fetch-retry')(require('node-fetch'))

let SUPPORTED_DOMAIN = []

const getCrawlerHttpHeaderOptions = () => {
    var UAs = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4",
      "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0",
      "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:53.0) Gecko/20100101 Firefox/53.0",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:53.0) Gecko/20100101 Firefox/53.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:53.0) Gecko/20100101 Firefox/53.0",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
      "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:53.0) Gecko/20100101 Firefox/53.0",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.104 Safari/537.36",
      "Mozilla/5.0 (Windows NT 6.1; rv:53.0) Gecko/20100101 Firefox/53.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.2.5 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.5",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/58.0.3029.110 Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
      "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15063",
      "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64; rv:53.0) Gecko/20100101 Firefox/53.0"
    ]
    var Referers = [
        'https://www.google.com/',
        'https://bing.com',
        'https://coccoc.vn',
        'https://vnexpress.vn'
    ]

    return {
        redirect: 'follow',
        'headers': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8,ja;q=0.7,de;q=0.6',
            'Cache-Control': 'max-age=0',
            'upgrade-insecure-requests': '1',
            'Referer': Referers[Math.floor(Math.random() * Referers.length)],
            'User-Agent': UAs[Math.floor(Math.random() * UAs.length)]
        }
    }
}

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
        const options = getCrawlerHttpHeaderOptions()
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
        const pathname = url.parse(u).pathname
        const parsePathname = pathname.match(regex)

        if (pos !== null) return parsePathname[pos]
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
const parseUrlWithConfig = async (u, config) => {
    const productId = config.productId(u)
    const shopId = config.shopId(u)

    if (config.required) {
        if (
            (!productId && config.required.indexOf('productId') > -1) ||
            (!shopId && config.required.indexOf('shopId') > -1)
        )
            throw Error('Cannot get productId or shopId, which required!')
    }

    // product_api: https:// .....{productId}/{shopId}
    if (typeof config.product_api == 'string') {
        const productApi = config.product_api
            .replace('{product_id}', productId)
            .replace('{shop_id}', shopId)

        const options = getCrawlerHttpHeaderOptions()
        const response = await fetch(productApi, options)
        const json = await response.json()
        return config.format_func(json)
    }

    // Using functions
    else if (typeof config.product_api == 'function') {
        const getFunc = config.product_api
        const params = { url: u, productId, shopId }
        let json = await getFunc(params)
        return config.format_func(json)
    }

    throw Error('config.product_info_api is not supported')
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
    if (SUPPORTED_DOMAIN.length) return SUPPORTED_DOMAIN

    let rules = getRuleProviders(dir)
    SUPPORTED_DOMAIN = rules.map(filename => {
        let rule = require(filename)
        if (rule && rule.active) return rule.domain
        else return false
    }).filter(domain => !!domain)

    return SUPPORTED_DOMAIN
}

const getData = async (url, config) => {
    try {
        const json = await fetchContent(url, true)
        return json
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

    console.log(`Parse ${u} => product_id=${product_id} shop_id=${shop_id}`)

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
        return config.format_product_info(data)
    }

    // Using functions
    else if (typeof config.product_info_api == 'function') {
        const getFunc = config.product_info_api
        const params = { url: u, product_id, shop_id }
        const data = await getFunc(params)
        return config.format_product_info(data)
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
    getProductInfoFromUrl,
}