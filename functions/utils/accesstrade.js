const { getConfig } = require('./config')

const getDeepLink = (url, qs = {utm_source: 'pricetrack'}) => {
    const baseUrl = getConfig('accesstrade_deeplink_base')
    if (!baseUrl) {
        console.error('Please set variable: pricetrack.accesstrade_deeplink_base'
                        + ' to use accessTrade Deep link')
        return url
    }

    qs = {
        url,
        ...qs
    }

    let query = Object
      .entries(qs)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')

    return baseUrl + '?' + query
}


module.exports = {
    getDeepLink
}